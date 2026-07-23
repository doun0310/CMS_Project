import { Request, Response } from "express";
import { PrintRequestService } from "../services/print-request.service";
import { fail, ok } from "../utils/api-response";
import { getParamString } from "../utils/params";

const service = new PrintRequestService();

export async function listPrintRequests(_req: Request, res: Response) {
  return ok(res, await service.list(_req.user!.organizationId));
}

export async function getPrintRequest(req: Request, res: Response) {
  return ok(res, await service.getById(getParamString(req.params.id)));
}

export async function createPrintRequest(req: Request, res: Response) {
  const { documentType, sourceDocumentId, templateId, copies } = req.body;

  if (!documentType || !sourceDocumentId || !templateId || !copies) {
    return fail(res, "Required fields are missing", 400);
  }

  return ok(res, await service.create(req.body, req.user!), 201);
}

export async function reprintRequest(req: Request, res: Response) {
  const { copies, reprintReason } = req.body;

  if (!copies || !reprintReason) {
    return fail(res, "copies and reprintReason are required", 400);
  }

  return ok(res, await service.reprint(getParamString(req.params.id), req.body, req.user!), 201);
}
