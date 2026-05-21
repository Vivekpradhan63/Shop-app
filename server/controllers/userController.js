const User = require("../models/User");
const mongoose = require("mongoose");

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (e) {
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid user id");
    }
    if (req.params.id === req.user._id.toString()) {
      res.status(400);
      throw new Error("Cannot delete your own account");
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ message: "User removed" });
  } catch (e) {
    next(e);
  }
};

const toggleBlockUser = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(400);
      throw new Error("Invalid user id");
    }
    if (req.params.id === req.user._id.toString()) {
      res.status(400);
      throw new Error("Cannot block yourself");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json(user);
  } catch (e) {
    next(e);
  }
};

module.exports = { getUsers, deleteUser, toggleBlockUser };
