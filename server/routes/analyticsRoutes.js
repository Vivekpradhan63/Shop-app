const express = require("express");
const {
  getAnalyticsSummary,
  getTopProducts,
  getRevenueChartData
} = require("../controllers/analyticsController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/summary", verifyToken, isAdmin, getAnalyticsSummary);
router.get("/top-products", verifyToken, isAdmin, getTopProducts);
router.get("/revenue", verifyToken, isAdmin, getRevenueChartData);

module.exports = router;
