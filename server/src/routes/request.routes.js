import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createRequestSchema,
  quoteRequestSchema,
  listRequestsQuerySchema,
} from "../validators/request.validators.js";
import {
  createRequest,
  listMyRequests,
  quoteRequest,
  rejectRequest,
  acceptRequest,
} from "../controllers/request.controller.js";

const router = Router();

router.post("/", authenticate, validate(createRequestSchema), createRequest);
router.get(
  "/my",
  authenticate,
  validate(listRequestsQuerySchema, "query"),
  listMyRequests
);
router.patch("/:id/quote", authenticate, validate(quoteRequestSchema), quoteRequest);
router.patch("/:id/reject", authenticate, rejectRequest);
router.patch("/:id/accept", authenticate, acceptRequest);

export default router;
