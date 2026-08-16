import { env } from "../config/env.js";

export function notFoundHandler(req, _res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : err.message;

  if (statusCode === 500) {
    console.error("[error]", err);
  }

  const body = { success: false, error: message };
  if (err.details) body.details = err.details;

  if (env.nodeEnv === "development" && statusCode >= 500) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
