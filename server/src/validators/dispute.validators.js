import { z } from "zod";
import { DISPUTE_RESOLUTIONS } from "../models/Dispute.js";

export const raiseDisputeSchema = z.object({
  orderId: z.string().length(24, "Invalid order id"),
  reason: z
    .string()
    .trim()
    .min(10, "Reason must be at least 10 characters")
    .max(3000, "Reason must be at most 3000 characters"),
});

export const resolveDisputeSchema = z
  .object({
    resolution: z.enum(DISPUTE_RESOLUTIONS),
    resolutionNote: z.string().trim().max(3000).optional().default(""),
    refundAmount: z.coerce.number().min(0).optional(),
  })
  .refine(
    (d) => d.resolution !== "partial_split" || d.refundAmount !== undefined,
    {
      message: "refundAmount is required for partial_split",
      path: ["refundAmount"],
    }
  );

export const listDisputesQuerySchema = z.object({
  status: z.enum(["open", "under_review", "resolved"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
