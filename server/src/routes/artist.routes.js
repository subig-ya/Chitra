import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createPackageSchema,
  updatePackageSchema,
  listArtistsQuerySchema,
  artistIdParamSchema,
} from "../validators/artist.validators.js";
import {
  listArtists,
  getArtistProfile,
  createPackage,
  updatePackage,
  deletePackage,
} from "../controllers/artist.controller.js";

const router = Router();

router.get("/", validate(listArtistsQuerySchema, "query"), listArtists);

router.get(
  "/:id",
  validate(artistIdParamSchema, "params"),
  getArtistProfile
);

router.post(
  "/me/packages",
  authenticate,
  requireRole("artist"),
  validate(createPackageSchema),
  createPackage
);

router.patch(
  "/me/packages/:packageId",
  authenticate,
  requireRole("artist"),
  validate(updatePackageSchema),
  updatePackage
);

router.delete(
  "/me/packages/:packageId",
  authenticate,
  requireRole("artist"),
  deletePackage
);

export default router;
