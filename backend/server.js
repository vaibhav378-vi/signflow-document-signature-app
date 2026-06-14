import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import signatureRoutes from "./routes/signatureRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Auth Routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", documentRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/signatures", signatureRoutes);
app.use("/signed", express.static("signed"));
app.use("/api/audit", auditRoutes);

app.get("/", (req, res) => {
  res.send("SignFlow API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});