import { query } from "../config/database";

export async function listPrinters() {
  const result = await query("SELECT * FROM printers ORDER BY created_at DESC");
  return result.rows;
}

export async function createPrinter(params: {
  code: string;
  name: string;
  printerType: string;
  connectionType: string;
  ipAddress?: string;
  agentKey?: string;
  organizationId?: number;
  location?: string;
  status?: string;
}) {
  const sql = `
    INSERT INTO printers (
      code,
      name,
      printer_type,
      connection_type,
      ip_address,
      agent_key,
      organization_id,
      location,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const result = await query(sql, [
    params.code,
    params.name,
    params.printerType,
    params.connectionType,
    params.ipAddress ?? null,
    params.agentKey ?? null,
    params.organizationId ?? null,
    params.location ?? null,
    params.status ?? "ACTIVE"
  ]);

  return result.rows[0];
}

export async function updatePrinter(params: {
  id: number;
  name?: string;
  printerType?: string;
  connectionType?: string;
  ipAddress?: string;
  agentKey?: string;
  organizationId?: number;
  location?: string;
  status?: string;
}) {
  const sql = `
    UPDATE printers
    SET name = COALESCE($2, name),
        printer_type = COALESCE($3, printer_type),
        connection_type = COALESCE($4, connection_type),
        ip_address = COALESCE($5, ip_address),
        agent_key = COALESCE($6, agent_key),
        organization_id = COALESCE($7, organization_id),
        location = COALESCE($8, location),
        status = COALESCE($9, status),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(sql, [
    params.id,
    params.name ?? null,
    params.printerType ?? null,
    params.connectionType ?? null,
    params.ipAddress ?? null,
    params.agentKey ?? null,
    params.organizationId ?? null,
    params.location ?? null,
    params.status ?? null
  ]);

  return result.rows[0] ?? null;
}

export async function listPolicies() {
  const result = await query("SELECT * FROM approval_policies ORDER BY created_at DESC");
  return result.rows;
}

export async function listTemplates() {
  const result = await query("SELECT * FROM document_templates ORDER BY created_at DESC");
  return result.rows;
}

export async function createTemplate(params: {
  code: string;
  name: string;
  documentType: string;
  templateVersion?: number;
  filePath: string;
  status?: string;
  createdBy?: number;
}) {
  const sql = `
    INSERT INTO document_templates (
      code,
      name,
      document_type,
      template_version,
      file_path,
      status,
      created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await query(sql, [
    params.code,
    params.name,
    params.documentType,
    params.templateVersion ?? 1,
    params.filePath,
    params.status ?? "ACTIVE",
    params.createdBy ?? null
  ]);

  return result.rows[0];
}

export async function updateTemplate(params: {
  id: number;
  name?: string;
  documentType?: string;
  templateVersion?: number;
  filePath?: string;
  status?: string;
}) {
  const sql = `
    UPDATE document_templates
    SET name = COALESCE($2, name),
        document_type = COALESCE($3, document_type),
        template_version = COALESCE($4, template_version),
        file_path = COALESCE($5, file_path),
        status = COALESCE($6, status),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(sql, [
    params.id,
    params.name ?? null,
    params.documentType ?? null,
    params.templateVersion ?? null,
    params.filePath ?? null,
    params.status ?? null
  ]);

  return result.rows[0] ?? null;
}

export async function createPolicy(params: {
  documentType: string;
  minCopies: number;
  requiresReprintApproval?: boolean;
  requiresManagerApproval?: boolean;
  requiresSensitiveApproval?: boolean;
  organizationId: number;
  status?: string;
}) {
  const sql = `
    INSERT INTO approval_policies (
      document_type,
      min_copies,
      requires_reprint_approval,
      requires_manager_approval,
      requires_sensitive_approval,
      organization_id,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await query(sql, [
    params.documentType,
    params.minCopies,
    params.requiresReprintApproval ?? true,
    params.requiresManagerApproval ?? false,
    params.requiresSensitiveApproval ?? false,
    params.organizationId,
    params.status ?? "ACTIVE"
  ]);

  return result.rows[0];
}

export async function updatePolicy(params: {
  id: number;
  minCopies?: number;
  requiresReprintApproval?: boolean;
  requiresManagerApproval?: boolean;
  requiresSensitiveApproval?: boolean;
  status?: string;
}) {
  const sql = `
    UPDATE approval_policies
    SET min_copies = COALESCE($2, min_copies),
        requires_reprint_approval = COALESCE($3, requires_reprint_approval),
        requires_manager_approval = COALESCE($4, requires_manager_approval),
        requires_sensitive_approval = COALESCE($5, requires_sensitive_approval),
        status = COALESCE($6, status),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(sql, [
    params.id,
    params.minCopies ?? null,
    params.requiresReprintApproval ?? null,
    params.requiresManagerApproval ?? null,
    params.requiresSensitiveApproval ?? null,
    params.status ?? null
  ]);

  return result.rows[0] ?? null;
}
