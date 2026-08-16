import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";
import { env } from "./config/env.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    })
  );

  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(cookieParser());
  app.use(morgan(env.isProd ? "combined" : "dev"));

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
