const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  event: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ipAddress: { type: String },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now, expires: "90d" } // Auto delete after 90 days
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

class LoggerService {
  static async logSecurityEvent(event, user, ipAddress, details = {}) {
    try {
      await AuditLog.create({
        event,
        user,
        ipAddress,
        details
      });
      console.log(`[SECURITY] ${event} - IP: ${ipAddress}`);
    } catch (error) {
      console.error("Failed to write security log:", error);
    }
  }

  static async logAdminAction(action, adminId, targetId, details = {}) {
    try {
      await AuditLog.create({
        event: `ADMIN_${action.toUpperCase()}`,
        user: adminId,
        details: { targetId, ...details }
      });
      console.log(`[ADMIN] ${action} by ${adminId} on ${targetId}`);
    } catch (error) {
      console.error("Failed to write admin log:", error);
    }
  }
}

module.exports = { LoggerService, AuditLog };
