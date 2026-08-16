import { z } from "zod";

export const startConversationSchema = z.object({
  artistId: z.string().length(24, "Invalid artist id"),
});

export const sendConversationMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(3000, "Message must be at most 3000 characters"),
});
