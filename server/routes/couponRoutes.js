const express = require("express");
const {
  createCoupon,
  getCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/validate", verifyToken, validateCoupon);
router.post("/", verifyToken, isAdmin, createCoupon);
router.get("/", verifyToken, isAdmin, getCoupons);
router.put("/:id", verifyToken, isAdmin, updateCoupon);
router.delete("/:id", verifyToken, isAdmin, deleteCoupon);

module.exports = router;
