import cron from "node-cron";
import { Order } from "../models/Order.js";
import { releasePayment } from "../services/escrow.js";

async function autoApproveExpiredDeliveries() {
  const now = new Date();
  const orders = await Order.find({
    status: "delivered",
    autoReleaseAt: { $lte: now },
  });

  for (const order of orders) {
    order.status = "completed";
    order.approvedAt = now;
    order.autoReleaseAt = null;
    await order.save();
    await releasePayment(order);
    console.log(
      `[cron] auto-approved order ${order._id} (no buyer response by ${order.approvedAt})`
    );
  }
}

export function startAutoReleaseJob() {
  cron.schedule("*/5 * * * *", () => {
    autoApproveExpiredDeliveries().catch((err) =>
      console.error("[cron] auto-release failed:", err)
    );
  });
  console.log("[cron] auto-release job scheduled (every 5 min)");
}
