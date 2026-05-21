const Coupon = require("../models/Coupon");

const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercentage, expiryDate, isActive } = req.body;
    if (!code || !discountPercentage || !expiryDate) {
      res.status(400);
      throw new Error("Code, discountPercentage, and expiryDate are required");
    }

    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      res.status(400);
      throw new Error("Coupon code already exists");
    }

    const coupon = await Coupon.create({
      code,
      discountPercentage,
      expiryDate,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(coupon);
  } catch (e) {
    next(e);
  }
};

const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (e) {
    next(e);
  }
};

const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400);
      throw new Error("Coupon code is required");
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      res.status(404);
      throw new Error("Invalid coupon code");
    }

    if (!coupon.isActive) {
      res.status(400);
      throw new Error("Coupon is no longer active");
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      res.status(400);
      throw new Error("Coupon has expired");
    }

    res.json({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (e) {
    next(e);
  }
};

const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error("Coupon not found");
    }

    const { code, discountPercentage, expiryDate, isActive } = req.body;
    if (code) {
      const exists = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: coupon._id } });
      if (exists) {
        res.status(400);
        throw new Error("Coupon code already exists");
      }
      coupon.code = code;
    }
    if (discountPercentage) coupon.discountPercentage = discountPercentage;
    if (expiryDate) coupon.expiryDate = expiryDate;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();
    res.json(coupon);
  } catch (e) {
    next(e);
  }
};

const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404);
      throw new Error("Coupon not found");
    }
    res.json({ message: "Coupon deleted successfully" });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  createCoupon,
  getCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
};
