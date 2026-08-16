import { ApiError } from "../utils/ApiError.js";
import { verifyWebhookSignature } from "../services/gateway.js";
import { env } from "../config/env.js";

/**
 * Verifies the server-to-server gateway callback.
 * eSewa: HMAC-SHA256 (base64) of the raw body in header `x-hmac`.
 * Khalti: shared secret header `x-gateway-secret`.
 */
export function verifyGatewayCallback(gateway) {
  return (req, _res, next) => {
    const signature = req.headers["x-hmac"] || req.headers["x-gateway-secret"];
    const ok = verifyWebhookSignature(
      gateway,
      req.rawBody || "",
      signature,
      env.paymentWebhookSecret
    );
    if (!ok) {
      throw new ApiError(401, "Invalid gateway signature");
    }
    next();
  };
}
