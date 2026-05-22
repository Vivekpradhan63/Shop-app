const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { LoggerService } = require("./LoggerService");

class AuthService {
  static signToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
  }

  static async registerUser(data, ipAddress) {
    const { name, phone, password, address, email } = data;
    if (!name || (!phone && !email) || !password) {
      throw new Error("Please provide name, contact (phone/email), and password");
    }

    if (phone) {
      const exists = await User.findOne({ phone });
      if (exists) throw new Error("User already exists with this phone number");
    }
    if (email) {
      const exists = await User.findOne({ email });
      if (exists) throw new Error("User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      name,
      phone,
      email,
      password: hashed,
      address: address || "",
      role: "customer",
      lastLoginIP: ipAddress
    });

    await LoggerService.logSecurityEvent("USER_REGISTER", user._id, ipAddress);

    return {
      token: this.signToken(user._id.toString()),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      }
    };
  }

  static async loginUser(identifier, password, ipAddress) {
    if (!identifier || !password) {
      throw new Error("Please provide email/phone and password");
    }

    const user = await User.findOne({ 
      $or: [{ email: identifier }, { phone: identifier }] 
    }).select("+password");

    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (user.isBlocked) {
      await LoggerService.logSecurityEvent("LOGIN_BLOCKED_ACCOUNT", user._id, ipAddress);
      throw new Error("Your account has been blocked by an administrator.");
    }

    // Check brute force lock
    if (user.lockUntil && user.lockUntil > Date.now()) {
      await LoggerService.logSecurityEvent("LOGIN_LOCKED_ACCOUNT", user._id, ipAddress);
      throw new Error("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
        await LoggerService.logSecurityEvent("BRUTE_FORCE_LOCK", user._id, ipAddress);
      }
      await user.save();
      throw new Error("Invalid credentials");
    }

    // Success login
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginIP = ipAddress;
    await user.save();

    await LoggerService.logSecurityEvent("USER_LOGIN", user._id, ipAddress);

    return {
      token: this.signToken(user._id.toString()),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        createdAt: user.createdAt,
      }
    };
  }
}

module.exports = AuthService;
