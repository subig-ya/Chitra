import { z } from "zod";

export const createRequestSchema = z
  .object({
    artistId: z.string().length(24, "Invalid artist id"),
    packageId: z.string().length(24, "Invalid package id").optional(),
    briefDescription: z
      .string()
      .trim()
      .min(10, "Brief must describe your request in at least 10 characters")
      .max(5000, "Brief must be at most 5000 characters"),
    referenceImages: z
      .array(z.string().trim().url("Reference images must be valid URLs"))
      .max(10)
      .optional()
      .default([]),
    budgetRange: z
      .object({
        min: z.coerce.number().min(0),
        max: z.coerce.number().min(0),
      })
      .optional(),
  })
  .refine((d) => !d.budgetRange || d.budgetRange.max >= d.budgetRange.min, {
    message: "Budget max must be >= min",
    path: ["budgetRange"],
  });

export const quoteRequestSchema = z.object({
  quotedPrice: z.coerce.number().min(1, "Quote price must be at least 1"),
  quotedTurnaroundDays: z.coerce.number().int().min(1).max(365),
  quoteNote: z.string().trim().max(2000).optional().default(""),
});

export const listRequestsQuerySchema = z.object({
  status: z
    .enum(["pending", "quoted", "accepted", "rejected", "expired"])
    .optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
