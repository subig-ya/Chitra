import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { Review } from "../models/Review.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, comment } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.buyerId.toString() !== req.userId) {
    throw new ApiError(403, "Only the buyer on this order can review it");
  }
  if (order.status !== "completed") {
    throw new ApiError(
      409,
      `Only completed orders can be reviewed (status: "${order.status}")`
    );
  }

  const existing = await Review.findOne({ orderId });
  if (existing) throw new ApiError(409, "This order has already been reviewed");

  const review = await Review.create({
    orderId,
    buyerId: req.userId,
    artistId: order.artistId,
    rating,
    comment,
  });

  // Recompute artist rating as weighted average.
  const artist = await User.findById(order.artistId).select(
    "artistProfile.rating artistProfile.ratingCount"
  );
  if (artist) {
    const profile = artist.artistProfile || { rating: 0, ratingCount: 0 };
    const newCount = profile.ratingCount + 1;
    const newRating =
      (profile.rating * profile.ratingCount + rating) / newCount;
    artist.artistProfile.rating = Math.round(newRating * 100) / 100;
    artist.artistProfile.ratingCount = newCount;
    await artist.save();
  }

  res.status(201).json({ success: true, review });
});

export const listArtistReviews = asyncHandler(async (req, res) => {
  const artistId = req.params.id;
  const { page, limit } = req.validatedQuery;

  const artist = await User.findOne({ _id: artistId, role: "artist" }).select(
    "artistProfile.rating artistProfile.ratingCount"
  );
  if (!artist) throw new ApiError(404, "Artist not found");

  const [data, total] = await Promise.all([
    Review.find({ artistId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("buyerId", "name avatar")
      .lean(),
    Review.countDocuments({ artistId }),
  ]);

  const profile = artist.artistProfile || { rating: 0, ratingCount: 0 };
  res.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      rating: profile.rating,
      ratingCount: profile.ratingCount,
    },
  });
});
