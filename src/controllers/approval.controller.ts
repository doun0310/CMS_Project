import { Request, Response } from "express";
import { ApprovalService } from "../services/approval.service";
import { fail, ok } from "../utils/api-response";
import { getPositiveIntParam } from "../utils/params";

const service = new ApprovalService();

export async function getPendingApprovals(_req: Request, res: Response) {
  return ok(res, await service.getPending(_req.user!.roleCode, _req.user!.organizationId));
}

export async function approveRequest(req: Request, res: Response) {
  if (
    req.body.comment !== undefined &&
    (typeof req.body.comment !== "string" || req.body.comment.length > 300)
  ) {
    return fail(res, "comment must be a string of at most 300 characters", 400);
  }

  return ok(
    res,
    await service.approve(
      getPositiveIntParam(req.params.printRequestId, "printRequestId"),
      req.user!.id,
      req.user!.roleCode,
      req.user!.organizationId,
      req.body.comment
    )
  );
}

export async function rejectRequest(req: Request, res: Response) {
  if (
    typeof req.body.reason !== "string" ||
    !req.body.reason.trim() ||
    req.body.reason.length > 300
  ) {
    return fail(res, "reason must be a non-empty string of at most 300 characters", 400);
  }

  return ok(
    res,
    await service.reject(
      getPositiveIntParam(req.params.printRequestId, "printRequestId"),
      req.user!.id,
      req.user!.roleCode,
      req.user!.organizationId,
      req.body.reason
    )
  );
}
