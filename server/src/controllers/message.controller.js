import { Order } from "../models/Order.js";
import { Message } from "../models/Message.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

async function assertOrderParticipant(orderId, req) {
  const order = await Order.findById(orderId).select("buyerId artistId");
  if (!order) throw new ApiError(404, "Order not found");

  const isParticipant =
    req.userRole === "admin" ||
    order.buyerId.toString() === req.userId ||
    order.artistId.toString() === req.userId;

  if (!isParticipant) {
    throw new ApiError(403, "Only order participants can message");
  }
  return order;
}

export const listMessages = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  await assertOrderParticipant(orderId, req);

  const { before, limit } = req.validatedQuery;
  const filter = { orderId };
  if (before) filter.createdAt = { $lt: new Date(before) };

  const data = await Message.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("senderId", "name avatar role");

  const unreadUpdate = await Message.updateMany(
    {
      orderId,
      senderId: { $ne: req.userId },
      isRead: false,
    },
    { $set: { isRead: true } }
  );

  res.json({
    success: true,
    data: data.reverse(),
    markedRead: unreadUpdate.modifiedCount,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  await assertOrderParticipant(orderId, req);

  const message = await Message.create({
    orderId,
    senderId: req.userId,
    text: req.body.text,
    attachmentUrl: req.body.attachmentUrl,
  });

  res.status(201).json({ success: true, message });
});
