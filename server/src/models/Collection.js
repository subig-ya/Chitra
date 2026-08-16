import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subtitle: { type: String, trim: true, maxlength: 300 },
    curatorNote: { type: String, trim: true, maxlength: 2000 },
    coverImageUrl: { type: String, trim: true, maxlength: 1000 },
    artworkIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
      default: [],
    },
    isFeatured: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

collectionSchema.set("toJSON", { versionKey: false });

export const Collection = mongoose.model("Collection", collectionSchema);
