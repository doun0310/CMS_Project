import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { env } from "../config/env";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details ?? null
    });
  }

  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: env.nodeEnv === "development" ? err.message : "Internal server error"
  });
}
