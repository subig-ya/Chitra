import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import artistRoutes from "./artist.routes.js";
import requestRoutes from "./request.routes.js";
import orderRoutes from "./order.routes.js";
import paymentRoutes from "./payment.routes.js";
import payoutRoutes from "./payout.routes.js";
import reviewRoutes from "./review.routes.js";
import disputeRoutes from "./dispute.routes.js";
import messageRoutes from "./message.routes.js";
import adminRoutes from "./admin.routes.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/health", (_req, res) =>
  res.json({ success: true, message: "Chitra API is running", ts: new Date().toISOString() })
);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/artists", artistRoutes);
router.use("/requests", requestRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/payouts", payoutRoutes);
router.use("/reviews", reviewRoutes);
router.use("/disputes", disputeRoutes);
router.use("/messages", messageRoutes);
router.use("/admin", adminRoutes);

router.use("/protected-ping", authenticate, (req, res) =>
  res.json({ success: true, user: req.user })
);

export default router;
