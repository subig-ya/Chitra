import mongoose from "mongoose";

export const PAYOUT_STATUSES = ["pending", "processing", "paid", "failed"];

const payoutSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
      required: true,
    },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: PAYOUT_STATUSES,
      default: "pending",
      index: true,
    },
    note: { type: String, trim: true, maxlength: 1000 },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

payoutSchema.set("toJSON", { versionKey: false });

export const Payout = mongoose.model("Payout", payoutSchema);
