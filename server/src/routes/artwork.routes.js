import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createArtworkSchema,
  updateArtworkSchema,
  listArtworksQuerySchema,
} from "../validators/artwork.validators.js";
import {
  listArtworks,
  getArtwork,
  listMyArtworks,
  createArtwork,
  updateArtwork,
  deleteArtwork,
} from "../controllers/artwork.controller.js";

const router = Router();

router.get("/", validate(listArtworksQuerySchema, "query"), listArtworks);
router.get("/me", authenticate, requireRole("artist"), listMyArtworks);
router.get("/:id", getArtwork);

router.post(
  "/",
  authenticate,
  requireRole("artist"),
  validate(createArtworkSchema),
  createArtwork
);
router.patch(
  "/:id",
  authenticate,
  validate(updateArtworkSchema),
  updateArtwork
);
router.delete("/:id", authenticate, deleteArtwork);

export default router;
