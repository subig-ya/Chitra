import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { listNotificationsQuerySchema } from "../validators/notification.validators.js";
import {
  listMyNotifications,
  getUnreadCount,
  markAllRead,
  markRead,
} from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listNotificationsQuerySchema, "query"), listMyNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", markRead);

export default router;
