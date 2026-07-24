import { query, withTransaction } from "../config/database";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { createAuditLog, createAuditLogTx } from "../repositories/audit.repository";
import {
  findPrintRequestById,
  findPrintRequestByIdForUpdate,
  updatePrintRequestStatus
} from "../repositories/print-request.repository";
import {
  createPrintJob,
  findPrintJobById,
  retryPrintJobById
} from "../repositories/print-job.repository";

export class PrintJobService {
  async dispatch(
    printRequestId: number,
    actor: { organizationId: number; roleCode: string }
  ) {
    return withTransaction(async (client) => {
      const request = await findPrintRequestByIdForUpdate(client, printRequestId);

      if (!request) {
        throw new NotFoundError("Print request not found", {
          printRequestId
        });
      }

      this.assertOrganizationAccess(request.requester_organization_id, actor);

      if (request.status !== "APPROVED") {
        throw new BadRequestError("Only approved print requests can be dispatched", {
          printRequestId,
          currentStatus: request.status
        });
      }

      if (!request.printer_id) {
        throw new BadRequestError("Printer is not assigned to this request", {
          printRequestId
        });
      }

      const printJob = await createPrintJob({
        printRequestId: request.id,
        printerId: request.printer_id
      }, client);

      await updatePrintRequestStatus({
        id: request.id,
        status: "QUEUED"
      }, client);

      await createAuditLogTx(client, {
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
    });
  }

  async getById(
    jobId: number,
    actor: { organizationId: number; roleCode: string }
  ) {
    const job = await findPrintJobById(jobId);

    if (!job) {
      throw new NotFoundError("Print job not found", {
        jobId
      });
    }

    const request = await findPrintRequestById(job.print_request_id);
    if (!request) {
      throw new NotFoundError("Print request for job not found", {
        jobId,
        printRequestId: job.print_request_id
      });
    }
    this.assertOrganizationAccess(request.requester_organization_id, actor);

    return job;
  }

  async retry(
    jobId: number,
    reason: string | undefined,
    actor: { organizationId: number; roleCode: string }
  ) {
    const existingJob = await this.getById(jobId, actor);
    if (existingJob.job_status !== "FAILED") {
      throw new BadRequestError("Only failed print jobs can be retried", {
        jobId,
        currentStatus: existingJob.job_status
      });
    }

    const job = await retryPrintJobById(jobId, reason);

    if (!job) {
      throw new NotFoundError("Print job not found", {
        jobId
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

  private assertOrganizationAccess(
    targetOrganizationId: number,
    actor: { organizationId: number; roleCode: string }
  ) {
    if (actor.roleCode !== "ADMIN" && actor.organizationId !== targetOrganizationId) {
      throw new ForbiddenError("Organization scope violation", {
        actorOrganizationId: actor.organizationId,
        targetOrganizationId
      });
    }
  }
}
