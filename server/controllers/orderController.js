const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400);
      throw new Error("Items and shipping address are required");
    }
    const lineItems = [];
    let totalPrice = 0;
    for (const line of items) {
      const { product: productId, quantity } = line;
      if (!productId || !quantity || quantity < 1) {
        res.status(400);
        throw new Error("Each item needs product id and valid quantity");
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        res.status(400);
        throw new Error("Invalid product id in cart");
      }
      const product = await Product.findById(productId);
      if (!product) {
        res.status(400);
        throw new Error(`Product not found: ${productId}`);
      }
      if (product.stock < quantity) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      const price = product.price;
      totalPrice += price * quantity;
      lineItems.push({
        product: product._id,
        quantity: Number(quantity),
        price,
      });
    }
    for (const line of lineItems) {
      await Product.findByIdAndUpdate(line.product, { $inc: { stock: -line.quantity } });
    }
    const order = await Order.create({
      user: req.user._id,
      phone: req.user.phone || "",
      items: lineItems,
      shippingAddress: shippingAddress.trim(),
      totalPrice,
      orderStatus: "pending",
      paymentStatus: "pending",
    });
    const populated = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price");
    res.status(201).json(populated);
  } catch (e) {
    next(e);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .populate("items.product", "name images price");
    // Ensure phone is always present (back-compat for old orders)
    const normalized = orders.map((o) => {
      const obj = o.toObject();
      if (!obj.phone) obj.phone = obj.user?.phone || "";
      return obj;
    });
    res.json(normalized);
  } catch (e) {
    next(e);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid order id");
    }
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price");
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    const ownerId = order.user?._id?.toString() || order.user?.toString();
    if (ownerId !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to view this order");
    }
    // Back-compat: fill phone from user if not stored on order
    const obj = order.toObject();
    if (!obj.phone) obj.phone = obj.user?.phone || "";
    res.json(obj);
  } catch (e) {
    next(e);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .populate("items.product", "name images price");
    // Back-compat: fill phone from user if not stored on order
    const normalized = orders.map((o) => {
      const obj = o.toObject();
      if (!obj.phone) obj.phone = obj.user?.phone || "";
      return obj;
    });
    res.json(normalized);
  } catch (e) {
    next(e);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid order id");
    }
    const { orderStatus } = req.body;
    const allowed = ["pending", "confirmed", "shipped", "delivered"];
    if (!orderStatus || !allowed.includes(orderStatus)) {
      res.status(400);
      throw new Error("Invalid order status");
    }
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }
    order.orderStatus = orderStatus;
    await order.save();
    const populated = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price");
    res.json(populated);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
