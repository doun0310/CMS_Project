import { randomUUID } from "crypto";
import { withTransaction } from "../config/database";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { createApprovalStep } from "../repositories/approval.repository";
import { createAuditLogTx } from "../repositories/audit.repository";
import {
  findPrintRequestById,
  findAssignablePrinterById,
  insertPrintRequest,
  isActiveTemplate,
  listPrintRequestsByOrganization
} from "../repositories/print-request.repository";
import { findPolicyForDocumentType } from "../repositories/policy.repository";
import { PrintRequestPayload, ReprintPayload } from "../types/domain";

export class PrintRequestService {
  async list(organizationId: number) {
    const items = await listPrintRequestsByOrganization(organizationId);

    return {
      items,
      total: items.length
    };
  }

  async getById(
    id: number,
    currentUser: { organizationId: number; roleCode: string }
  ) {
    const request = await findPrintRequestById(id);

    if (!request) {
      throw new NotFoundError("Print request not found", {
        printRequestId: id
      });
    }

    this.assertOrganizationAccess(request.requester_organization_id, currentUser);
    return request;
  }

  async create(
    payload: PrintRequestPayload,
    currentUser: { id: number; organizationId: number }
  ) {
    await this.assertRequestResources(
      payload.templateId,
      payload.printerId,
      currentUser.organizationId
    );

    const policy = await findPolicyForDocumentType(payload.documentType, currentUser.organizationId);
    const requireManagerApproval =
      payload.isSensitive === true ||
      payload.copies >= (policy?.min_copies ?? Number.MAX_SAFE_INTEGER) ||
      policy?.requires_manager_approval === true ||
      policy?.requires_sensitive_approval === true;

    return withTransaction(async (client) => {
      const requestNo = this.createRequestNo();
      const request = await insertPrintRequest(client, {
        requestNo,
        documentType: payload.documentType,
        sourceDocumentId: payload.sourceDocumentId,
        requesterId: currentUser.id,
        requesterOrganizationId: currentUser.organizationId,
        templateId: payload.templateId,
        printerId: payload.printerId,
        copies: payload.copies,
        isSensitive: payload.isSensitive ?? false,
        isUrgent: payload.isUrgent ?? false,
        requestReason: payload.requestReason
      });

      const approvalStep = await createApprovalStep(client, {
        printRequestId: request.id,
        stepNo: 1,
        approverRoleCode: requireManagerApproval ? "MANAGER" : "SUPERVISOR"
      });

      await createAuditLogTx(client, {
        actorId: currentUser.id,
        actionType: "CREATE_REQUEST",
        targetType: "PRINT_REQUEST",
        targetId: request.id,
        detailJson: {
          requestNo: request.request_no,
          documentType: request.document_type,
          approvalRole: approvalStep.approver_role_code
        }
      });

      return {
        id: request.id,
        requestNo: request.request_no,
        status: request.status,
        approvalRoute: [
          {
            stepNo: approvalStep.step_no,
            approverRoleCode: approvalStep.approver_role_code,
            decision: approvalStep.decision
          }
        ]
      };
    });
  }

  async reprint(
    id: number,
    payload: ReprintPayload,
    currentUser: { id: number; organizationId: number; roleCode: string }
  ) {
    const originalRequest = await findPrintRequestById(id);

    if (!originalRequest) {
      throw new NotFoundError("Original print request not found", {
        printRequestId: id
      });
    }

    this.assertOrganizationAccess(originalRequest.requester_organization_id, currentUser);
    await this.assertRequestResources(
      originalRequest.template_id,
      payload.printerId ?? originalRequest.printer_id ?? undefined,
      currentUser.organizationId
    );

    return withTransaction(async (client) => {
      const request = await insertPrintRequest(client, {
        requestNo: this.createRequestNo("R"),
        documentType: originalRequest.document_type,
        sourceDocumentId: originalRequest.source_document_id,
        requesterId: currentUser.id,
        requesterOrganizationId: currentUser.organizationId,
        templateId: originalRequest.template_id,
        printerId: payload.printerId ?? originalRequest.printer_id ?? undefined,
        copies: payload.copies,
        isSensitive: originalRequest.is_sensitive,
        isUrgent: false,
        isReprint: true,
        originalRequestId: originalRequest.id,
        reprintReason: payload.reprintReason
      });

      const approvalStep = await createApprovalStep(client, {
        printRequestId: request.id,
        stepNo: 1,
        approverRoleCode: "SUPERVISOR"
      });

      await createAuditLogTx(client, {
        actorId: currentUser.id,
        actionType: "REPRINT_REQUEST",
        targetType: "PRINT_REQUEST",
        targetId: request.id,
        detailJson: {
          originalRequestId: originalRequest.id,
          reason: payload.reprintReason
        }
      });

      return {
        id: request.id,
        originalRequestId: request.original_request_id,
        status: request.status,
        approvalRoute: [
          {
            stepNo: approvalStep.step_no,
            approverRoleCode: approvalStep.approver_role_code,
            decision: approvalStep.decision
          }
        ]
      };
    });
  }

  private assertOrganizationAccess(
    targetOrganizationId: number,
    currentUser: { organizationId: number; roleCode: string }
  ) {
    if (
      currentUser.roleCode !== "ADMIN" &&
      currentUser.organizationId !== targetOrganizationId
    ) {
      throw new ForbiddenError("Organization scope violation", {
        actorOrganizationId: currentUser.organizationId,
        targetOrganizationId
      });
    }
  }

  private async assertRequestResources(
    templateId: number,
    printerId: number | undefined,
    organizationId: number
  ) {
    if (!(await isActiveTemplate(templateId))) {
      throw new BadRequestError("Template is missing or inactive", {
        templateId
      });
    }

    if (!printerId) {
      return;
    }

    const printer = await findAssignablePrinterById(printerId);
    if (!printer) {
      throw new BadRequestError("Printer does not exist", {
        printerId
      });
    }

    if (
      printer.organization_id !== null &&
      printer.organization_id !== organizationId
    ) {
      throw new ForbiddenError("Printer belongs to another organization", {
        printerId,
        actorOrganizationId: organizationId,
        printerOrganizationId: printer.organization_id
      });
    }

    if (["INACTIVE", "MAINTENANCE"].includes(printer.status)) {
      throw new BadRequestError("Printer is not available for assignment", {
        printerId,
        printerStatus: printer.status
      });
    }
  }

  private createRequestNo(suffix?: string) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const entropy = randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
    return ["PR", timestamp, entropy, suffix].filter(Boolean).join("-");
  }
}
