import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";
import Document from "../models/Document.js";
import Signature from "../models/Signature.js";
import createAuditLog from "../utils/createAuditLog.js";

const generateSignedPdf = async ({
  document,
  signatureImage,
  signer,
  x = 100,
  y = 100,
  page = 1,
  previewWidth = 700,
  previewHeight = 720,
  markerWidth = 160,
  markerHeight = 70,
}) => {
  const originalPath = path.resolve(document.fileUrl);

  if (!fs.existsSync(originalPath)) {
    throw new Error("Original PDF file not found");
  }

  const pdfBytes = fs.readFileSync(originalPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const selectedPage = pages[Number(page) - 1] || pages[0];
  const { width: pageWidth, height: pageHeight } = selectedPage.getSize();

  const pdfX = (Number(x) / Number(previewWidth)) * pageWidth;
  const pdfY =
    pageHeight -
    ((Number(y) + Number(markerHeight)) / Number(previewHeight)) * pageHeight;

  const pdfW = (Number(markerWidth) / Number(previewWidth)) * pageWidth;
  const pdfH = (Number(markerHeight) / Number(previewHeight)) * pageHeight;

  const base64 = signatureImage.replace(/^data:image\/png;base64,/, "");
  const signatureBytes = Buffer.from(base64, "base64");
  const pngImage = await pdfDoc.embedPng(signatureBytes);

  selectedPage.drawImage(pngImage, {
    x: pdfX,
    y: pdfY,
    width: pdfW,
    height: pdfH,
  });

  const signedPdfBytes = await pdfDoc.save();

  if (!fs.existsSync("signed")) fs.mkdirSync("signed");

  const signedFileName = `signed-${Date.now()}-${document.fileName}`;
  const signedPath = path.join("signed", signedFileName);

  fs.writeFileSync(signedPath, signedPdfBytes);

  document.status = "Signed";
  document.signedFileUrl = signedPath;
  document.signedFileName = signedFileName;
  await document.save();

  const signature = await Signature.create({
    document: document._id,
    signer,
    signatureImage,
    x: Number(x),
    y: Number(y),
    page: Number(page),
    signedFileUrl: signedPath,
    status: "Signed",
  });

  return { document, signature };
};

export const signDocument = async (req, res) => {
  try {
    const {
      documentId,
      signatureImage,
      x,
      y,
      page,
      previewWidth,
      previewHeight,
      markerWidth,
      markerHeight,
    } = req.body;

    if (!documentId || !signatureImage) {
      return res.status(400).json({
        message: "Document ID and signature required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      owner: req.user._id,
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const result = await generateSignedPdf({
      document,
      signatureImage,
      signer: req.user._id,
      x,
      y,
      page,
      previewWidth,
      previewHeight,
      markerWidth,
      markerHeight,
    });

    await createAuditLog({
      document: document._id,
      user: req.user._id,
      action: "SIGN_DOCUMENT",
      message: `${document.title} signed successfully`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Document signed successfully",
      document: result.document,
      signature: result.signature,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publicSignDocument = async (req, res) => {
  try {
    const {
      token,
      signatureImage,
      signerName = "Public Signer",
      x,
      y,
      page,
      previewWidth,
      previewHeight,
      markerWidth,
      markerHeight,
    } = req.body;

    if (!token || !signatureImage) {
      return res.status(400).json({
        message: "Token and signature required",
      });
    }

    const document = await Document.findOne({
      shareToken: token,
      isPublicShared: true,
    });

    if (!document) {
      return res.status(404).json({ message: "Invalid public link" });
    }

    if (document.shareTokenExpires && document.shareTokenExpires < new Date()) {
      return res.status(410).json({ message: "Share link expired" });
    }

    if (document.status === "Signed") {
      return res.status(400).json({ message: "Document already signed" });
    }

    const result = await generateSignedPdf({
      document,
      signatureImage,
      signer: document.owner,
      x,
      y,
      page,
      previewWidth,
      previewHeight,
      markerWidth,
      markerHeight,
    });

    await createAuditLog({
      document: document._id,
      user: document.owner,
      action: "PUBLIC_SIGN_DOCUMENT",
      message: `${document.title} signed by ${signerName}`,
      ipAddress: req.ip,
    });

    res.json({
      message: "Document signed successfully",
      document: result.document,
      signature: result.signature,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};