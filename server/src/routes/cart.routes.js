import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
  checkoutSchema,
} from "../validators/cart.validators.js";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkoutCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getCart);
router.post("/items", validate(addCartItemSchema), addCartItem);
router.patch("/items/:artworkId", validate(updateCartItemSchema), updateCartItem);
router.delete("/items/:artworkId", removeCartItem);
router.delete("/", clearCart);
router.post("/checkout", validate(checkoutSchema), checkoutCart);

export default router;
