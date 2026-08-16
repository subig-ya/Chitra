import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listMyNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.validatedQuery;

  const filter = { userId: req.userId };
  const [data, total, unread] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.userId, readAt: null }),
  ]);

  res.json({
    success: true,
    data,
    unread,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unread = await Notification.countDocuments({
    userId: req.userId,
    readAt: null,
  });
  res.json({ success: true, unread });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.userId, readAt: null },
    { $set: { readAt: new Date() } }
  );
  res.json({ success: true, message: "All notifications marked as read" });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!notification) throw new ApiError(404, "Notification not found");

  notification.readAt = notification.readAt || new Date();
  await notification.save();
  res.json({ success: true, notification });
});
