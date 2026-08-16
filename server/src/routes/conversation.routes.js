import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  startConversationSchema,
  sendConversationMessageSchema,
} from "../validators/conversation.validators.js";
import {
  listConversations,
  startConversation,
  getConversationMessages,
  sendConversationMessage,
} from "../controllers/conversation.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", listConversations);
router.post("/", validate(startConversationSchema), startConversation);
router.get("/:id/messages", getConversationMessages);
router.post("/:id/messages", validate(sendConversationMessageSchema), sendConversationMessage);

export default router;
