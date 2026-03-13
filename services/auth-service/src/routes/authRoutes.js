const express = require("express");
const controller = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/send-otp", controller.sendOtp);
router.post("/verify-otp", controller.verifyOtp);
router.get("/me", requireAuth, controller.getProfile);
router.patch("/me", requireAuth, controller.updateProfile);

module.exports = router;
