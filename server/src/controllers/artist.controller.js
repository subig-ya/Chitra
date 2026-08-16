import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";

const PUBLIC_FIELDS =
  "name avatar bio artistProfile role createdAt";

export const listArtists = asyncHandler(async (req, res) => {
  const { search, sort, minPrice, maxPrice, page, limit } = req.validatedQuery;

  const filter = { role: "artist" };

  if (search) {
    filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceRange = {};
    if (minPrice !== undefined) priceRange.$gte = minPrice;
    if (maxPrice !== undefined) priceRange.$lte = maxPrice;
    filter["artistProfile.commissionPackages"] = { $elemMatch: { basePrice: priceRange } };
  }

  const sortMap = {
    rating: { "artistProfile.rating": -1, name: 1 },
    orders: { "artistProfile.totalOrders": -1, name: 1 },
    newest: { createdAt: -1 },
  };

  const [items, total] = await Promise.all([
    User.find(filter)
      .select(PUBLIC_FIELDS)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getArtistProfile = asyncHandler(async (req, res) => {
  const artist = await User.findOne({ _id: req.params.id, role: "artist" }).select(
    PUBLIC_FIELDS
  );
  if (!artist) throw new ApiError(404, "Artist not found");

  const { rating, ratingCount, totalOrders, isVerified } = artist.artistProfile || {};
  res.json({
    success: true,
    artist: {
      ...artist.toObject(),
      stats: { rating, ratingCount, totalOrders, isVerified },
    },
  });
});

function ensureArtistProfile(user) {
  if (user.role !== "artist") {
    throw new ApiError(403, "Only artists can manage commission packages");
  }
  if (!user.artistProfile) {
    user.artistProfile = { isVerified: false };
  }
}

export const createPackage = asyncHandler(async (req, res) => {
  const user = req.user;
  ensureArtistProfile(user);
  if (user.artistProfile.commissionPackages.length >= 20) {
    throw new ApiError(400, "Package limit reached (max 20)");
  }
  user.artistProfile.commissionPackages.push(req.body);
  await user.save();
  const created = user.artistProfile.commissionPackages.at(-1);
  res.status(201).json({ success: true, package: created });
});

export const updatePackage = asyncHandler(async (req, res) => {
  const user = req.user;
  ensureArtistProfile(user);

  const pkg = user.artistProfile.commissionPackages.id(req.params.packageId);
  if (!pkg) throw new ApiError(404, "Commission package not found");

  for (const [key, value] of Object.entries(req.body)) {
    pkg[key] = value;
  }
  await user.save();
  res.json({ success: true, package: pkg });
});

export const deletePackage = asyncHandler(async (req, res) => {
  const user = req.user;
  ensureArtistProfile(user);

  const pkg = user.artistProfile.commissionPackages.id(req.params.packageId);
  if (!pkg) throw new ApiError(404, "Commission package not found");

  pkg.deleteOne();
  await user.save();
  res.json({ success: true, message: "Commission package deleted" });
});
