import mongoose from "mongoose";

export const DISPUTE_STATUSES = ["open", "under_review", "resolved"];
export const DISPUTE_RESOLUTIONS = ["release_to_artist", "refund_buyer", "partial_split"];

const disputeSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { type: String, required: true, trim: true, minlength: 10, maxlength: 3000 },
    status: {
      type: String,
      enum: DISPUTE_STATUSES,
      default: "open",
      index: true,
    },
    resolution: { type: String, enum: DISPUTE_RESOLUTIONS },
    refundAmount: { type: Number, min: 0 },
    resolutionNote: { type: String, trim: true, maxlength: 3000 },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

disputeSchema.set("toJSON", { versionKey: false });

export const Dispute = mongoose.model("Dispute", disputeSchema);
