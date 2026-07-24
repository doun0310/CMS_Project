import { withTransaction } from "../config/database";
import { createAuditLogTx } from "../repositories/audit.repository";
import { BadRequestError, NotFoundError } from "../errors/app-error";
import {
  findPrintJobForAgentForUpdate,
  listQueuedJobsByAgent,
  updatePrintJobStatus
} from "../repositories/print-job.repository";
import { updatePrintRequestStatus } from "../repositories/print-request.repository";

export class AgentService {
  async poll(agentKey: string, printerIds: number[]) {
    const jobs = await listQueuedJobsByAgent(agentKey, printerIds);

    return {
      jobs: jobs.map((job: any) => ({
        jobId: job.id,
        printRequestId: job.print_request_id,
        documentType: job.document_type,
        templatePath: job.template_path,
        payload: {
          sourceDocumentId: job.source_document_id
        },
        copies: job.copies
      }))
    };
  }

  async updateStatus(
    jobId: number,
    agentKey: string,
    jobStatus: string,
    failureReason?: string | null
  ) {
    if (!["PRINTING", "SUCCESS", "FAILED"].includes(jobStatus)) {
      throw new BadRequestError("Invalid job status", {
        jobStatus
      });
    }

    if (jobStatus === "FAILED" && !failureReason?.trim()) {
      throw new BadRequestError("failureReason is required when a job fails", {
        jobStatus
      });
    }

    return withTransaction(async (client) => {
      const existingJob = await findPrintJobForAgentForUpdate(client, jobId, agentKey);

      if (!existingJob) {
        throw new NotFoundError("Print job not found for this agent", {
          jobId
        });
      }

      const allowedTransitions: Record<string, string[]> = {
        QUEUED: ["PRINTING", "SUCCESS", "FAILED"],
        PRINTING: ["SUCCESS", "FAILED"]
      };
      if (!allowedTransitions[existingJob.job_status]?.includes(jobStatus)) {
        throw new BadRequestError("Invalid print job status transition", {
          jobId,
          currentStatus: existingJob.job_status,
          requestedStatus: jobStatus
        });
      }

      const updatedJob = await updatePrintJobStatus({
        jobId,
        jobStatus,
        failureReason
      }, client);

      if (!updatedJob) {
        throw new NotFoundError("Unable to update print job status", {
          jobId
        });
      }

      const requestStatusMap: Record<string, string> = {
        PRINTING: "PRINTING",
        SUCCESS: "PRINT_SUCCESS",
        FAILED: "PRINT_FAILED"
      };

      await updatePrintRequestStatus({
        id: existingJob.print_request_id,
        status: requestStatusMap[jobStatus],
        printedAt: jobStatus === "SUCCESS"
      }, client);

      await createAuditLogTx(client, {
        actorId: null,
        actionType: "AGENT_JOB_STATUS",
        targetType: "PRINT_JOB",
        targetId: updatedJob.id,
        detailJson: {
          jobStatus,
          failureReason: failureReason ?? null,
          printRequestId: existingJob.print_request_id
        }
      });

      return {
        jobId: updatedJob.id,
        jobStatus: updatedJob.job_status,
        failureReason: updatedJob.failure_reason
      };
    });
  }
}
