const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const connectDB = require("./src/config/db");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();
const otpStore = {};
function authenticateToken(req, res, next) {

  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Token missing"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

    if (err) {
      return res.status(403).json({
        message: "Invalid token"
      });
    }

    req.user = user;

    next();

  });

}
function authorizeRole(role) {

  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "User not authenticated"
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        message: "Access denied"
      });
    }

    next();

  };

}

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});
const generateOTP = require("./src/utils/generateOTP");
const transporter = require("./src/utils/sendEmail");

app.post("/send-otp", async (req, res) => {

  const { email } = req.body;
  const otp = generateOTP();

  otpStore[email] = {
    otp: otp,
    expires: Date.now() + 5 * 60 * 1000
  };

  try {

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Error sending OTP"
    });

  }

});
app.post("/verify-otp", (req, res) => {

  const { email, otp,role } = req.body;

  const storedData = otpStore[email];

  if (!storedData) {
    return res.status(400).json({ message: "OTP not found" });
  }

  if (Date.now() > storedData.expires) {

    delete otpStore[email];

    return res.status(400).json({
      message: "OTP expired"
    });
  }

  if (storedData.otp != otp) {

    return res.status(400).json({
      message: "Invalid OTP"
    });

  }

  delete otpStore[email];

  const token = jwt.sign(
    { email, role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

    return res.json({
      message: "OTP verified successfully",
      token: token
    });

  });

  
app.get(
  "/user-dashboard",
  authenticateToken,
  authorizeRole("user"),
  (req, res) => {

    res.json({
      message: "Welcome User Dashboard",
      user: req.user
    });

  }
);
app.get(
  "/organizer-dashboard",
  authenticateToken,
  authorizeRole("organizer"),
  (req, res) => {

    res.json({
      message: "Welcome Organizer Dashboard",
      user: req.user
    });

  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


