import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/app-error";

/**
 * 부서격리 권한 검증 미들웨어:
 * 요청자의 조직 ID(organizationId)가 대상 조직 ID와 일치하거나, 최고 관리자(ADMIN)일 경우에만 접근 허용
 */
export function requireSameOrganization(paramKeyName: string = "organizationId") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ForbiddenError("Authentication required"));
    }

    if (user.roleCode === "ADMIN") {
      return next();
    }

    const targetOrgId = Number(req.params[paramKeyName] || req.body[paramKeyName]);
    if (targetOrgId && user.organizationId !== targetOrgId) {
      return next(new ForbiddenError("Organization access violation: Cannot access data from other department", {
        userOrganizationId: user.organizationId,
        targetOrganizationId: targetOrgId
      }));
    }

    next();
  };
}
