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

  async approve(
    printRequestId: number,
    approverId: number,
    roleCode: string,
    organizationId: number,
    comment?: string
  ) {
    return withTransaction(async (client) => {
      const step = await findPendingApprovalStep(
        client,
        printRequestId,
        roleCode,
        organizationId,
        roleCode === "ADMIN",
        roleCode === "ADMIN"
      );
      if (!step) {
        throw new NotFoundError("Pending approval step not found", {
          printRequestId,
          roleCode
        });
      }

      await approveStep(client, {
        stepId: step.id,
        approverId,
        comment
      });

      await updatePrintRequestStatus({
        id: printRequestId,
        status: "APPROVED",
        approvedAt: true
      }, client);

      await createAuditLogTx(client, {
        actorId: approverId,
        actionType: "APPROVE",
        targetType: "PRINT_REQUEST",
        targetId: printRequestId,
        detailJson: {
          roleCode,
          comment: comment ?? null
        }
      });

      return {
        printRequestId,
        status: "APPROVED",
        nextAction: "QUEUE_PRINT",
        comment: comment || null
      };
    });
  }

  async reject(
    printRequestId: number,
    approverId: number,
    roleCode: string,
    organizationId: number,
    reason: string
  ) {
    return withTransaction(async (client) => {
      const step = await findPendingApprovalStep(
        client,
        printRequestId,
        roleCode,
        organizationId,
        roleCode === "ADMIN",
        roleCode === "ADMIN"
      );
      if (!step) {
        throw new NotFoundError("Pending approval step not found", {
          printRequestId,
          roleCode
        });
      }

      await rejectStep(client, {
        stepId: step.id,
        approverId,
        reason
      });

      await updatePrintRequestStatus({
        id: printRequestId,
        status: "REJECTED",
        rejectedAt: true
      }, client);

      await createAuditLogTx(client, {
        actorId: approverId,
        actionType: "REJECT",
        targetType: "PRINT_REQUEST",
        targetId: printRequestId,
        detailJson: {
          roleCode,
          reason
        }
      });

      return {
        printRequestId,
        status: "REJECTED",
        reason
      };
    });
  }
}
