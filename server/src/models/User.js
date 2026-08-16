import mongoose from "mongoose";

export const ROLES = ["buyer", "artist", "admin"];

const commissionPackageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 2000 },
    basePrice: { type: Number, required: true, min: 1 },
    turnaroundDays: { type: Number, required: true, min: 1, max: 365 },
    revisionLimit: { type: Number, default: 2, min: 0, max: 20 },
    sampleImages: [{ type: String, trim: true }],
  },
  { _id: true }
);

const artistProfileSchema = new mongoose.Schema(
  {
    bio: { type: String, trim: true, maxlength: 2000 },
    yearsExperience: { type: Number, min: 0, max: 100 },
    specialty: { type: String, trim: true, maxlength: 120 },
    portfolioImages: [{ type: String, trim: true }],
    commissionPackages: {
      type: [commissionPackageSchema],
      default: [],
    },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
  },
  { _id: false }
);

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "buyer", index: true },
    avatar: { type: String, trim: true },
    coverImage: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 2000 },
    wishlist: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Artwork" }],
      default: [],
    },
    artistProfile: { type: artistProfileSchema },
    refreshTokens: {
      type: [refreshTokenSchema],
      default: [],
      select: false,
    },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
