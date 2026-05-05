const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const register = async (req, res, next) => {
  try {
    const { name, phone, password, address } = req.body;
    if (!name || !phone || !password) {
      res.status(400);
      throw new Error("Please provide name, phone, and password");
    }
    const exists = await User.findOne({ phone });
    if (exists) {
      res.status(400);
      throw new Error("User already exists with this phone number");
    }
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = await User.create({
      name,
      phone,
      password: hashed,
      address: address || "",
      role: "customer", // Force customer role
    });
    const token = signToken(user._id.toString());
    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400);
      throw new Error("Please provide email/phone and password");
    }
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    }).select("+password");
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401);
      throw new Error("Invalid credentials");
    }
    const token = signToken(user._id.toString());
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json(user);
  } catch (e) {
    next(e);
  }
};

module.exports = { register, login, getMe };
