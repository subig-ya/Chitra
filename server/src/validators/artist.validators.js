import { z } from "zod";

const packageBody = {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be at most 100 characters"),
  description: z.string().trim().max(2000).optional().default(""),
  basePrice: z.number().min(1, "Base price must be at least 1"),
  turnaroundDays: z.number().int().min(1).max(365),
  revisionLimit: z.number().int().min(0).max(20).optional().default(2),
  sampleImages: z.array(z.string().trim().url("Must be a valid URL")).max(10).optional().default([]),
};

export const createPackageSchema = z.object({
  ...packageBody,
});

export const updatePackageSchema = z
  .object({
    ...packageBody,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const listArtistsQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  sort: z
    .enum(["rating", "orders", "newest"])
    .optional()
    .default("rating"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const artistIdParamSchema = z.object({
  id: z.string().length(24, "Invalid artist id"),
});
