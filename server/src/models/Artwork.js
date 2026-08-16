import mongoose from "mongoose";

export const ARTWORK_MEDIUMS = [
  "Painting",
  "Photography",
  "Sculpture",
  "Drawing",
  "Print",
  "Mixed Media",
];

export const ARTWORK_SUBJECTS = [
  "Abstract",
  "Landscape",
  "Portrait",
  "Figurative",
  "Still Life",
  "Botanical",
  "Wildlife",
  "Cityscape",
  "Spiritual",
  "Other",
];

export const ARTWORK_AVAILABILITY = ["available", "reserved", "sold"];

const artworkSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 4000 },
    imageUrl: { type: String, required: true, trim: true, maxlength: 1000 },
    medium: { type: String, enum: ARTWORK_MEDIUMS, required: true, index: true },
    subject: { type: String, enum: ARTWORK_SUBJECTS, default: "Other", index: true },
    style: { type: String, trim: true, maxlength: 80, index: true },
    widthCm: { type: Number, min: 1, max: 10000 },
    heightCm: { type: Number, min: 1, max: 10000 },
    depthCm: { type: Number, min: 0, max: 10000 },
    yearCreated: { type: Number, min: 1900, max: 2100 },
    price: { type: Number, required: true, min: 1, index: true },
    availability: {
      type: String,
      enum: ARTWORK_AVAILABILITY,
      default: "available",
      index: true,
    },
    isVerified: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

artworkSchema.index({ artistId: 1, createdAt: -1 });

artworkSchema.set("toJSON", { versionKey: false });

export const Artwork = mongoose.model("Artwork", artworkSchema);
