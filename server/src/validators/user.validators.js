import { z } from "zod";

const urlOrEmpty = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v),
    "Must be a valid URL or upload path"
  )
  .optional();

export const wishlistItemSchema = z.object({
  artworkId: z.string().length(24, "Invalid artwork id"),
});

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    bio: z.string().trim().max(2000).optional(),
    avatar: urlOrEmpty,
    coverImage: urlOrEmpty,
    artistProfile: z
      .object({
        bio: z.string().trim().max(2000).optional(),
        yearsExperience: z.coerce.number().min(0).max(100).optional(),
        specialty: z.string().trim().max(120).optional(),
        portfolioImages: z.array(z.string().trim().url()).max(20).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
