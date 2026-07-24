import { PoolClient } from "pg";
import { query } from "../config/database";

export interface PrintRequestRow {
  id: number;
  request_no: string;
  document_type: string;
  source_document_id: string;
  requester_id: number;
  requester_organization_id: number;
  template_id: number;
  printer_id: number | null;
  copies: number;
  is_sensitive: boolean;
  is_urgent: boolean;
  is_reprint: boolean;
  original_request_id: number | null;
  request_reason: string | null;
  reprint_reason: string | null;
  status: string;
  requested_at: string;
  approved_at: string | null;
  rejected_at: string | null;
  printed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignablePrinterRow {
  id: number;
  organization_id: number | null;
  status: string;
}

export async function findAssignablePrinterById(id: number) {
  const result = await query<AssignablePrinterRow>(
    `
      SELECT id, organization_id, status
      FROM printers
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function isActiveTemplate(templateId: number) {
  const result = await query<{ exists: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM document_templates
        WHERE id = $1
          AND status = 'ACTIVE'
      ) AS exists
    `,
    [templateId]
  );

  return result.rows[0]?.exists === true;
}

export async function listPrintRequestsByOrganization(organizationId: number) {
  const sql = `
    SELECT *
    FROM print_requests
    WHERE requester_organization_id = $1
    ORDER BY created_at DESC
    LIMIT 100
  `;

  const result = await query<PrintRequestRow>(sql, [organizationId]);
  return result.rows;
}

export async function findPrintRequestById(id: number) {
  const sql = `
    SELECT *
    FROM print_requests
    WHERE id = $1
  `;

  const result = await query<PrintRequestRow>(sql, [id]);
  return result.rows[0] ?? null;
}

export async function findPrintRequestByIdForUpdate(client: PoolClient, id: number) {
  const sql = `
    SELECT *
    FROM print_requests
    WHERE id = $1
    FOR UPDATE
  `;

  const result = await client.query<PrintRequestRow>(sql, [id]);
  return result.rows[0] ?? null;
}

export async function updatePrintRequestStatus(params: {
  id: number;
  status: string;
  approvedAt?: boolean;
  rejectedAt?: boolean;
  printedAt?: boolean;
}, client?: PoolClient) {
  const sql = `
    UPDATE print_requests
    SET status = $2,
        approved_at = CASE WHEN $3 THEN NOW() ELSE approved_at END,
        rejected_at = CASE WHEN $4 THEN NOW() ELSE rejected_at END,
        printed_at = CASE WHEN $5 THEN NOW() ELSE printed_at END,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const values = [
    params.id,
    params.status,
    params.approvedAt ?? false,
    params.rejectedAt ?? false,
    params.printedAt ?? false
  ];
  const result = client
    ? await client.query<PrintRequestRow>(sql, values)
    : await query<PrintRequestRow>(sql, values);

  return result.rows[0] ?? null;
}

export async function insertPrintRequest(
  client: PoolClient,
  params: {
    requestNo: string;
    documentType: string;
    sourceDocumentId: string;
    requesterId: number;
    requesterOrganizationId: number;
    templateId: number;
    printerId?: number;
    copies: number;
    isSensitive: boolean;
    isUrgent: boolean;
    requestReason?: string;
    isReprint?: boolean;
    originalRequestId?: number;
    reprintReason?: string;
  }
) {
  const sql = `
    INSERT INTO print_requests (
      request_no,
      document_type,
      source_document_id,
      requester_id,
      requester_organization_id,
      template_id,
      printer_id,
      copies,
      is_sensitive,
      is_urgent,
      is_reprint,
      original_request_id,
      request_reason,
      reprint_reason,
      status
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'PENDING_APPROVAL'
    )
    RETURNING *
  `;

  const result = await client.query<PrintRequestRow>(sql, [
    params.requestNo,
    params.documentType,
    params.sourceDocumentId,
    params.requesterId,
    params.requesterOrganizationId,
    params.templateId,
    params.printerId ?? null,
    params.copies,
    params.isSensitive,
    params.isUrgent,
    params.isReprint ?? false,
    params.originalRequestId ?? null,
    params.requestReason ?? null,
    params.reprintReason ?? null
  ]);

  return result.rows[0];
}
