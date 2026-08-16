import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listOrdersQuerySchema,
  milestoneSchema,
  deliverSchema,
  requestRevisionSchema,
} from "../validators/order.validators.js";
import {
  listMyOrders,
  getOrder,
  addMilestone,
  deliverOrder,
  approveOrder,
  requestRevision,
  cancelOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listOrdersQuerySchema, "query"), listMyOrders);
router.get("/:id", getOrder);
router.patch("/:id/milestone", validate(milestoneSchema), addMilestone);
router.patch("/:id/deliver", validate(deliverSchema), deliverOrder);
router.patch("/:id/approve", approveOrder);
router.patch("/:id/request-revision", validate(requestRevisionSchema), requestRevision);
router.patch("/:id/cancel", cancelOrder);

export default router;
