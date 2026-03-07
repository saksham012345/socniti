const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");

exports.sendOTP = async (req, res) => {
  const { phone } = req.body;

  const otp = generateOTP();

  let user = await User.findOne({ phone });

  if (!user) user = new User({ phone });

  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;

  await user.save();

  console.log("OTP:", otp);

  res.json({ message: "OTP sent" });
};

exports.verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  const user = await User.findOne({ phone });

  if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.otp = null;
  await user.save();

  res.json({ message: "Login successful" });
};