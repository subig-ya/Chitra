import mongoose from "mongoose";

export const NOTIFICATION_TYPES = [
  "order",
  "message",
  "dispute",
  "report",
  "verification",
  "payment",
  "system",
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: NOTIFICATION_TYPES, default: "system" },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 1000 },
    refId: { type: mongoose.Schema.Types.ObjectId },
    refModel: { type: String, trim: true, maxlength: 60 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

notificationSchema.set("toJSON", { versionKey: false });

export const Notification = mongoose.model("Notification", notificationSchema);
