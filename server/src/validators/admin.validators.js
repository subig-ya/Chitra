import { z } from "zod";

export const setVerificationSchema = z.object({
  verified: z.boolean(),
});
