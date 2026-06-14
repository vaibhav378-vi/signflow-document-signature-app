import mongoose from "mongoose";

const signatureSchema = new mongoose.Schema(
  {
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
    signer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    signatureImage: { type: String, required: true },
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },
    page: { type: Number, default: 1 },
    signedFileUrl: String,
    status: { type: String, enum: ["Pending", "Signed", "Rejected"], default: "Signed" },
  },
  { timestamps: true }
);

export default mongoose.model("Signature", signatureSchema);