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
import { createAuditLog, listAuditLogs } from "../repositories/audit.repository";
import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/app-error";
import { findOrganizationById } from "../repositories/organization.repository";
import { fetchSnmpPrinterStatus } from "./snmp.service";
import { env } from "../config/env";

interface ActorContext {
  id: number;
  roleCode: string;
  organizationId: number;
}

export class AdminService {
  async getDashboardKpis(actor: ActorContext) {
    return await getDashboardKpis(this.organizationFilter(actor));
  }

  async listAuditLogs(actor: ActorContext) {
    return {
      items: await listAuditLogs(this.organizationFilter(actor))
    };
  }

  async listPrinters(actor: ActorContext) {
    return {
      items: await listPrinters(this.organizationFilter(actor))
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
      organizationId: payload.organizationId ?? actor.organizationId
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
    id: number,
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
      id,
      ...payload
    });
    if (!printer) {
      throw new NotFoundError("Printer not found", {
        printerId: id
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

  async listPolicies(actor: ActorContext) {
    return {
      items: await listPolicies(this.organizationFilter(actor))
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
    id: number,
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
      id,
      ...payload
    });
    if (!policy) {
      throw new NotFoundError("Approval policy not found", {
        policyId: id
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
    id: number,
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
      id,
      ...payload
    });
    if (!template) {
      throw new NotFoundError("Template not found", {
        templateId: id
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
    if (!targetOrganizationId) {
      return;
    }

    if (actor.roleCode !== "ADMIN" && targetOrganizationId !== actor.organizationId) {
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

  private organizationFilter(actor: ActorContext) {
    return actor.roleCode === "ADMIN" ? null : actor.organizationId;
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

    const snmpResult = await fetchSnmpPrinterStatus(
      ipAddress,
      env.snmpCommunity,
      env.snmpTimeoutMs
    );

    const updatedPrinter = await updatePrinter(id, {
      status: snmpResult.connectivityStatus,
      black_toner_level: snmpResult.blackTonerLevel,
      paper_level: snmpResult.paperLevel,
      last_checked_at: new Date()
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
