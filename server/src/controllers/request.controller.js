import { CommissionRequest } from "../models/CommissionRequest.js";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { env } from "../config/env.js";

function expireStaleRequests() {
  return CommissionRequest.updateMany(
    { status: "pending", expiresAt: { $lt: new Date() } },
    { $set: { status: "expired" } }
  );
}

async function assertArtistTarget(artistId) {
  const artist = await User.findOne({ _id: artistId, role: "artist" }).select(
    "name artistProfile"
  );
  if (!artist) throw new ApiError(404, "Artist not found");
  return artist;
}

export const createRequest = asyncHandler(async (req, res) => {
  const { artistId, packageId, briefDescription, referenceImages, budgetRange } =
    req.body;

  if (artistId === req.userId) {
    throw new ApiError(400, "You cannot commission yourself");
  }

  const artist = await assertArtistTarget(artistId);

  let packageTitle;
  if (packageId) {
    const pkg = (artist.artistProfile?.commissionPackages || []).find(
      (p) => p._id.toString() === packageId
    );
    if (!pkg) {
      throw new ApiError(400, "Package does not belong to this artist");
    }
    packageTitle = pkg.title;
  }

  const request = await CommissionRequest.create({
    buyerId: req.userId,
    artistId,
    packageId,
    packageTitle,
    briefDescription,
    referenceImages,
    budgetRange,
    status: "pending",
    expiresAt: new Date(Date.now() + env.requestExpiryDays * 24 * 60 * 60 * 1000),
  });

  res.status(201).json({ success: true, request });
});

export const listMyRequests = asyncHandler(async (req, res) => {
  await expireStaleRequests();

  const { status, page, limit } = req.validatedQuery;

  const filter = { [req.userRole === "artist" ? "artistId" : "buyerId"]: req.userId };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    CommissionRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CommissionRequest.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const quoteRequest = asyncHandler(async (req, res) => {
  await expireStaleRequests();

  const request = await CommissionRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (request.artistId.toString() !== req.userId) {
    throw new ApiError(403, "Only the receiving artist can quote this request");
  }
  if (request.status !== "pending") {
    throw new ApiError(
      409,
      `Cannot quote a request in status "${request.status}"`
    );
  }

  request.quote = {
    quotedPrice: req.body.quotedPrice,
    quotedTurnaroundDays: req.body.quotedTurnaroundDays,
    quoteNote: req.body.quoteNote,
    quotedAt: new Date(),
  };
  request.status = "quoted";
  await request.save();

  res.json({ success: true, request });
});

export const rejectRequest = asyncHandler(async (req, res) => {
  await expireStaleRequests();

  const request = await CommissionRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (request.artistId.toString() !== req.userId) {
    throw new ApiError(403, "Only the receiving artist can reject this request");
  }
  if (request.status !== "pending") {
    throw new ApiError(
      409,
      `Cannot reject a request in status "${request.status}"`
    );
  }

  request.status = "rejected";
  await request.save();

  res.json({ success: true, request });
});

export const acceptRequest = asyncHandler(async (req, res) => {
  const request = await CommissionRequest.findById(req.params.id);
  if (!request) throw new ApiError(404, "Request not found");
  if (request.buyerId.toString() !== req.userId) {
    throw new ApiError(403, "Only the requesting buyer can accept this quote");
  }
  if (request.status !== "quoted" || !request.quote?.quotedPrice) {
    throw new ApiError(409, "This request has no pending quote to accept");
  }

  const accepted = await CommissionRequest.findOneAndUpdate(
    { _id: request._id, status: "quoted" },
    { $set: { status: "accepted" } },
    { new: true }
  );
  if (!accepted) {
    throw new ApiError(409, "This request was already accepted or is no longer quotable");
  }

  const artist = await User.findById(request.artistId).select("name artistProfile");
  let revisionLimit = 2;
  if (request.packageId) {
    const pkg = (artist?.artistProfile?.commissionPackages || []).find(
      (p) => p._id.toString() === request.packageId.toString()
    );
    if (pkg) revisionLimit = pkg.revisionLimit;
  }

  const agreedPrice = request.quote.quotedPrice;
  const platformFeePercent = env.platformFeePercent;
  const artistPayoutAmount = Math.round(
    agreedPrice * (1 - platformFeePercent / 100)
  );

  const order = await Order.create({
    requestId: request._id,
    buyerId: request.buyerId,
    artistId: request.artistId,
    packageTitle: request.packageTitle,
    agreedPrice,
    platformFeePercent,
    artistPayoutAmount,
    status: "awaiting_payment",
    revisionLimit,
  });

  res.status(201).json({ success: true, request: accepted, order });
});
