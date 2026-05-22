const User = require("../models/User");
const AuthService = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const result = await AuthService.registerUser(req.body, req.ip);
    res.status(201).json(result);
  } catch (e) {
    if (e.message.includes("provide") || e.message.includes("exists")) {
      res.status(400);
    }
    next(e);
  }
};

const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const result = await AuthService.loginUser(identifier, password, req.ip);
    res.json(result);
  } catch (e) {
    if (e.message.includes("credentials") || e.message.includes("locked") || e.message.includes("blocked")) {
      res.status(401);
    }
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

const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { name, phone, address, email } = req.body;
    
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone });
      if (exists) {
        res.status(400);
        throw new Error("Phone number is already in use");
      }
    }
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        res.status(400);
        throw new Error("Email is already in use");
      }
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (email !== undefined) user.email = email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      address: updatedUser.address,
      createdAt: updatedUser.createdAt,
    });
  } catch (e) {
    next(e);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error("Please provide current and new password");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401);
      throw new Error("Invalid current password");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (e) {
    next(e);
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
