import { Notification } from "../models/Notification.js";
import { User } from "../models/User.js";

/**
 * Create a notification for a single user.
 */
export async function notify(userId, { type, title, message, refId, refModel }) {
  if (!userId) return;
  await Notification.create({ userId, type, title, message, refId, refModel });
}

/**
 * Create a notification for every admin user.
 */
export async function notifyAdmins({ type, title, message, refId, refModel }) {
  const admins = await User.find({ role: "admin" }).select("_id").lean();
  if (admins.length === 0) return;
  await Notification.insertMany(
    admins.map((a) => ({
      userId: a._id,
      type,
      title,
      message,
      refId,
      refModel,
    }))
  );
}
