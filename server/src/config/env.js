import dotenv from "dotenv";

dotenv.config();

const required = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing required env var: ${key}`);
  }
}

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chitra",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
  },
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  platformFeePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || "10"),
  autoReleaseDays: parseInt(process.env.AUTO_RELEASE_DAYS || "5", 10),
  requestExpiryDays: parseInt(process.env.REQUEST_EXPIRY_DAYS || "7", 10),
  paymentWebhookSecret: process.env.PAYMENT_WEBHOOK_SECRET || "dev-webhook-secret",
};
