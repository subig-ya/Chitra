import { z } from "zod";
import { PAYOUT_STATUSES } from "../models/Payout.js";

export const requestPayoutSchema = z.object({
  note: z.string().trim().max(1000).optional().default(""),
});

export const updatePayoutSchema = z.object({
  status: z.enum(["processing", "paid", "failed"]),
  note: z.string().trim().max(1000).optional().default(""),
});

export const listPayoutsQuerySchema = z.object({
  status: z.enum(PAYOUT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
