import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";

/**
 * Core escrow transitions. Money is a ledger state only:
 * initiated -> held_in_escrow (buyer paid) -> released_to_artist (order approved).
 */
export async function holdEscrow({ paymentId, transactionId, rawCallback }) {
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;
  if (payment.status === "held_in_escrow") return payment;

  if (payment.status !== "initiated") {
    return payment;
  }

  payment.status = "held_in_escrow";
  payment.gatewayTransactionId = transactionId;
  if (rawCallback !== undefined) payment.rawCallback = rawCallback;
  payment.heldAt = new Date();
  await payment.save();

  const order = await Order.findById(payment.orderId);
  if (order && order.status === "awaiting_payment") {
    order.status = "in_progress";
    order.paymentId = payment._id;
    await order.save();
  }
  return payment;
}

export async function releasePayment(order) {
  if (order.paymentId) {
    const payment = await Payment.findById(order.paymentId);
    if (payment && payment.status === "held_in_escrow") {
      payment.status = "released_to_artist";
      payment.releasedAt = new Date();
      await payment.save();
    }
  }
}

export async function refundPayment(order) {
  if (order.paymentId) {
    const payment = await Payment.findById(order.paymentId);
    if (payment && payment.status !== "refunded") {
      payment.status = "refunded";
      payment.failedAt = new Date();
      await payment.save();
    }
  }
}
