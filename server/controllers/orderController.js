const OrderService = require("../services/orderService");

const createOrder = async (req, res, next) => {
  try {
    const result = await OrderService.createOrder(req.user, req.body);
    res.status(201).json(result);
  } catch (e) {
    if (e.message.includes("required") || e.message.includes("Invalid") || e.message.includes("Insufficient")) {
      res.status(400);
    }
    next(e);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const result = await OrderService.getMyOrders(req.user, req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const result = await OrderService.getOrderById(req.params.id, req.user);
    res.json(result);
  } catch (e) {
    if (e.message.includes("Invalid")) res.status(400);
    else if (e.message.includes("not found")) res.status(404);
    else if (e.message.includes("authorized")) res.status(403);
    next(e);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const result = await OrderService.getAllOrders(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const result = await OrderService.updateOrderStatus(req.params.id, req.body, req.user._id);
    res.json(result);
  } catch (e) {
    if (e.message.includes("Invalid order id") || e.message.includes("Invalid order status")) {
      res.status(400);
    } else if (e.message.includes("not found")) {
      res.status(404);
    }
    next(e);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const result = await OrderService.cancelOrder(req.params.id, req.user);
    res.json(result);
  } catch (e) {
    if (e.message.includes("Invalid order id") || e.message.includes("cancelled")) {
      res.status(400);
    } else if (e.message.includes("not found")) {
      res.status(404);
    } else if (e.message.includes("authorized")) {
      res.status(403);
    }
    next(e);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
