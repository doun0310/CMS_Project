import { Request, Response } from "express";
import { PrintRequestService } from "../services/print-request.service";
import { fail, ok } from "../utils/api-response";
import { getPositiveIntParam } from "../utils/params";

const service = new PrintRequestService();

export async function listPrintRequests(_req: Request, res: Response) {
  return ok(res, await service.list(_req.user!.organizationId));
}

export async function getPrintRequest(req: Request, res: Response) {
  return ok(res, await service.getById(getPositiveIntParam(req.params.id), req.user!));
}

export async function createPrintRequest(req: Request, res: Response) {
  const { documentType, sourceDocumentId, templateId, copies } = req.body;

  if (
    typeof documentType !== "string" ||
    !documentType.trim() ||
    typeof sourceDocumentId !== "string" ||
    !sourceDocumentId.trim() ||
    !Number.isInteger(templateId) ||
    templateId <= 0 ||
    !Number.isInteger(copies) ||
    copies <= 0 ||
    documentType.length > 30 ||
    sourceDocumentId.length > 100 ||
    (req.body.printerId !== undefined &&
      (!Number.isInteger(req.body.printerId) || req.body.printerId <= 0)) ||
    (req.body.isSensitive !== undefined && typeof req.body.isSensitive !== "boolean") ||
    (req.body.isUrgent !== undefined && typeof req.body.isUrgent !== "boolean") ||
    (req.body.requestReason !== undefined &&
      (typeof req.body.requestReason !== "string" || req.body.requestReason.length > 300))
  ) {
    return fail(
      res,
      "documentType and sourceDocumentId are required; templateId and copies must be positive integers",
      400
    );
  }

  return ok(res, await service.create(req.body, req.user!), 201);
}

export async function reprintRequest(req: Request, res: Response) {
  const { copies, reprintReason } = req.body;

  if (
    !Number.isInteger(copies) ||
    copies <= 0 ||
    typeof reprintReason !== "string" ||
    !reprintReason.trim() ||
    reprintReason.length > 300 ||
    (req.body.printerId !== undefined &&
      (!Number.isInteger(req.body.printerId) || req.body.printerId <= 0))
  ) {
    return fail(res, "copies must be a positive integer and reprintReason is required", 400);
  }

  return ok(res, await service.reprint(getPositiveIntParam(req.params.id), req.body, req.user!), 201);
}
