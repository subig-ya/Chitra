import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: { type: String, trim: true, maxlength: 500 },
    coverImageUrl: { type: String, trim: true, maxlength: 1000 },
    author: { type: String, trim: true, maxlength: 80, default: "Chitra Editorial" },
    category: { type: String, trim: true, maxlength: 80, default: "Stories" },
    content: { type: String, trim: true, maxlength: 20000 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

storySchema.set("toJSON", { versionKey: false });

export const Story = mongoose.model("Story", storySchema);
