import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { Order } from "../models/Order.js";
import { Payment } from "../models/Payment.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildRedirectUrl, verifyTransaction, assertGatewayAvailable } from "../services/gateway.js";
import { holdEscrow } from "../services/escrow.js";

export const initiatePayment = asyncHandler(async (req, res) => {
  const { orderId, gateway } = req.body;
  assertGatewayAvailable(gateway);

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.buyerId.toString() !== req.userId) {
    throw new ApiError(403, "Only the buyer on this order can initiate payment");
  }
  if (order.status !== "awaiting_payment") {
    throw new ApiError(409, `Cannot pay for an order in status "${order.status}"`);
  }

  let payment = await Payment.findOne({
    orderId: order._id,
    status: { $in: ["initiated"] },
  });

  if (!payment) {
    payment = await Payment.create({
      orderId: order._id,
      buyerId: order.buyerId,
      gateway,
      amount: order.agreedPrice,
      status: "initiated",
      reference: `CHITRA-${randomUUID().slice(0, 12)}`,
    });
  }

  res.status(201).json({
    success: true,
    payment: {
      _id: payment._id,
      orderId: payment.orderId,
      gateway: payment.gateway,
      amount: payment.amount,
      status: payment.status,
      reference: payment.reference,
    },
    redirectUrl: buildRedirectUrl({
      gateway,
      paymentId: payment._id.toString(),
      reference: payment.reference,
    }),
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, reference } = req.body;

  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, "Payment not found");
  if (payment.buyerId.toString() !== req.userId) {
    throw new ApiError(403, "Only the paying buyer can verify this payment");
  }

  const result = await verifyTransaction({
    gateway: payment.gateway,
    reference,
    expectedAmount: payment.amount,
    paymentId: payment._id.toString(),
  });

  if (result.status !== "COMPLETE") {
    throw new ApiError(400, `Payment not confirmed by gateway (${result.status})`);
  }

  const held = await holdEscrow({
    paymentId: payment._id,
    transactionId: result.transactionId,
  });

  const order = await Order.findById(payment.orderId).lean();
  res.json({
    success: true,
    message: "Payment received and held in escrow",
    payment: held,
    order: { _id: order._id, status: order.status },
  });
});

async function processGatewayCallback({ orderId, amount, transactionId, rawCallback }) {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  const payment = await Payment.findOne({
    orderId: order._id,
    status: "initiated",
  });
  if (!payment) {
    // Idempotent: if already held, acknowledge.
    const existing = await Payment.findOne({ orderId: order._id, status: "held_in_escrow" });
    if (existing) return existing;
    throw new ApiError(400, "No initiated payment for this order");
  }

  if (payment.amount !== amount) {
    throw new ApiError(400, "Amount mismatch with payment record");
  }

  return holdEscrow({
    paymentId: payment._id,
    transactionId,
    rawCallback,
  });
}

export const webhookEsewa = asyncHandler(async (req, res) => {
  const { oid, amt, refId } = req.body;
  if (!oid || amt === undefined || !refId) {
    throw new ApiError(400, "Malformed eSewa callback");
  }
  if (!mongoose.isValidObjectId(oid)) {
    throw new ApiError(400, "Malformed eSewa callback: invalid order id");
  }

  await processGatewayCallback({
    orderId: oid,
    amount: Number(amt),
    transactionId: refId,
    rawCallback: req.body,
  });

  res.json({ success: true });
});

export const webhookKhalti = asyncHandler(async (req, res) => {
  const { token, amount, idx } = req.body;
  if (!token || amount === undefined) {
    throw new ApiError(400, "Malformed Khalti callback");
  }

  // Mock: token is treated as the transaction reference. Real integration
  // would call Khalti's verification API with the token before releasing.
  const payment = await Payment.findOne({ reference: token, status: "initiated" });
  if (!payment) {
    const existing = await Payment.findOne({ status: "held_in_escrow", "rawCallback.token": token });
    if (existing) return res.json({ success: true });
    throw new ApiError(400, "No initiated payment matching Khalti token");
  }

  await processGatewayCallback({
    orderId: payment.orderId.toString(),
    amount: Number(amount),
    transactionId: idx || token,
    rawCallback: req.body,
  });

  res.json({ success: true });
});
