import { Artwork } from "../models/Artwork.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SORT_MAP = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

export const listArtworks = asyncHandler(async (req, res) => {
  const q = req.validatedQuery;
  const { page, limit } = q;

  const match = {
    isActive: true,
    isVerified: true,
    availability: "available",
  };
  if (q.medium) match.medium = q.medium;
  if (q.subject) match.subject = q.subject;
  if (q.style) match.style = new RegExp(q.style.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  if (q.artistId) match.artistId = q.artistId;
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    match.price = {};
    if (q.minPrice !== undefined) match.price.$gte = q.minPrice;
    if (q.maxPrice !== undefined) match.price.$lte = q.maxPrice;
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "users",
        localField: "artistId",
        foreignField: "_id",
        as: "artist",
      },
    },
    { $unwind: { path: "$artist", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        imageUrl: 1,
        medium: 1,
        subject: 1,
        style: 1,
        widthCm: 1,
        heightCm: 1,
        depthCm: 1,
        yearCreated: 1,
        price: 1,
        createdAt: 1,
        artistName: "$artist.name",
        artistAvatar: "$artist.avatar",
      },
    },
  ];

  if (q.search) {
    const rx = new RegExp(q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    pipeline.push({
      $match: { $or: [{ title: rx }, { style: rx }, { artistName: rx }] },
    });
  }

  pipeline.push({ $sort: SORT_MAP[q.sort] });

  const [{ results, total }] = await Artwork.aggregate([
    ...pipeline,
    {
      $facet: {
        results: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: "n" }],
      },
    },
  ]);

  const totalCount = total.length ? total[0].n : 0;

  res.json({
    success: true,
    data: results,
    meta: { page, limit, total: totalCount, totalPages: Math.ceil(totalCount / limit) },
  });
});

export const getArtwork = asyncHandler(async (req, res) => {
  if (!/^[a-f0-9]{24}$/i.test(req.params.id)) {
    throw new ApiError(404, "Artwork not found");
  }
  const artwork = await Artwork.findById(req.params.id).populate(
    "artistId",
    "name avatar artistProfile bio"
  );
  if (!artwork || !artwork.isActive) throw new ApiError(404, "Artwork not found");

  const isOwner = String(artwork.artistId._id) === req.userId;
  const isAdmin = req.userRole === "admin";
  if (!artwork.isVerified && !isOwner && !isAdmin) {
    throw new ApiError(404, "Artwork not found");
  }

  res.json({ success: true, artwork });
});

export const listMyArtworks = asyncHandler(async (req, res) => {
  const artworks = await Artwork.find({ artistId: req.userId }).sort({ createdAt: -1 });
  res.json({ success: true, data: artworks });
});

export const createArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.create({
    ...req.body,
    artistId: req.userId,
    isVerified: req.userRole === "admin" ? true : false,
  });
  res.status(201).json({ success: true, artwork });
});

export const updateArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork || !artwork.isActive) throw new ApiError(404, "Artwork not found");

  const isOwner = String(artwork.artistId) === req.userId;
  const isAdmin = req.userRole === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Only the artist or an admin can update this artwork");
  }

  Object.assign(artwork, req.body);
  await artwork.save();
  res.json({ success: true, artwork });
});

export const deleteArtwork = asyncHandler(async (req, res) => {
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork || !artwork.isActive) throw new ApiError(404, "Artwork not found");

  const isOwner = String(artwork.artistId) === req.userId;
  const isAdmin = req.userRole === "admin";
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Only the artist or an admin can delete this artwork");
  }

  artwork.isActive = false;
  await artwork.save();
  res.json({ success: true, message: "Artwork removed" });
});
