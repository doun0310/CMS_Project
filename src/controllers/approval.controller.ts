import { Request, Response } from "express";
import { ApprovalService } from "../services/approval.service";
import { fail, ok } from "../utils/api-response";
import { getParamString } from "../utils/params";

const service = new ApprovalService();

export async function getPendingApprovals(_req: Request, res: Response) {
  return ok(res, await service.getPending(_req.user!.roleCode, _req.user!.organizationId));
}

export async function approveRequest(req: Request, res: Response) {
  return ok(
    res,
    await service.approve(
      getParamString(req.params.printRequestId),
      req.user!.id,
      req.user!.roleCode,
      req.body.comment
    )
  );
}

export async function rejectRequest(req: Request, res: Response) {
  if (!req.body.reason) {
    return fail(res, "reason is required", 400);
  }

  return ok(
    res,
    await service.reject(
      getParamString(req.params.printRequestId),
      req.user!.id,
      req.user!.roleCode,
      req.body.reason
    )
  );
}
