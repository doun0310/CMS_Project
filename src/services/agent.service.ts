import { createAuditLog } from "../repositories/audit.repository";
import { BadRequestError, NotFoundError } from "../errors/app-error";
import {
  findPrintJobById,
  listQueuedJobsByAgent,
  updatePrintJobStatus
} from "../repositories/print-job.repository";
import { updatePrintRequestStatus } from "../repositories/print-request.repository";

export class AgentService {
  async poll(agentKey: string, printerIds: number[]) {
    const jobs = await listQueuedJobsByAgent(agentKey, printerIds);

    return {
      jobs: jobs.map((job) => ({
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

  async updateStatus(jobId: string, jobStatus: string, failureReason?: string | null) {
    if (!["PRINTING", "SUCCESS", "FAILED"].includes(jobStatus)) {
      throw new BadRequestError("Invalid job status", {
        jobStatus
      });
    }

    const existingJob = await findPrintJobById(Number(jobId));

    if (!existingJob) {
      throw new NotFoundError("Print job not found", {
        jobId: Number(jobId)
      });
    }

    const updatedJob = await updatePrintJobStatus({
      jobId: Number(jobId),
      jobStatus,
      failureReason
    });

    if (!updatedJob) {
      throw new NotFoundError("Unable to update print job status", {
        jobId: Number(jobId)
      });
    }

    const requestStatusMap: Record<string, string> = {
      PRINTING: "PRINTING",
      SUCCESS: "PRINT_SUCCESS",
      FAILED: "PRINT_FAILED"
    };

    const requestStatus = requestStatusMap[jobStatus];
    if (requestStatus) {
      await updatePrintRequestStatus({
        id: existingJob.print_request_id,
        status: requestStatus,
        printedAt: jobStatus === "SUCCESS"
      });
    }

    await createAuditLog({
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
  }
}
