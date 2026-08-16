import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateMeSchema, wishlistItemSchema } from "../validators/user.validators.js";
import {
  getMe,
  updateMe,
  getPublicProfile,
  addWishlistItem,
  removeWishlistItem,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateMeSchema), updateMe);
router.post(
  "/me/wishlist",
  authenticate,
  validate(wishlistItemSchema),
  addWishlistItem
);
router.delete("/me/wishlist/:artworkId", authenticate, removeWishlistItem);
router.get("/:id", getPublicProfile);

export default router;
