const express = require("express");
const { register, login, getMe, updateProfile, changePassword } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

const { authLimiter } = require("../middleware/securityMiddleware");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", verifyToken, getMe);
router.put("/profile", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;
