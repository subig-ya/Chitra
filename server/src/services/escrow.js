import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { Artwork } from "../models/Artwork.js";

function refId(ref) {
  return String(ref && ref._id ? ref._id : ref);
}

async function markArtworkSold(orderId) {
  const order = await Order.findById(orderId).select("artworkId");
  if (order?.artworkId) {
    await Artwork.updateOne({ _id: order.artworkId }, { availability: "sold" });
  }
}

async function releaseArtwork(order) {
  if (order?.artworkId) {
    await Artwork.updateOne(
      { _id: order.artworkId },
      { availability: "available" }
    );
  }
}

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
    await markArtworkSold(order._id);
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

export async function refundPayment(order, refundAmount) {
  if (order.paymentId) {
    const payment = await Payment.findById(order.paymentId);
    if (payment && payment.status !== "refunded") {
      payment.status = "refunded";
      if (refundAmount !== undefined) payment.refundAmount = refundAmount;
      payment.refundedAt = new Date();
      await payment.save();
    }
  }
  await releaseArtwork(order);
}
