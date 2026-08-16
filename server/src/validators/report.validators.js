import { z } from "zod";
import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
} from "../models/Report.js";

export const createReportSchema = z.object({
  reportedUserId: z.string().length(24, "Invalid user id"),
  orderId: z.string().length(24, "Invalid order id").optional(),
  category: z.enum(REPORT_CATEGORIES, { message: "Invalid category" }),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(4000),
});

export const updateReportStatusSchema = z.object({
  status: z.enum(REPORT_STATUSES, { message: "Invalid status" }),
  resolutionNote: z.string().trim().max(2000).optional(),
});

export const listReportsQuerySchema = z.object({
  status: z.enum(REPORT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
