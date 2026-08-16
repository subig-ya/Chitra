import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateMeSchema } from "../validators/user.validators.js";
import { getMe, updateMe, getPublicProfile } from "../controllers/user.controller.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateMeSchema), updateMe);
router.get("/:id", getPublicProfile);

export default router;
