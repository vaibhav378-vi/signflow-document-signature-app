import express from "express";
import {
  signDocument,
  publicSignDocument,
} from "../controllers/signatureController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/sign", protect, signDocument);
router.post("/public-sign", publicSignDocument);

export default router;