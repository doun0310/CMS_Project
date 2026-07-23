import { NextFunction, Request, Response } from "express";

const DEFAULT_USER = {
  id: 1,
  roleCode: "ADMIN",
  organizationId: 1
};

export function mockAuth(req: Request, _res: Response, next: NextFunction) {
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
