import { z } from "zod";

export const listOrdersQuerySchema = z.object({
  status: z
    .enum([
      "awaiting_payment",
      "in_progress",
      "delivered",
      "revision_requested",
      "completed",
      "disputed",
      "cancelled",
      "refunded",
    ])
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const milestoneSchema = z.object({
  title: z.string().trim().min(1, "Milestone title is required").max(120),
  note: z.string().trim().max(2000).optional().default(""),
  previewImageUrl: z.string().trim().url("Preview image must be a valid URL").optional(),
});

export const deliverSchema = z.object({
  fileUrl: z.string().trim().url("Deliverable must be a valid file URL"),
});

export const requestRevisionSchema = z.object({
  note: z.string().trim().max(2000).optional().default(""),
});
