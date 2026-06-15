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

const allowedOrigins = [
  "http://localhost:5173",
  "https://signflow-document-signature-app-dop.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));

connectDB();

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