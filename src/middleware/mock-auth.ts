import { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const DEFAULT_USER = {
  id: 1,
  roleCode: "ADMIN",
  organizationId: 1
};

export function mockAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.header("authorization") || req.header("Authorization");

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    try {
      const base64Payload = token.split(".")[1];
      if (base64Payload) {
        const decodedStr = Buffer.from(base64Payload, "base64").toString("utf-8");
        const payload = JSON.parse(decodedStr);
        req.user = {
          id: Number(payload.sub_id || payload.id || 1),
          roleCode: payload.app_metadata?.role || payload.role || "ADMIN",
          organizationId: Number(payload.app_metadata?.organization_id || payload.organization_id || 1)
        };
        return next();
      }
    } catch (err) {
      // Fallback
    }
  }

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
