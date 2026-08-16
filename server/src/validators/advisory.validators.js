import { z } from "zod";

export const createAdvisoryRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(120),
  phone: z.string().trim().max(30).optional().default(""),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  room: z.string().trim().max(80).optional().default(""),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(4000),
});

export const updateAdvisoryStatusSchema = z.object({
  status: z.enum(["new", "contacted", "closed"]),
  note: z.string().trim().max(2000).optional(),
});
