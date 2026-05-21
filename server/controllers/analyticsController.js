const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const getAnalyticsSummary = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const orders = await Order.find({ orderStatus: { $ne: "cancelled" } });
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalPrice, 0);

    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      lowStockProducts
    });
  } catch (e) {
    next(e);
  }
};

const getTopProducts = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: "cancelled" } }).populate("items.product");
    
    const productCounts = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (item.product) {
          const pid = item.product._id.toString();
          if (!productCounts[pid]) {
            productCounts[pid] = {
              _id: item.product._id,
              name: item.product.name,
              images: item.product.images,
              price: item.product.price,
              soldCount: 0,
              revenue: 0,
            };
          }
          productCounts[pid].soldCount += item.quantity;
          productCounts[pid].revenue += item.quantity * item.price;
        }
      }
    }

    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5);

    res.json(topProducts);
  } catch (e) {
    next(e);
  }
};

const getRevenueChartData = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const orders = await Order.find({
      orderStatus: { $ne: "cancelled" },
      createdAt: { $gte: thirtyDaysAgo }
    });

    const dataMap = {};
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split("T")[0];
      if (!dataMap[dateStr]) dataMap[dateStr] = 0;
      dataMap[dateStr] += order.totalPrice;
    }

    const chartData = Object.keys(dataMap)
      .map(date => ({
        date,
        revenue: dataMap[date]
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(chartData);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getAnalyticsSummary,
  getTopProducts,
  getRevenueChartData
};
