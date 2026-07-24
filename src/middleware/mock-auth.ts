import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const DEFAULT_USER = {
  id: 1,
  roleCode: "ADMIN",
  organizationId: 1
};

export function mockAuth(req: Request, _res: Response, next: NextFunction) {
  if (!env.enableMockAuth) {
    return next();
  }

  const id = Number(req.header("x-user-id")) || DEFAULT_USER.id;
  const roleCode = req.header("x-role-code") || DEFAULT_USER.roleCode;
  const organizationId = Number(req.header("x-organization-id")) || DEFAULT_USER.organizationId;

  req.user = {
    id,
    roleCode,
    organizationId
  };

  next();
}
