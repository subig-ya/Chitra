import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { setVerificationSchema } from "../validators/admin.validators.js";
import {
  updateAdvisoryStatusSchema,
} from "../validators/advisory.validators.js";
import {
  createCollectionSchema,
  updateCollectionSchema,
} from "../validators/collection.validators.js";
import {
  listPendingArtists,
  setArtistVerification,
  getAnalytics,
} from "../controllers/admin.controller.js";
import {
  listPendingArtworks,
  setArtworkVerification,
  listAdvisory,
  updateAdvisoryStatus,
  createCollection,
  updateCollection,
  deleteCollection,
} from "../controllers/adminShop.controller.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/artists/pending", listPendingArtists);
router.patch(
  "/artists/:id/verify",
  validate(setVerificationSchema),
  setArtistVerification
);
router.get("/analytics", getAnalytics);

/* Shop moderation */
router.get("/artworks/pending", listPendingArtworks);
router.patch(
  "/artworks/:id/verify",
  validate(setVerificationSchema),
  setArtworkVerification
);

/* Advisory */
router.get("/advisory", listAdvisory);
router.patch(
  "/advisory/:id/status",
  validate(updateAdvisoryStatusSchema),
  updateAdvisoryStatus
);

/* Collections */
router.post("/collections", validate(createCollectionSchema), createCollection);
router.patch(
  "/collections/:id",
  validate(updateCollectionSchema),
  updateCollection
);
router.delete("/collections/:id", deleteCollection);

export default router;
