import mongoose from "mongoose";

export const REPORT_CATEGORIES = [
  "harassment",
  "late_payment",
  "misuse_of_work",
  "no_show",
  "false_claim",
  "other",
];

export const REPORT_STATUSES = ["new", "reviewed", "resolved"];

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    category: { type: String, enum: REPORT_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    status: {
      type: String,
      enum: REPORT_STATUSES,
      default: "new",
      index: true,
    },
    resolutionNote: { type: String, trim: true, maxlength: 2000 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

reportSchema.index({ reporterId: 1, createdAt: -1 });

reportSchema.set("toJSON", { versionKey: false });

export const Report = mongoose.model("Report", reportSchema);
