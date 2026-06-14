import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number },

    signedFileName: { type: String },
    signedFileUrl: { type: String },

    shareToken: { type: String },
    shareTokenExpires: { type: Date },
    isPublicShared: { type: Boolean, default: false },

    rejectReason: { type: String },
    rejectedAt: { type: Date },
    rejectedBy: { type: String },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Signed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;