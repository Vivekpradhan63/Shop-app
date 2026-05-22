const rateLimit = require("express-rate-limit");
const { LoggerService } = require("../services/LoggerService");

// Limit each IP to 5 requests per 15 minutes for strict routes like login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts from this IP, please try again after 15 minutes" },
  handler: (req, res, next, options) => {
    LoggerService.logSecurityEvent("RATE_LIMIT_EXCEEDED", null, req.ip, { path: req.originalUrl });
    res.status(options.statusCode).send(options.message);
  }
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Too many requests from this IP, please try again later" }
});

module.exports = { authLimiter, apiLimiter };
