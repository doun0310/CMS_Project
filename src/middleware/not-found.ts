import { Request, Response } from "express";
import { fail } from "../utils/api-response";

export function notFoundHandler(_req: Request, res: Response) {
  return fail(res, "Resource not found", 404);
}
