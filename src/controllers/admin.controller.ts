import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { fail, ok } from "../utils/api-response";

const service = new AdminService();

export async function listPrinters(_req: Request, res: Response) {
  return ok(res, await service.listPrinters());
}

export async function createPrinter(req: Request, res: Response) {
  const { code, name, printerType, connectionType } = req.body;

  if (!code || !name || !printerType || !connectionType) {
    return fail(res, "code, name, printerType, connectionType are required", 400);
  }

  return ok(res, await service.createPrinter(req.body, req.user!), 201);
}

export async function updatePrinter(req: Request, res: Response) {
  const printerId = Array.isArray(req.params.id) ? Number(req.params.id[0]) : Number(req.params.id);
  return ok(res, await service.updatePrinter(printerId, req.body, req.user!));
}

export async function syncPrinterSnmp(req: Request, res: Response) {
  const printerId = Array.isArray(req.params.id) ? Number(req.params.id[0]) : Number(req.params.id);
  return ok(res, await service.syncPrinterSnmp(printerId, req.user!));
}

export async function listPolicies(_req: Request, res: Response) {
  return ok(res, await service.listPolicies());
}

export async function createPolicy(req: Request, res: Response) {
  const { documentType, minCopies, organizationId } = req.body;

  if (!documentType || !minCopies || !organizationId) {
    return fail(res, "documentType, minCopies, organizationId are required", 400);
  }

  return ok(res, await service.createPolicy(req.body, req.user!), 201);
}

export async function updatePolicy(req: Request, res: Response) {
  return ok(res, await service.updatePolicy(req.params.id, req.body, req.user!));
}

export async function listTemplates(_req: Request, res: Response) {
  return ok(res, await service.listTemplates());
}

export async function createTemplate(req: Request, res: Response) {
  const { code, name, documentType, filePath } = req.body;

  if (!code || !name || !documentType || !filePath) {
    return fail(res, "code, name, documentType, filePath are required", 400);
  }

  return ok(res, await service.createTemplate(req.body, req.user!), 201);
}

export async function updateTemplate(req: Request, res: Response) {
  return ok(res, await service.updateTemplate(req.params.id, req.body, req.user!));
}
