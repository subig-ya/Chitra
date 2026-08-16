import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createAdvisoryRequestSchema } from "../validators/advisory.validators.js";
import { createAdvisoryRequest } from "../controllers/advisory.controller.js";

const router = Router();

router.post(
  "/requests",
  optionalAuth,
  validate(createAdvisoryRequestSchema),
  createAdvisoryRequest
);

export default router;
