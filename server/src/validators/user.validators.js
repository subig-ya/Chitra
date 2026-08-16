import { z } from "zod";

const urlOrEmpty = z.string().trim().url("Must be a valid URL").optional().or(z.literal(""));

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    bio: z.string().trim().max(2000).optional(),
    avatar: urlOrEmpty,
    artistProfile: z
      .object({
        bio: z.string().trim().max(2000).optional(),
        portfolioImages: z.array(z.string().trim().url()).max(20).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
