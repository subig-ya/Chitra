import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  raiseDisputeSchema,
  resolveDisputeSchema,
  listDisputesQuerySchema,
} from "../validators/dispute.validators.js";
import {
  raiseDispute,
  listDisputes,
  resolveDispute,
} from "../controllers/dispute.controller.js";

const router = Router();

router.post("/", authenticate, validate(raiseDisputeSchema), raiseDispute);
router.get(
  "/",
  authenticate,
  requireRole("admin"),
  validate(listDisputesQuerySchema, "query"),
  listDisputes
);
router.patch(
  "/:id/resolve",
  authenticate,
  requireRole("admin"),
  validate(resolveDisputeSchema),
  resolveDispute
);

export default router;
