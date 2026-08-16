import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { uploadImage } from "../controllers/upload.controller.js";

const router = Router();

router.post("/", authenticate, uploadImage);

export default router;
