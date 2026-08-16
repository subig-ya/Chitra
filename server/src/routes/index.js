import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "Chitra API is running", ts: new Date().toISOString() })
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);

router.use("/protected-ping", authenticate, (req, res) =>
  res.json({ success: true, user: req.user })
);

export default router;
