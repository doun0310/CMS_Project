import { withTransaction } from "../config/database";
import { NotFoundError } from "../errors/app-error";
import {
  approveStep,
  findPendingApprovalStep,
  listPendingApprovalsForRole,
  rejectStep
} from "../repositories/approval.repository";
import { createAuditLogTx } from "../repositories/audit.repository";
import { updatePrintRequestStatus } from "../repositories/print-request.repository";

export class ApprovalService {
  async getPending(roleCode: string, organizationId: number) {
    const items = await listPendingApprovalsForRole(roleCode, organizationId);

    return {
      items
    };
  }

  async approve(printRequestId: string, approverId: number, roleCode: string, comment?: string) {
    const step = await findPendingApprovalStep(Number(printRequestId), roleCode);

    if (!step) {
      throw new NotFoundError("Pending approval step not found", {
        printRequestId: Number(printRequestId),
        roleCode
      });
    }

    return withTransaction(async (client) => {
      await approveStep(client, {
        stepId: step.id,
        approverId,
        comment
      });

      await updatePrintRequestStatus({
        id: Number(printRequestId),
        status: "APPROVED",
        approvedAt: true
      });

      await createAuditLogTx(client, {
        actorId: approverId,
        actionType: "APPROVE",
        targetType: "PRINT_REQUEST",
        targetId: Number(printRequestId),
        detailJson: {
          roleCode,
          comment: comment ?? null
        }
      });

      return {
        printRequestId: Number(printRequestId),
        status: "APPROVED",
        nextAction: "QUEUE_PRINT",
        comment: comment || null
      };
    });
  }

  async reject(printRequestId: string, approverId: number, roleCode: string, reason: string) {
    const step = await findPendingApprovalStep(Number(printRequestId), roleCode);

    if (!step) {
      throw new NotFoundError("Pending approval step not found", {
        printRequestId: Number(printRequestId),
        roleCode
      });
    }

    return withTransaction(async (client) => {
      await rejectStep(client, {
        stepId: step.id,
        approverId,
        reason
      });

      await updatePrintRequestStatus({
        id: Number(printRequestId),
        status: "REJECTED",
        rejectedAt: true
      });

      await createAuditLogTx(client, {
        actorId: approverId,
        actionType: "REJECT",
        targetType: "PRINT_REQUEST",
        targetId: Number(printRequestId),
        detailJson: {
          roleCode,
          reason
        }
      });

      return {
        printRequestId: Number(printRequestId),
        status: "REJECTED",
        reason
      };
    });
  }
}
