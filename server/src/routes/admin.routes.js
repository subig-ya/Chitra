import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { setVerificationSchema } from "../validators/admin.validators.js";
import {
  listPendingArtists,
  setArtistVerification,
  getAnalytics,
} from "../controllers/admin.controller.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/artists/pending", listPendingArtists);
router.patch(
  "/artists/:id/verify",
  validate(setVerificationSchema),
  setArtistVerification
);
router.get("/analytics", getAnalytics);

export default router;
