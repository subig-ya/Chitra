import crypto from "node:crypto";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * Payment gateway abstraction.
 *
 * MOCK/SANDBOX mode: no real money moves. The redirect URL simply returns
 * to the client, and "verification" accepts any reference that matches an
 * initiated Payment whose amount is correct.
 *
 * To go live:
 *   - buildRedirectUrl(): eSewa initPayment / Khalti init with merchant keys
 *   - verifyTransaction(): eSewa transactionStatus API / Khalti verification API
 *   - verifyWebhookSignature(): real HMAC (eSewa) / secret-key header (Khalti)
 */

export function buildRedirectUrl({ gateway, paymentId, reference }) {
  const base = `${env.clientOrigin}/payment/return`;
  const params = new URLSearchParams({ gateway, pid: paymentId, reference });
  return `${base}?${params.toString()}`;
}

export async function verifyTransaction({ gateway, reference, expectedAmount, paymentId }) {
  // Mock: a transaction is "COMPLETE" if it references an initiated payment
  // with a matching amount. Real implementations call the gateway's API here.
  const { Payment } = await import("../models/Payment.js");
  const payment = await Payment.findOne({ _id: paymentId, reference });
  if (!payment) {
    return { status: "NOT_FOUND", amount: null };
  }
  if (payment.amount !== expectedAmount) {
    return { status: "AMOUNT_MISMATCH", amount: payment.amount };
  }
  return {
    status: "COMPLETE",
    amount: payment.amount,
    transactionId: `mock-${gateway}-${randomUUID().slice(0, 8)}`,
  };
}

export function verifyWebhookSignature(gateway, rawBody, signature, secret) {
  if (gateway === "esewa") {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");
    // Hash both to fixed length so timingSafeEqual never throws on length.
    const a = crypto.createHash("sha256").update(expected).digest();
    const b = crypto.createHash("sha256").update(signature || "").digest();
    return crypto.timingSafeEqual(a, b);
  }
  if (gateway === "khalti") {
    return typeof signature === "string" && signature === secret;
  }
  return false;
}

export function assertGatewayAvailable(gateway) {
  if (!["esewa", "khalti"].includes(gateway)) {
    throw new ApiError(400, "Unsupported payment gateway");
  }
}
