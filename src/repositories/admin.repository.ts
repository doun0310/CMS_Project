import { query } from "../config/database";

export async function findPrinterById(id: number) {
  const result = await query("SELECT * FROM printers WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function getDashboardKpis(organizationId: number | null) {
  const result = await query<{
    total_requests: number;
    pending_approvals: number;
    active_printers: number;
    total_printers: number;
  }>(`
    SELECT
      (
        SELECT COUNT(*)::int
        FROM print_requests
        WHERE ($1::bigint IS NULL OR requester_organization_id = $1)
      ) AS total_requests,
      (
        SELECT COUNT(*)::int
        FROM print_requests
        WHERE status = 'PENDING_APPROVAL'
          AND ($1::bigint IS NULL OR requester_organization_id = $1)
      ) AS pending_approvals,
      (
        SELECT COUNT(*)::int
        FROM printers
        WHERE status IN ('ACTIVE', 'ONLINE', 'PRINTING', 'LOW_TONER')
          AND ($1::bigint IS NULL OR organization_id = $1)
      ) AS active_printers,
      (
        SELECT COUNT(*)::int
        FROM printers
        WHERE ($1::bigint IS NULL OR organization_id = $1)
      ) AS total_printers
  `, [organizationId]);
  const row = result.rows[0];

  return {
    totalRequests: row?.total_requests ?? 0,
    pendingApprovals: row?.pending_approvals ?? 0,
    activePrinters: row?.active_printers ?? 0,
    totalPrinters: row?.total_printers ?? 0,
    paperSavingsPercent: 28.5
  };
}

export async function listPrinters(organizationId: number | null) {
  const result = await query(`
    SELECT
      p.*,
      COUNT(j.id) FILTER (WHERE j.job_status IN ('QUEUED', 'PRINTING'))::int AS active_job_count
    FROM printers p
    LEFT JOIN print_jobs j ON j.printer_id = p.id
    WHERE ($1::bigint IS NULL OR p.organization_id = $1)
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `, [organizationId]);
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

export async function updatePrinter(
  id: number | {
    id: number;
    name?: string;
    printerType?: string;
    connectionType?: string;
    ipAddress?: string;
    agentKey?: string;
    organizationId?: number;
    location?: string;
    status?: string;
  },
  updates?: {
    status?: string;
    black_toner_level?: number | null;
    paper_level?: number | null;
    last_checked_at?: Date;
  }
) {
  const targetId = typeof id === "number" ? id : id.id;
  const status = updates?.status ?? (typeof id === "object" ? id.status : null);
  const blackTonerLevel = updates?.black_toner_level ?? null;
  const paperLevel = updates?.paper_level ?? null;
  const lastCheckedAt = updates?.last_checked_at ?? null;
  const name = typeof id === "object" ? id.name : null;
  const printerType = typeof id === "object" ? id.printerType : null;
  const connectionType = typeof id === "object" ? id.connectionType : null;
  const ipAddress = typeof id === "object" ? id.ipAddress : null;
  const agentKey = typeof id === "object" ? id.agentKey : null;
  const organizationId = typeof id === "object" ? id.organizationId : null;
  const location = typeof id === "object" ? id.location : null;

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
        black_toner_level = COALESCE($10, black_toner_level),
        paper_level = COALESCE($11, paper_level),
        last_checked_at = COALESCE($12, last_checked_at),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await query(sql, [
    targetId,
    name ?? null,
    printerType ?? null,
    connectionType ?? null,
    ipAddress ?? null,
    agentKey ?? null,
    organizationId ?? null,
    location ?? null,
    status ?? null,
    blackTonerLevel,
    paperLevel,
    lastCheckedAt
  ]);

  return result.rows[0] ?? null;
}

export async function listPolicies(organizationId: number | null) {
  const result = await query(
    `
      SELECT *
      FROM approval_policies
      WHERE ($1::bigint IS NULL OR organization_id = $1)
      ORDER BY created_at DESC
    `,
    [organizationId]
  );
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
