import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find({ user: req.user._id })
      .populate("document", "title status fileName")
      .sort({ createdAt: -1 });

    res.json({
      message: "Audit logs fetched successfully",
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogsByDocument = async (req, res) => {
  try {
    const logs = await AuditLog.find({
      user: req.user._id,
      document: req.params.docId,
    })
      .populate("document", "title status fileName")
      .sort({ createdAt: -1 });

    res.json({
      message: "Document audit logs fetched successfully",
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};