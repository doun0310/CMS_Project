import { query } from "../config/database";
import { BadRequestError, NotFoundError } from "../errors/app-error";
import { createAuditLog } from "../repositories/audit.repository";
import { findPrintRequestById } from "../repositories/print-request.repository";
import {
  createPrintJob,
  findPrintJobById,
  retryPrintJobById
} from "../repositories/print-job.repository";

export class PrintJobService {
  async dispatch(printRequestId: string) {
    const request = await findPrintRequestById(Number(printRequestId));

    if (!request) {
      throw new NotFoundError("Print request not found", {
        printRequestId: Number(printRequestId)
      });
    }

    if (!request.printer_id) {
      throw new BadRequestError("Printer is not assigned to this request", {
        printRequestId: Number(printRequestId)
      });
    }

    const printJob = await createPrintJob({
      printRequestId: request.id,
      printerId: request.printer_id
    });

    await query(
      `
        UPDATE print_requests
        SET status = 'QUEUED',
            updated_at = NOW()
        WHERE id = $1
      `,
      [request.id]
    );

    await createAuditLog({
      actorId: null,
      actionType: "DISPATCH_PRINT_JOB",
      targetType: "PRINT_JOB",
      targetId: printJob.id,
      detailJson: {
        printRequestId: request.id,
        printerId: request.printer_id
      }
    });

    return {
      jobId: printJob.id,
      printRequestId: printJob.print_request_id,
      jobStatus: printJob.job_status
    };
  }

  async getById(jobId: string) {
    const job = await findPrintJobById(Number(jobId));

    if (!job) {
      throw new NotFoundError("Print job not found", {
        jobId: Number(jobId)
      });
    }

    return job;
  }

  async retry(jobId: string, reason?: string) {
    const job = await retryPrintJobById(Number(jobId), reason);

    if (!job) {
      throw new NotFoundError("Print job not found", {
        jobId: Number(jobId)
      });
    }

    await query(
      `
        UPDATE print_requests
        SET status = 'QUEUED',
            updated_at = NOW()
        WHERE id = $1
      `,
      [job.print_request_id]
    );

    await createAuditLog({
      actorId: null,
      actionType: "RETRY_PRINT_JOB",
      targetType: "PRINT_JOB",
      targetId: job.id,
      detailJson: {
        reason: reason ?? null
      }
    });

    return {
      jobId: job.id,
      jobStatus: job.job_status,
      reason: reason || null
    };
  }
}
