const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const { signToken } = require("../services/tokenService");

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  interests: user.interests,
  attendedEvents: user.attendedEvents,
  upcomingEvents: user.upcomingEvents,
  donationHistory: user.donationHistory,
  feedbackHistory: user.feedbackHistory,
  notificationPreferences: user.notificationPreferences,
  organizationName: user.organizationName,
  organizationDescription: user.organizationDescription,
  verificationDocumentUrl: user.verificationDocumentUrl,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt
});

const issueAuthResponse = async (user, res) => {
  user.lastLoginAt = new Date();
  await user.save();

  return res.json({
    token: signToken(user),
    user: sanitizeUser(user)
  });
};

const register = async (req, res) => {
  const { fullName, email, phone, password, role = "user", organizationName } = req.body;

  if (!email && !phone) {
    return res.status(400).json({ message: "Email or phone is required" });
  }

  const identityChecks = [];
  if (email) identityChecks.push({ email });
  if (phone) identityChecks.push({ phone });

  const existingUser = identityChecks.length ? await User.findOne({ $or: identityChecks }) : null;

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
  const otpCode = phone ? generateOtp() : undefined;

  const user = await User.create({
    fullName,
    email,
    phone,
    passwordHash,
    role,
    organizationName: role === "organizer" ? organizationName || "" : "",
    otpCode,
    otpExpiresAt: otpCode ? new Date(Date.now() + 5 * 60 * 1000) : undefined
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: "Welcome to SOCNITI",
      html: `<p>Your account has been created${otpCode ? ` and your OTP is <strong>${otpCode}</strong>` : ""}.</p>`
    });
  }

  return res.status(201).json({
    message: otpCode ? "Account created. OTP generated for phone verification." : "Account created",
    user: sanitizeUser(user)
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return issueAuthResponse(user, res);
};

const sendOtp = async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ phone });
  }

  user.otpCode = generateOtp();
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await user.save();

  return res.json({
    message: "OTP generated",
    otpPreview: process.env.NODE_ENV === "development" ? user.otpCode : undefined
  });
};

const verifyOtp = async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone });
  if (!user || user.otpCode !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.otpCode = undefined;
  user.otpExpiresAt = undefined;

  return issueAuthResponse(user, res);
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user: sanitizeUser(user) });
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const fields = [
    "fullName",
    "avatarUrl",
    "bio",
    "interests",
    "notificationPreferences",
    "organizationName",
    "organizationDescription",
    "verificationDocumentUrl"
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (req.body.email && req.body.email !== user.email) {
    user.email = req.body.email;
    user.isEmailVerified = false;
  }

  await user.save();

  return res.json({
    message: "Profile updated",
    user: sanitizeUser(user)
  });
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  getProfile,
  updateProfile
};
