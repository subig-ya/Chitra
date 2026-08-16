import { z } from "zod";

export const addCartItemSchema = z.object({
  artworkId: z.string().length(24, "Invalid artwork id"),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(5),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  addressLine: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(80),
  zip: z.string().trim().max(30).optional().default(""),
  note: z.string().trim().max(500).optional().default(""),
});

export const checkoutSchema = z.object({
  shippingAddress: shippingAddressSchema,
});
