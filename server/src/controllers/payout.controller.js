import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Payout } from "../models/Payout.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function findEligibleReleasedOrders(artistId) {
  const orders = await Order.find({
    artistId,
    status: "completed",
    paymentId: { $ne: null },
  }).select("_id artistPayoutAmount");

  const orderIds = orders.map((o) => o._id);

  const released = await Payment.find({
    orderId: { $in: orderIds },
    status: "released_to_artist",
  }).select("_id orderId");

  const used = await Payout.find({
    orderIds: { $in: orderIds },
    status: { $ne: "failed" },
  }).select("orderIds");

  const usedSet = new Set(
    used.flatMap((p) => p.orderIds.map((id) => id.toString()))
  );

  return orders.filter((o) => {
    const payment = released.find(
      (p) => p.orderId.toString() === o._id.toString()
    );
    return payment && !usedSet.has(o._id.toString());
  });
}

export const requestPayout = asyncHandler(async (req, res) => {
  const eligible = await findEligibleReleasedOrders(req.userId);
  if (eligible.length === 0) {
    throw new ApiError(
      400,
      "No released funds available. Complete orders must be approved and payments released first."
    );
  }

  const amount = eligible.reduce((sum, o) => sum + o.artistPayoutAmount, 0);
  const payout = await Payout.create({
    artistId: req.userId,
    orderIds: eligible.map((o) => o._id),
    amount,
    status: "pending",
    note: req.body.note,
  });

  res.status(201).json({
    success: true,
    payout,
    message: `Payout of Rs.${amount} requested for ${eligible.length} order(s)`,
  });
});

export const listMyPayouts = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.validatedQuery;
  const filter = { artistId: req.userId };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Payout.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Payout.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const listPendingPayouts = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.validatedQuery;
  const filter = status ? { status } : { status: { $in: ["pending", "processing"] } };

  const [data, total] = await Promise.all([
    Payout.find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("artistId", "name email")
      .populate("orderIds", "agreedPrice artistPayoutAmount")
      .lean(),
    Payout.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const updatePayoutStatus = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id);
  if (!payout) throw new ApiError(404, "Payout not found");
  if (payout.status === "paid" || payout.status === "failed") {
    throw new ApiError(409, `Payout already finalized as "${payout.status}"`);
  }

  payout.status = req.body.status;
  if (req.body.note !== undefined) payout.note = req.body.note;
  if (req.body.status === "paid" || req.body.status === "failed") {
    payout.processedAt = new Date();
    payout.processedBy = req.userId;
  }
  await payout.save();

  res.json({ success: true, payout });
});
