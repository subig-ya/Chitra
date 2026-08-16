import { Artwork } from "../models/Artwork.js";
import { Collection } from "../models/Collection.js";
import { AdvisoryRequest } from "../models/AdvisoryRequest.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/* ---------- artwork moderation ---------- */

export const listPendingArtworks = asyncHandler(async (req, res) => {
  const artworks = await Artwork.find({
    isVerified: false,
    isActive: true,
  })
    .populate("artistId", "name email")
    .sort({ createdAt: 1 });
  res.json({ success: true, data: artworks });
});

export const setArtworkVerification = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const artwork = await Artwork.findById(req.params.id);
  if (!artwork) throw new ApiError(404, "Artwork not found");

  artwork.isVerified = verified;
  if (!verified) artwork.isActive = false;
  await artwork.save();

  res.json({
    success: true,
    artwork: {
      _id: artwork._id,
      title: artwork.title,
      isVerified: artwork.isVerified,
      isActive: artwork.isActive,
    },
  });
});

/* ---------- advisory ---------- */

export const listAdvisory = asyncHandler(async (req, res) => {
  const requests = await AdvisoryRequest.find()
    .sort({ createdAt: -1 })
    .populate("userId", "name email role");
  res.json({ success: true, data: requests });
});

export const updateAdvisoryStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const request = await AdvisoryRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Advisory request not found");
  request.status = status;
  if (note !== undefined) request.note = note;
  await request.save();
  res.json({ success: true, request });
});

/* ---------- collections ---------- */

export const createCollection = asyncHandler(async (req, res) => {
  const { title, subtitle, curatorNote, coverImageUrl, artworkIds, isFeatured } = req.body;
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  const collection = await Collection.create({
    title,
    slug,
    subtitle,
    curatorNote,
    coverImageUrl,
    artworkIds,
    isFeatured,
  });
  res.status(201).json({ success: true, collection });
});

export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection) throw new ApiError(404, "Collection not found");
  Object.assign(collection, req.body);
  await collection.save();
  res.json({ success: true, collection });
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);
  if (!collection) throw new ApiError(404, "Collection not found");
  collection.isActive = false;
  await collection.save();
  res.json({ success: true, message: "Collection removed" });
});
