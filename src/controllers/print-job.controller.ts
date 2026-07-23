import { Request, Response } from "express";
import { PrintJobService } from "../services/print-job.service";
import { ok } from "../utils/api-response";
import { getParamString } from "../utils/params";

const service = new PrintJobService();

export async function dispatchPrintJob(req: Request, res: Response) {
  return ok(res, await service.dispatch(getParamString(req.params.printRequestId)), 201);
}

export async function getPrintJob(req: Request, res: Response) {
  return ok(res, await service.getById(getParamString(req.params.jobId)));
}

export async function retryPrintJob(req: Request, res: Response) {
  return ok(res, await service.retry(getParamString(req.params.jobId), req.body.reason));
}
