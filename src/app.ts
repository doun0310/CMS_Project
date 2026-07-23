import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import routes from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { mockAuth } from "./middleware/mock-auth";
import { notFoundHandler } from "./middleware/not-found";
import { swaggerUiServe, swaggerUiSetup } from "./config/swagger";

export function createApp() {
  const app = express();

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: { message: "Too many requests, please try again later." } }
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(limiter);
  app.use(express.json());
  app.use(mockAuth);

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok"
      }
    });
  });

  app.use("/docs", swaggerUiServe, swaggerUiSetup);
  app.use("/api/v1", routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
