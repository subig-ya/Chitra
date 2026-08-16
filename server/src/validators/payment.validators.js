import { z } from "zod";
import { GATEWAYS } from "../models/Payment.js";

export const initiatePaymentSchema = z.object({
  orderId: z.string().length(24, "Invalid order id"),
  gateway: z.enum(GATEWAYS, { message: "Gateway must be esewa or khalti" }),
});

export const verifyPaymentSchema = z.object({
  paymentId: z.string().length(24, "Invalid payment id"),
  reference: z.string().min(1, "Reference is required"),
});
