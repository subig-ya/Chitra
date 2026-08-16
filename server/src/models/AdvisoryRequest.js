import mongoose from "mongoose";

export const ADVISORY_STATUSES = ["new", "contacted", "closed"];

const advisoryRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: { type: String, trim: true, maxlength: 30 },
    budgetMin: { type: Number, min: 0 },
    budgetMax: { type: Number, min: 0 },
    room: { type: String, trim: true, maxlength: 80 },
    message: { type: String, trim: true, maxlength: 4000 },
    status: { type: String, enum: ADVISORY_STATUSES, default: "new", index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

advisoryRequestSchema.set("toJSON", { versionKey: false });

export const AdvisoryRequest = mongoose.model(
  "AdvisoryRequest",
  advisoryRequestSchema
);
