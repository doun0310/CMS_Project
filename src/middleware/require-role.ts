import { NextFunction, Request, Response } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!allowedRoles.includes(req.user.roleCode)) {
      return next(
        new ForbiddenError("Forbidden", {
          allowedRoles,
          currentRole: req.user.roleCode
        })
      );
    }

    return next();
  };
}
