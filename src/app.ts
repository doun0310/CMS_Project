import express from "express";
import routes from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { mockAuth } from "./middleware/mock-auth";
import { notFoundHandler } from "./middleware/not-found";
import { swaggerUiServe, swaggerUiSetup } from "./config/swagger";

export function createApp() {
  const app = express();

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
