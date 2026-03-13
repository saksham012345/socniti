const jwt = require("jsonwebtoken");

const signToken = (user) =>
  jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email || null,
      phone: user.phone || null
    },
    process.env.JWT_SECRET || "development_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

module.exports = {
  signToken
};
