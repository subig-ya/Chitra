import { Order } from "../models/Order.js";
import { Dispute } from "../models/Dispute.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { releasePayment, refundPayment } from "../services/escrow.js";
import { notify, notifyAdmins } from "../services/notify.js";

const ACTIVE_ORDER_STATES = ["in_progress", "delivered", "revision_requested"];

export const raiseDispute = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const isBuyer = order.buyerId.toString() === req.userId;
  const isArtist = order.artistId.toString() === req.userId;
  if (!isBuyer && !isArtist) {
    throw new ApiError(403, "Only the buyer or artist on this order can dispute it");
  }

  if (!ACTIVE_ORDER_STATES.includes(order.status)) {
    throw new ApiError(
      409,
      `Disputes can only be raised on active paid orders (status: "${order.status}")`
    );
  }

  const existing = await Dispute.findOne({ orderId, status: { $ne: "resolved" } });
  if (existing) {
    throw new ApiError(409, "An open dispute already exists for this order");
  }

  const dispute = await Dispute.create({
    orderId,
    raisedBy: req.userId,
    reason,
    status: "open",
  });

  order.status = "disputed";
  order.autoReleaseAt = null;
  await order.save();

  const otherParty =
    order.buyerId.toString() === req.userId ? order.artistId : order.buyerId;
  await notify(otherParty, {
    type: "dispute",
    title: "A dispute was opened on your order",
    message: `A dispute was raised on "${order.packageTitle}". Chitra's team has been notified.`,
    refId: dispute._id,
    refModel: "Dispute",
  });
  await notifyAdmins({
    type: "dispute",
    title: "New dispute to resolve",
    message: `A dispute was raised on "${order.packageTitle}".`,
    refId: dispute._id,
    refModel: "Dispute",
  });

  res.status(201).json({ success: true, dispute, orderStatus: order.status });
});

export const listDisputes = asyncHandler(async (req, res) => {
  const { status, page, limit } = req.validatedQuery;
  const filter = status ? { status } : {};

  const [data, total] = await Promise.all([
    Dispute.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("raisedBy", "name role")
      .populate("orderId", "agreedPrice status buyerId artistId")
      .lean(),
    Dispute.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const resolveDispute = asyncHandler(async (req, res) => {
  const dispute = await Dispute.findById(req.params.id);
  if (!dispute) throw new ApiError(404, "Dispute not found");
  if (dispute.status === "resolved") {
    throw new ApiError(409, "Dispute is already resolved");
  }

  const { resolution, resolutionNote, refundAmount } = req.body;
  const order = await Order.findById(dispute.orderId);
  if (!order) throw new ApiError(404, "Order not found");

  if (resolution === "release_to_artist") {
    await releasePayment(order);
    order.status = "completed";
    order.approvedAt = new Date();
  } else if (resolution === "refund_buyer") {
    await refundPayment(order);
    order.status = "refunded";
  } else {
    await refundPayment(order, refundAmount);
    order.status = "completed";
    order.approvedAt = new Date();
  }
  order.autoReleaseAt = null;
  await order.save();

  dispute.status = "resolved";
  dispute.resolution = resolution;
  dispute.resolutionNote = resolutionNote;
  if (refundAmount !== undefined) dispute.refundAmount = refundAmount;
  dispute.resolvedBy = req.userId;
  dispute.resolvedAt = new Date();
  await dispute.save();

  const parties = [order.buyerId, order.artistId].filter(
    (id) => id.toString() !== req.userId
  );
  await Promise.all(
    parties.map((party) =>
      notify(party, {
        type: "dispute",
        title: "Your dispute was resolved",
        message: `Chitra resolved the dispute on "${order.packageTitle}" (${resolution.replace(/_/g, " ")}).`,
        refId: dispute._id,
        refModel: "Dispute",
      })
    )
  );

  res.json({ success: true, dispute, orderStatus: order.status });
});
