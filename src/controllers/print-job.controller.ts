import { Request, Response } from "express";
import { PrintJobService } from "../services/print-job.service";
import { ok } from "../utils/api-response";
import { getPositiveIntParam } from "../utils/params";

const service = new PrintJobService();

export async function dispatchPrintJob(req: Request, res: Response) {
  return ok(
    res,
    await service.dispatch(
      getPositiveIntParam(req.params.printRequestId, "printRequestId"),
      req.user!
    ),
    201
  );
}

export async function getPrintJob(req: Request, res: Response) {
  return ok(res, await service.getById(getPositiveIntParam(req.params.jobId, "jobId"), req.user!));
}

export async function retryPrintJob(req: Request, res: Response) {
  return ok(
    res,
    await service.retry(getPositiveIntParam(req.params.jobId, "jobId"), req.body.reason, req.user!)
  );
}
