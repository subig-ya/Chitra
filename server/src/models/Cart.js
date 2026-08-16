import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    artworkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork",
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1, max: 5 },
  },
  { _id: true }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

cartSchema.set("toJSON", { versionKey: false });

export const Cart = mongoose.model("Cart", cartSchema);
