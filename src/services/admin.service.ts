import {
  createPolicy,
  createPrinter,
  createTemplate,
  findPrinterById,
  getDashboardKpis,
  listPolicies,
  listPrinters,
  listTemplates,
  updatePolicy,
  updatePrinter,
  updateTemplate
} from "../repositories/admin.repository";
import { createAuditLog } from "../repositories/audit.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { findOrganizationById } from "../repositories/organization.repository";
import { fetchSnmpPrinterStatus } from "./snmp.service";

interface ActorContext {
  id: number;
  roleCode: string;
  organizationId: number;
}

export class AdminService {
  async getDashboardKpis() {
    return await getDashboardKpis();
  }

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

    const printer: any = await createPrinter({
      ...payload,
      organizationId: actor.organizationId
    });

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

    const printer: any = await updatePrinter({
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

    const policy: any = await createPolicy(payload);
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
    const policy: any = await updatePolicy({
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
    const template: any = await createTemplate({
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
    const template: any = await updateTemplate({
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

  public async syncPrinterSnmp(id: number, actor: ActorContext) {
    const printer: any = await findPrinterById(id);
    if (!printer) {
      throw new NotFoundError("Printer not found", { id });
    }

    await this.validateOrganizationScope(printer.organization_id || printer.organizationId, actor);

    const ipAddress = printer.ip_address || printer.ipAddress;
    if (!ipAddress) {
      throw new BadRequestError("Printer IP address is missing", { id });
    }

    const snmpResult = await fetchSnmpPrinterStatus(ipAddress);

    const updatedPrinter = await updatePrinter(id, {
      status: snmpResult.connectivityStatus
    });

    await createAuditLog({
      actorId: actor.id,
      actionType: "SYNC_SNMP",
      targetType: "PRINTER",
      targetId: id,
      detailJson: { status: snmpResult.connectivityStatus, tonerLevel: snmpResult.blackTonerLevel }
    });

    return {
      printer: updatedPrinter,
      snmpResult
    };
  }
}
