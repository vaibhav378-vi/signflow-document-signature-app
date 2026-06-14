import express from "express";
import {
  uploadDocument,
  getMyDocuments,
  getSingleDocument,
  downloadOriginalDocument,
  downloadSignedDocument,
  generateShareLink,
  sendMockInvite,
  getPublicDocumentByToken,
  rejectDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.get("/public/:token", getPublicDocumentByToken);

router.post("/upload", protect, upload.single("pdf"), uploadDocument);
router.get("/", protect, getMyDocuments);
router.get("/:id", protect, getSingleDocument);
router.post("/:id/share", protect, generateShareLink);
router.post("/:id/invite", protect, sendMockInvite);
router.patch("/:id/reject", protect, rejectDocument);
router.get("/:id/download-original", protect, downloadOriginalDocument);
router.get("/:id/download-signed", protect, downloadSignedDocument);
router.delete("/:id", protect, deleteDocument);

export default router;