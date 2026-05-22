const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { LoggerService } = require("./LoggerService");

class OrderService {
  static async createOrder(user, data) {
    const { items, shippingAddress } = data;
    if (!shippingAddress || !items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items and shipping address are required");
    }
    const lineItems = [];
    let totalPrice = 0;
    
    for (const line of items) {
      const { product: productId, quantity } = line;
      if (!productId || !quantity || quantity < 1) {
        throw new Error("Each item needs product id and valid quantity");
      }
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("Invalid product id in cart");
      }
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }
      if (product.stock < quantity) {
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
      user: user._id,
      phone: user.phone || "",
      items: lineItems,
      shippingAddress: shippingAddress.trim(),
      totalPrice,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    const populated = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price")
      .lean(); // .lean() for performance

    return populated;
  }

  static async getMyOrders(user, { page = 1, limit = 20 }) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, total] = await Promise.all([
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("user", "name email phone")
        .populate("items.product", "name images price")
        .lean(), // .lean() for performance
      Order.countDocuments({ user: user._id })
    ]);

    const normalized = orders.map((o) => {
      if (!o.phone) o.phone = o.user?.phone || "";
      return o;
    });

    return {
      orders: normalized,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      total
    };
  }

  static async getOrderById(id, user) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid order id");
    
    const order = await Order.findById(id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price")
      .lean();

    if (!order) throw new Error("Order not found");

    const ownerId = order.user?._id?.toString() || order.user?.toString();
    if (ownerId !== user._id.toString() && user.role !== "admin") {
      throw new Error("Not authorized to view this order");
    }

    if (!order.phone) order.phone = order.user?.phone || "";
    return order;
  }

  static async getAllOrders({ page = 1, limit = 20 }) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const [orders, total] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .populate("user", "name email phone")
        .populate("items.product", "name images price")
        .lean(),
      Order.countDocuments({})
    ]);

    const normalized = orders.map((o) => {
      if (!o.phone) o.phone = o.user?.phone || "";
      return o;
    });

    return {
      orders: normalized,
      totalPages: Math.ceil(total / limitNumber),
      currentPage: pageNumber,
      total
    };
  }

  static async updateOrderStatus(id, data, adminId) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid order id");
    const { orderStatus } = data;
    const allowed = ["pending", "confirmed", "shipped", "delivered"];
    if (!orderStatus || !allowed.includes(orderStatus)) throw new Error("Invalid order status");

    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    order.orderStatus = orderStatus;
    await order.save();

    await LoggerService.logAdminAction("UPDATE_ORDER_STATUS", adminId, order._id, { newStatus: orderStatus });

    const populated = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price")
      .lean();
    return populated;
  }

  static async cancelOrder(id, user) {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid order id");
    const order = await Order.findById(id);
    if (!order) throw new Error("Order not found");

    const ownerId = order.user?._id?.toString() || order.user?.toString();
    if (ownerId !== user._id.toString() && user.role !== "admin") {
      throw new Error("Not authorized to cancel this order");
    }
    if (order.orderStatus !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = Date.now();
    await order.save();

    // Restore stock
    for (const line of order.items) {
      await Product.findByIdAndUpdate(line.product, { $inc: { stock: line.quantity } });
    }

    const populated = await Order.findById(order._id)
      .populate("user", "name email phone")
      .populate("items.product", "name images price")
      .lean();
    return populated;
  }
}

module.exports = OrderService;
