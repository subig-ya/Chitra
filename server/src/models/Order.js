import mongoose from "mongoose";

export const ORDER_STATUSES = [
  "awaiting_payment",
  "in_progress",
  "delivered",
  "revision_requested",
  "completed",
  "disputed",
  "cancelled",
  "refunded",
];

const milestoneSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    note: { type: String, trim: true, maxlength: 2000 },
    previewImageUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

const deliverableSchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true, trim: true },
    version: { type: Number, default: 1 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true, maxlength: 120 },
    phone: { type: String, trim: true, maxlength: 30 },
    addressLine: { type: String, trim: true, maxlength: 300 },
    city: { type: String, trim: true, maxlength: 80 },
    zip: { type: String, trim: true, maxlength: 30 },
    note: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["commission", "artwork"], default: "commission", index: true },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CommissionRequest",
      sparse: true,
      unique: true,
    },
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork",
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shippingAddress: { type: shippingAddressSchema },
    packageTitle: { type: String, trim: true },
    agreedPrice: { type: Number, required: true, min: 1 },
    platformFeePercent: { type: Number, required: true, min: 0, max: 100 },
    artistPayoutAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "awaiting_payment",
      index: true,
    },
    milestones: { type: [milestoneSchema], default: [] },
    deliverables: { type: [deliverableSchema], default: [] },
    revisionCount: { type: Number, default: 0, min: 0 },
    revisionLimit: { type: Number, default: 2, min: 0, max: 20 },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    deliveredAt: { type: Date },
    approvedAt: { type: Date },
    autoReleaseAt: { type: Date },
  },
  { timestamps: true }
);

orderSchema.set("toJSON", { versionKey: false });

export const Order = mongoose.model("Order", orderSchema);
