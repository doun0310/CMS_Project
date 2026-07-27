import { Request, Response } from "express";
import { PrintRequestService } from "../services/print-request.service";
import { fail, ok } from "../utils/api-response";
import { getPositiveIntParam } from "../utils/params";
import { detectPII } from "../utils/pii-detector";
import { analyzeDocumentLayout } from "../utils/layout-analyzer";
import { generatePinCode, generateWatermarkText } from "../utils/crypto";

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

  const result = await service.create(req.body, req.user!);
  const pinCode = generatePinCode();
  const watermark = generateWatermarkText(
    `Emp#${req.user!.id}`,
    `Org#${req.user!.organizationId}`,
    result.requestNo,
    result.isSensitive
  );

  return ok(res, { ...result, pinCode, watermark }, 201);
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

export async function analyzePIIHandler(req: Request, res: Response) {
  const text = req.body?.text || req.body?.content || "";
  if (typeof text !== "string") {
    return fail(res, "text or content string is required for PII analysis", 400);
  }
  const result = detectPII(text);
  return ok(res, result);
}

export async function analyzeLayoutHandler(req: Request, res: Response) {
  const elements = req.body?.elements || [];
  const hint = req.body?.documentTypeHint;
  if (!Array.isArray(elements)) {
    return fail(res, "elements array is required for layout analysis", 400);
  }
  const result = analyzeDocumentLayout(elements, hint);
  return ok(res, result);
}

export async function subscribePrintEvents(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const initialMsg = JSON.stringify({ type: "CONNECTED", message: "Realtime SSE print channel ready", timestamp: new Date() });
  res.write(`data: ${initialMsg}\n\n`);

  const interval = setInterval(() => {
    const heartbeat = JSON.stringify({ type: "HEARTBEAT", timestamp: new Date() });
    res.write(`data: ${heartbeat}\n\n`);
  }, 15000);

  req.on("close", () => {
    clearInterval(interval);
  });
}
