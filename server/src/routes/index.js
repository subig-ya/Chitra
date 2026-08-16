import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import artistRoutes from "./artist.routes.js";
import requestRoutes from "./request.routes.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "Chitra API is running", ts: new Date().toISOString() })
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/artists", artistRoutes);
router.use("/requests", requestRoutes);

router.use("/protected-ping", authenticate, (req, res) =>
  res.json({ success: true, user: req.user })
);

export default router;
