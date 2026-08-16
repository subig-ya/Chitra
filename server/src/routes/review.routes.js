import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createReviewSchema,
  listReviewsQuerySchema,
} from "../validators/review.validators.js";
import {
  createReview,
  listArtistReviews,
} from "../controllers/review.controller.js";

const router = Router();

router.post("/", authenticate, validate(createReviewSchema), createReview);
router.get(
  "/artist/:id",
  validate(listReviewsQuerySchema, "query"),
  listArtistReviews
);

export default router;
