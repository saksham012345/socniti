const mongoose = require("mongoose");

const notificationPreferencesSchema = new mongoose.Schema(
  {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    phone: { type: String, trim: true, unique: true, sparse: true },
    passwordHash: { type: String },
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user"
    },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    interests: [{ type: String }],
    attendedEvents: [{ type: String }],
    upcomingEvents: [{ type: String }],
    donationHistory: [{ type: String }],
    feedbackHistory: [{ type: String }],
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({})
    },
    organizationName: { type: String, default: "" },
    organizationDescription: { type: String, default: "" },
    verificationDocumentUrl: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
    otpCode: { type: String },
    otpExpiresAt: { type: Date },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
