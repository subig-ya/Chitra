import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { verifyGatewayCallback } from "../middleware/payment.js";
import {
  initiatePaymentSchema,
  verifyPaymentSchema,
} from "../validators/payment.validators.js";
import {
  initiatePayment,
  verifyPayment,
  webhookEsewa,
  webhookKhalti,
} from "../controllers/payment.controller.js";

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many webhook calls" },
});

const router = Router();

router.post(
  "/initiate",
  authenticate,
  rateLimit({ windowMs: 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }),
  validate(initiatePaymentSchema),
  initiatePayment
);
router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentSchema),
  verifyPayment
);
router.post(
  "/webhook/esewa",
  webhookLimiter,
  verifyGatewayCallback("esewa"),
  webhookEsewa
);
router.post(
  "/webhook/khalti",
  webhookLimiter,
  verifyGatewayCallback("khalti"),
  webhookKhalti
);

export default router;
