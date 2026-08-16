import { User } from "../models/User.js";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Payout } from "../models/Payout.js";
import { Dispute } from "../models/Dispute.js";
import { CommissionRequest } from "../models/CommissionRequest.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const PENDING_FIELDS = "name email avatar bio artistProfile role createdAt";

export const listPendingArtists = asyncHandler(async (req, res) => {
  const artists = await User.find({
    role: "artist",
    "artistProfile.isVerified": false,
  })
    .select(PENDING_FIELDS)
    .sort({ createdAt: 1 })
    .lean();

  res.json({ success: true, data: artists });
});

export const setArtistVerification = asyncHandler(async (req, res) => {
  const { verified } = req.body;
  const artist = await User.findOne({ _id: req.params.id, role: "artist" });
  if (!artist) throw new ApiError(404, "Artist not found");

  artist.artistProfile ??= { isVerified: false };
  artist.artistProfile.isVerified = verified;
  await artist.save();

  res.json({
    success: true,
    artist: {
      _id: artist._id,
      name: artist.name,
      isVerified: artist.artistProfile.isVerified,
    },
  });
});

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [userRoles, orderStatuses, requestStatuses, escrow, released, refunded, paidPayouts, openDisputes] =
    await Promise.all([
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      CommissionRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        {
          $match: { status: "held_in_escrow" },
        },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        {
          $match: { status: "released_to_artist" },
        },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: { status: "refunded" } },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$refundAmount", "$amount"] } },
            count: { $sum: 1 },
          },
        },
      ]),
      Payout.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Dispute.countDocuments({ status: { $ne: "resolved" } }),
    ]);

  const toMap = (rows) =>
    Object.fromEntries(rows.map((r) => [r._id || "unknown", r.count]));

  const escrowHeld = escrow[0]?.total ?? 0;
  const escrowHeldCount = escrow[0]?.count ?? 0;
  const escrowReleased = released[0]?.total ?? 0;

  res.json({
    success: true,
    analytics: {
      users: toMap(userRoles),
      orders: toMap(orderStatuses),
      requests: toMap(requestStatuses),
      escrow: {
        heldInEscrow: escrowHeld,
        heldOrderCount: escrowHeldCount,
        releasedToArtists: escrowReleased,
        refunded: refunded[0]?.total ?? 0,
      },
      payouts: {
        paidCount: paidPayouts[0]?.count ?? 0,
        paidTotal: paidPayouts[0]?.total ?? 0,
      },
      openDisputes,
    },
  });
});
