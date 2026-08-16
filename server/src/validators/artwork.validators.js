import { z } from "zod";
import {
  ARTWORK_MEDIUMS,
  ARTWORK_SUBJECTS,
} from "../models/Artwork.js";

const url = z.string().trim().url("Must be a valid URL").max(1000);

export const createArtworkSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(150),
  description: z.string().trim().max(4000).optional().default(""),
  imageUrl: url,
  medium: z.enum(ARTWORK_MEDIUMS, { message: "Invalid medium" }),
  subject: z.enum(ARTWORK_SUBJECTS).optional().default("Other"),
  style: z.string().trim().max(80).optional().default(""),
  widthCm: z.coerce.number().min(1).max(10000).optional(),
  heightCm: z.coerce.number().min(1).max(10000).optional(),
  depthCm: z.coerce.number().min(0).max(10000).optional().default(0),
  yearCreated: z.coerce.number().int().min(1900).max(2100).optional(),
  price: z.coerce.number().min(1, "Price must be at least 1").max(100000000),
});

export const updateArtworkSchema = createArtworkSchema.partial();

export const listArtworksQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  medium: z.enum(ARTWORK_MEDIUMS).optional(),
  subject: z.enum(ARTWORK_SUBJECTS).optional(),
  style: z.string().trim().max(80).optional(),
  artistId: z.string().length(24).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional().default("newest"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(60).optional().default(24),
});
