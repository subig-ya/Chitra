import { Order } from "../models/Order.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { releasePayment, refundPayment } from "../services/escrow.js";
import { env } from "../config/env.js";
import { notify } from "../services/notify.js";

function refId(ref) {
  return String(ref && ref._id ? ref._id : ref);
}

async function assertParticipant(order, req) {
  const isAdmin = req.userRole === "admin";
  const isBuyer = refId(order.buyerId) === req.userId;
  const isArtist = refId(order.artistId) === req.userId;
  if (!isAdmin && !isBuyer && !isArtist) {
    throw new ApiError(403, "You are not a participant on this order");
  }
  return { isBuyer, isArtist };
}

export const listMyOrders = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.validatedQuery;
  const filter = {
    [req.userRole === "artist" ? "artistId" : "buyerId"]: req.userId,
  };
  if (status) filter.status = status;

  const [data, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("buyerId", "name avatar")
      .populate("artistId", "name avatar")
      .populate("artworkId", "title imageUrl price")
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("buyerId", "name avatar")
    .populate("artistId", "name avatar")
    .populate("artworkId", "title imageUrl price");
  if (!order) throw new ApiError(404, "Order not found");

  await assertParticipant(order, req);

  res.json({ success: true, order });
});

export const addMilestone = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  await assertParticipant(order, req);
  if (refId(order.artistId) !== req.userId) {
    throw new ApiError(403, "Only the artist can post milestones");
  }
  if (!["in_progress", "revision_requested"].includes(order.status)) {
    throw new ApiError(
      409,
      `Cannot add milestones to an order in status "${order.status}"`
    );
  }

  order.milestones.push(req.body);
  await order.save();
  res.status(201).json({ success: true, milestone: order.milestones.at(-1) });
});

export const deliverOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  await assertParticipant(order, req);
  if (refId(order.artistId) !== req.userId) {
    throw new ApiError(403, "Only the artist can submit deliverables");
  }
  if (!["in_progress", "revision_requested"].includes(order.status)) {
    throw new ApiError(
      409,
      `Cannot deliver an order in status "${order.status}"`
    );
  }

  const lastVersion = order.deliverables.length
    ? order.deliverables.at(-1).version
    : 0;
  order.deliverables.push({
    fileUrl: req.body.fileUrl,
    version: lastVersion + 1,
  });
  order.status = "delivered";
  order.deliveredAt = new Date();
  order.autoReleaseAt = new Date(
    Date.now() + env.autoReleaseDays * 24 * 60 * 60 * 1000
  );
  await order.save();

  await notify(refId(order.buyerId), {
    type: "order",
    title: "Deliverables submitted",
    message: `The artist delivered "${order.packageTitle}". Review and approve before auto-release.`,
    refId: order._id,
    refModel: "Order",
  });

  res.json({
    success: true,
    order,
    message: `Delivered. Buyer has ${env.autoReleaseDays} days to approve before auto-release.`,
  });
});

export const approveOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  await assertParticipant(order, req);
  if (refId(order.buyerId) !== req.userId) {
    throw new ApiError(403, "Only the buyer can approve a delivery");
  }
  if (order.status !== "delivered") {
    throw new ApiError(
      409,
      `Cannot approve an order in status "${order.status}"`
    );
  }

  order.status = "completed";
  order.approvedAt = new Date();
  order.autoReleaseAt = null;
  await order.save();

  await releasePayment(order);

  await User.updateOne(
    { _id: order.artistId },
    { $inc: { "artistProfile.totalOrders": 1 } }
  );

  await notify(refId(order.artistId), {
    type: "payment",
    title: "Payment released from escrow",
    message: `The buyer approved "${order.packageTitle}". Rs. ${order.artistPayoutAmount} has been released to you.`,
    refId: order._id,
    refModel: "Order",
  });

  res.json({
    success: true,
    order,
    message: "Delivery approved. Payment released from escrow to the artist.",
  });
});

export const requestRevision = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  await assertParticipant(order, req);
  if (refId(order.buyerId) !== req.userId) {
    throw new ApiError(403, "Only the buyer can request a revision");
  }
  if (order.status !== "delivered") {
    throw new ApiError(
      409,
      `Cannot request a revision on an order in status "${order.status}"`
    );
  }
  if (order.revisionCount >= order.revisionLimit) {
    throw new ApiError(
      409,
      `Revision limit (${order.revisionLimit}) reached`
    );
  }

  order.status = "revision_requested";
  order.revisionCount += 1;
  if (req.body.note) {
    order.milestones.push({
      title: `Revision ${order.revisionCount}`,
      note: req.body.note,
    });
  }
  await order.save();

  await notify(refId(order.artistId), {
    type: "order",
    title: "Revision requested",
    message: `The buyer asked for a revision (${order.revisionCount}/${order.revisionLimit}) on "${order.packageTitle}"${req.body.note ? `: ${req.body.note.slice(0, 120)}` : ""}.`,
    refId: order._id,
    refModel: "Order",
  });

  res.json({
    success: true,
    order,
    message: `Revision requested (${order.revisionCount}/${order.revisionLimit})`,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  await assertParticipant(order, req);
  if (refId(order.buyerId) !== req.userId) {
    throw new ApiError(403, "Only the buyer can cancel an order");
  }
  if (order.status !== "awaiting_payment") {
    throw new ApiError(
      409,
      `Only unpaid orders can be cancelled (status: "${order.status}")`
    );
  }

  order.status = "cancelled";
  order.autoReleaseAt = null;
  await order.save();
  await refundPayment(order);

  await notify(refId(order.artistId), {
    type: "order",
    title: "Order cancelled",
    message: `The buyer cancelled "${order.packageTitle}". The artwork is back on sale.`,
    refId: order._id,
    refModel: "Order",
  });

  res.json({ success: true, order, message: "Order cancelled" });
});
