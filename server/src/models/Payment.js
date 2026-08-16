import mongoose from "mongoose";

export const PAYMENT_STATUSES = [
  "initiated",
  "held_in_escrow",
  "released_to_artist",
  "refunded",
  "failed",
];

export const GATEWAYS = ["esewa", "khalti"];

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    gateway: { type: String, enum: GATEWAYS, required: true },
    amount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "initiated",
      index: true,
    },
    reference: { type: String, unique: true, index: true },
    gatewayTransactionId: { type: String, trim: true },
    rawCallback: { type: mongoose.Schema.Types.Mixed },
    refundAmount: { type: Number, min: 0 },
    heldAt: { type: Date },
    releasedAt: { type: Date },
    refundedAt: { type: Date },
    failedAt: { type: Date },
  },
  { timestamps: true }
);

paymentSchema.set("toJSON", { versionKey: false });

export const Payment = mongoose.model("Payment", paymentSchema);
