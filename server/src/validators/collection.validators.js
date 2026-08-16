import { z } from "zod";

export const createCollectionSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(300).optional().default(""),
  curatorNote: z.string().trim().max(2000).optional().default(""),
  coverImageUrl: z.string().trim().url().max(1000).optional().or(z.literal("")),
  artworkIds: z.array(z.string().length(24)).max(60).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
});

export const updateCollectionSchema = createCollectionSchema.partial();

export const listCollectionsQuerySchema = z.object({
  featured: z.enum(["true", "false"]).optional(),
});
