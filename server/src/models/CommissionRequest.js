import mongoose from "mongoose";

export const REQUEST_STATUSES = ["pending", "quoted", "accepted", "rejected", "expired"];

const quoteSchema = new mongoose.Schema(
  {
    quotedPrice: { type: Number, min: 1 },
    quotedTurnaroundDays: { type: Number, min: 1, max: 365 },
    quoteNote: { type: String, trim: true, maxlength: 2000 },
    quotedAt: { type: Date },
  },
  { _id: false }
);

const budgetRangeSchema = new mongoose.Schema(
  {
    min: { type: Number, min: 0 },
    max: { type: Number, min: 0 },
  },
  { _id: false }
);

const commissionRequestSchema = new mongoose.Schema(
  {
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
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    packageTitle: { type: String, trim: true },
    briefDescription: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    referenceImages: [{ type: String, trim: true }],
    budgetRange: { type: budgetRangeSchema },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
      index: true,
    },
    quote: { type: quoteSchema },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

commissionRequestSchema.set("toJSON", { versionKey: false });

export const CommissionRequest = mongoose.model(
  "CommissionRequest",
  commissionRequestSchema
);
