import AuditLog from "../models/AuditLog.js";

const createAuditLog = async ({ document, user, action, message, ipAddress }) => {
  try {
    const log = await AuditLog.create({
      document,
      user,
      action,
      message,
      ipAddress: ipAddress || "Unknown",
    });

    console.log("AUDIT CREATED:", log.action);
    return log;
  } catch (error) {
    console.error("AUDIT ERROR:", error.message);
  }
};

export default createAuditLog;