import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  requestPayoutSchema,
  updatePayoutSchema,
  listPayoutsQuerySchema,
} from "../validators/payout.validators.js";
import {
  requestPayout,
  listMyPayouts,
  listPendingPayouts,
  updatePayoutStatus,
} from "../controllers/payout.controller.js";

const router = Router();

router.post(
  "/request",
  authenticate,
  requireRole("artist"),
  validate(requestPayoutSchema),
  requestPayout
);

router.get(
  "/my",
  authenticate,
  requireRole("artist"),
  validate(listPayoutsQuerySchema, "query"),
  listMyPayouts
);

router.get(
  "/pending",
  authenticate,
  requireRole("admin"),
  validate(listPayoutsQuerySchema, "query"),
  listPendingPayouts
);

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  validate(updatePayoutSchema),
  updatePayoutStatus
);

export default router;
