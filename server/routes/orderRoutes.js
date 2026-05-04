const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", verifyToken, createOrder);
router.get("/my-orders", verifyToken, getMyOrders);
router.get("/", verifyToken, isAdmin, getAllOrders);
router.get("/:id", verifyToken, getOrderById);
router.put("/:id/status", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
