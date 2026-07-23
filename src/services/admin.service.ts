import {
  createPolicy,
  createPrinter,
  createTemplate,
  listPolicies,
  listPrinters,
  listTemplates,
  updatePolicy,
  updatePrinter,
  updateTemplate
} from "../repositories/admin.repository";
import { createAuditLog } from "../repositories/audit.repository";
import { ForbiddenError, NotFoundError } from "../errors/app-error";
import { findOrganizationById } from "../repositories/organization.repository";

interface ActorContext {
  id: number;
  roleCode: string;
  organizationId: number;
}

export class AdminService {
  async listPrinters() {
    return {
      items: await listPrinters()
    };
  }

  async createPrinter(payload: {
    code: string;
    name: string;
    printerType: string;
    connectionType: string;
    ipAddress?: string;
    agentKey?: string;
    organizationId?: number;
    location?: string;
    status?: string;
  }, actor: ActorContext) {
    await this.validateOrganizationScope(payload.organizationId, actor);

    const printer = await createPrinter(payload);
    await createAuditLog({
      actorId: actor.id,
      actionType: "CREATE_PRINTER",
      targetType: "PRINTER",
      targetId: Number(printer.id),
      detailJson: payload
    });
    return printer;
  }

  async updatePrinter(
    id: string,
    payload: {
      name?: string;
      printerType?: string;
      connectionType?: string;
      ipAddress?: string;
      agentKey?: string;
      organizationId?: number;
      location?: string;
      status?: string;
    },
    actor: ActorContext
  ) {
    await this.validateOrganizationScope(payload.organizationId, actor);

    const printer = await updatePrinter({
      id: Number(id),
      ...payload
    });
    if (!printer) {
      throw new NotFoundError("Printer not found", {
        printerId: Number(id)
      });
    }
    if (printer) {
      await createAuditLog({
        actorId: actor.id,
        actionType: "UPDATE_PRINTER",
        targetType: "PRINTER",
        targetId: Number(printer.id),
        detailJson: payload
      });
    }
    return printer;
  }

  async listPolicies() {
    return {
      items: await listPolicies()
    };
  }

  async createPolicy(payload: {
    documentType: string;
    minCopies: number;
    requiresReprintApproval?: boolean;
    requiresManagerApproval?: boolean;
    requiresSensitiveApproval?: boolean;
    organizationId: number;
    status?: string;
  }, actor: ActorContext) {
    await this.validateOrganizationScope(payload.organizationId, actor);

    const policy = await createPolicy(payload);
    await createAuditLog({
      actorId: actor.id,
      actionType: "CREATE_POLICY",
      targetType: "POLICY",
      targetId: Number(policy.id),
      detailJson: payload
    });
    return policy;
  }

  async updatePolicy(
    id: string,
    payload: {
      minCopies?: number;
      requiresReprintApproval?: boolean;
      requiresManagerApproval?: boolean;
      requiresSensitiveApproval?: boolean;
      status?: string;
    },
    actor: ActorContext
  ) {
    const policy = await updatePolicy({
      id: Number(id),
      ...payload
    });
    if (!policy) {
      throw new NotFoundError("Approval policy not found", {
        policyId: Number(id)
      });
    }
    if (policy) {
      await createAuditLog({
        actorId: actor.id,
        actionType: "UPDATE_POLICY",
        targetType: "POLICY",
        targetId: Number(policy.id),
        detailJson: payload
      });
    }
    return policy;
  }

  async listTemplates() {
    return {
      items: await listTemplates()
    };
  }

  async createTemplate(
    payload: {
      code: string;
      name: string;
      documentType: string;
      templateVersion?: number;
      filePath: string;
      status?: string;
    },
    actor: ActorContext
  ) {
    const template = await createTemplate({
      ...payload,
      createdBy: actor.id
    });

    await createAuditLog({
      actorId: actor.id,
      actionType: "CREATE_TEMPLATE",
      targetType: "TEMPLATE",
      targetId: Number(template.id),
      detailJson: payload
    });

    return template;
  }

  async updateTemplate(
    id: string,
    payload: {
      name?: string;
      documentType?: string;
      templateVersion?: number;
      filePath?: string;
      status?: string;
    },
    actor: ActorContext
  ) {
    const template = await updateTemplate({
      id: Number(id),
      ...payload
    });
    if (!template) {
      throw new NotFoundError("Template not found", {
        templateId: Number(id)
      });
    }

    if (template) {
      await createAuditLog({
        actorId: actor.id,
        actionType: "UPDATE_TEMPLATE",
        targetType: "TEMPLATE",
        targetId: Number(template.id),
        detailJson: payload
      });
    }

    return template;
  }

  private async validateOrganizationScope(targetOrganizationId: number | undefined, actor: ActorContext) {
    if (!targetOrganizationId || actor.roleCode === "ADMIN") {
      return;
    }

    if (targetOrganizationId !== actor.organizationId) {
      throw new ForbiddenError("Organization scope violation", {
        actorOrganizationId: actor.organizationId,
        targetOrganizationId
      });
    }

    const organization = await findOrganizationById(targetOrganizationId);
    if (!organization || organization.status !== "ACTIVE") {
      throw new NotFoundError("Target organization is invalid", {
        targetOrganizationId
      });
    }
  }
}
