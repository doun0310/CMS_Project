import { withTransaction } from "../config/database";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { createAuditLogTx } from "../repositories/audit.repository";
import { findPrinterById } from "../repositories/admin.repository";
import {
  findPrintRequestById,
  findPrintRequestByIdForUpdate,
  updatePrintRequestStatus
} from "../repositories/print-request.repository";
import {
  createPrintJob,
  findPrintJobById,
  findPrintJobByIdForUpdate,
  retryPrintJobById
} from "../repositories/print-job.repository";

export class PrintJobService {
  async dispatch(
    printRequestId: number,
    actor: { id: number; organizationId: number; roleCode: string }
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

      const printer = await findPrinterById(request.printer_id);
      if (!printer) {
        throw new BadRequestError("Assigned printer does not exist", {
          printRequestId,
          printerId: request.printer_id
        });
      }
      if (
        printer.organization_id !== null &&
        Number(printer.organization_id) !== request.requester_organization_id
      ) {
        throw new ForbiddenError("Assigned printer belongs to another organization", {
          printRequestId,
          printerId: request.printer_id,
          requestOrganizationId: request.requester_organization_id,
          printerOrganizationId: Number(printer.organization_id)
        });
      }
      if (["INACTIVE", "MAINTENANCE", "OFFLINE", "ERROR"].includes(printer.status)) {
        throw new BadRequestError("Assigned printer is not ready", {
          printRequestId,
          printerId: request.printer_id,
          printerStatus: printer.status
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
        actorId: actor.id,
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
    actor: { id: number; organizationId: number; roleCode: string }
  ) {
    return withTransaction(async (client) => {
      const existingJob = await findPrintJobByIdForUpdate(client, jobId);
      if (!existingJob) {
        throw new NotFoundError("Print job not found", {
          jobId
        });
      }

      const request = await findPrintRequestByIdForUpdate(
        client,
        existingJob.print_request_id
      );
      if (!request) {
        throw new NotFoundError("Print request for job not found", {
          jobId,
          printRequestId: existingJob.print_request_id
        });
      }
      this.assertOrganizationAccess(request.requester_organization_id, actor);

      if (existingJob.job_status !== "FAILED") {
        throw new BadRequestError("Only failed print jobs can be retried", {
          jobId,
          currentStatus: existingJob.job_status
        });
      }

      const job = await retryPrintJobById(jobId, reason, client);
      if (!job) {
        throw new BadRequestError("Print job is no longer retryable", {
          jobId
        });
      }

      await updatePrintRequestStatus({
        id: job.print_request_id,
        status: "QUEUED"
      }, client);

      await createAuditLogTx(client, {
        actorId: actor.id,
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
    });
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
