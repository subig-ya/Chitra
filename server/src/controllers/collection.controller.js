import { Artwork } from "../models/Artwork.js";
import { Collection } from "../models/Collection.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listCollections = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.validatedQuery.featured === "true") filter.isFeatured = true;

  const collections = await Collection.find(filter).sort({ createdAt: -1 });
  const data = await Promise.all(
    collections.map(async (c) => ({
      ...c.toJSON(),
      artworkCount: await Artwork.countDocuments({
        _id: { $in: c.artworkIds },
        isActive: true,
        isVerified: true,
        availability: "available",
      }),
    }))
  );
  res.json({ success: true, data });
});

export const getCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({
    _id: req.params.id,
    isActive: true,
  });
  if (!collection) throw new ApiError(404, "Collection not found");

  const artworks = await Artwork.find({
    _id: { $in: collection.artworkIds },
    isActive: true,
    isVerified: true,
    availability: "available",
  })
    .populate("artistId", "name")
    .lean();

  res.json({ success: true, collection, artworks });
});
