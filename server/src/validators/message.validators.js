import { z } from "zod";

export const sendMessageSchema = z
  .object({
    text: z.string().trim().max(4000).optional().default(""),
    attachmentUrl: z.string().trim().url("Attachment must be a valid URL").optional(),
  })
  .refine((d) => d.text || d.attachmentUrl, {
    message: "Message must contain text or an attachment",
  });

export const listMessagesQuerySchema = z.object({
  before: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
