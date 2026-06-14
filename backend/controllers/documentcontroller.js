import fs from "fs";
import path from "path";
import crypto from "crypto";
import Document from "../models/Document.js";
import createAuditLog from "../utils/createAuditLog.js";
import sendEmail from "../utils/sendEmail.js";

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a PDF file" });
    }

    const document = await Document.create({
      title: req.body.title || req.file.originalname,
      fileName: req.file.filename,
      fileUrl: req.file.path,
      fileSize: req.file.size,
      owner: req.user._id,
    });

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "UPLOAD_DOCUMENT",
      message: `${document.title} uploaded successfully`,
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      message: "Documents fetched successfully",
      documents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSingleDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "VIEW_DOCUMENT",
      message: `${document.title} viewed`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Document fetched successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadOriginalDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const filePath = path.resolve(document.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Original file not found" });
    }

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "DOWNLOAD_ORIGINAL",
      message: `${document.title} original PDF downloaded`,
      ipAddress: req.ip,
    });

    res.download(filePath, document.fileName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadSignedDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (!document.signedFileUrl) {
      return res.status(400).json({ message: "Signed PDF not available" });
    }

    const filePath = path.resolve(document.signedFileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Signed file not found" });
    }

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "DOWNLOAD_SIGNED",
      message: `${document.title} signed PDF downloaded`,
      ipAddress: req.ip,
    });

    res.download(
      filePath,
      document.signedFileName || `signed-${document.fileName}`
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateShareLink = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    document.shareToken = token;
    document.isPublicShared = true;
    document.shareTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await document.save();

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/public-sign/${token}`;

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "SHARE_LINK_CREATED",
      message: `Public signing link created for ${document.title}`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Share link generated successfully",
      shareUrl,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMockInvite = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Signer email is required" });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    let token = document.shareToken;

    if (!token) {
      token = crypto.randomBytes(32).toString("hex");
      document.shareToken = token;
      document.isPublicShared = true;
      document.shareTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await document.save();
    }

    const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/public-sign/${token}`;

    await sendEmail({
      to: email,
      subject: `Signature Request: ${document.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>SignFlow Signature Request</h2>
          <p>You have been invited to sign this document:</p>
          <h3>${document.title}</h3>
          <a href="${shareUrl}" style="display:inline-block;padding:12px 18px;background:#4f46e5;color:white;text-decoration:none;border-radius:8px;">
            Open & Sign Document
          </a>
          <p style="color:#64748b;">This link will expire in 7 days.</p>
        </div>
      `,
    });

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "EMAIL_INVITE_SENT",
      message: `Email invite sent to ${email}`,
      ipAddress: req.ip,
    });

    res.json({
      message: `Email invite sent to ${email}`,
      email,
      shareUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicDocumentByToken = async (req, res) => {
  try {
    const document = await Document.findOne({
      shareToken: req.params.token,
      isPublicShared: true,
    });

    if (!document) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    if (document.shareTokenExpires && document.shareTokenExpires < new Date()) {
      return res.status(410).json({ message: "Share link expired" });
    }

    res.json({
      message: "Public document fetched successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const rejectDocument = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reject reason is required" });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.status === "Signed") {
      return res.status(400).json({ message: "Signed document cannot be rejected" });
    }

    document.status = "Rejected";
    document.rejectReason = reason;
    document.rejectedAt = new Date();
    document.rejectedBy = req.user.name || req.user.email || "Owner";

    await document.save();

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "DOCUMENT_REJECTED",
      message: `${document.title} rejected. Reason: ${reason}`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Document rejected successfully",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "DELETE_DOCUMENT",
      message: `${document.title} deleted`,
      ipAddress: req.ip,
    });

    if (fs.existsSync(path.resolve(document.fileUrl))) {
      fs.unlinkSync(path.resolve(document.fileUrl));
    }

    if (
      document.signedFileUrl &&
      fs.existsSync(path.resolve(document.signedFileUrl))
    ) {
      fs.unlinkSync(path.resolve(document.signedFileUrl));
    }

    await Document.findByIdAndDelete(req.params.id);

    res.json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};