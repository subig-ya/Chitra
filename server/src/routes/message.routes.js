import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  sendMessageSchema,
  listMessagesQuerySchema,
} from "../validators/message.validators.js";
import { listMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.use(authenticate);

router.get(
  "/:orderId",
  validate(listMessagesQuerySchema, "query"),
  listMessages
);
router.post("/:orderId", validate(sendMessageSchema), sendMessage);

export default router;
