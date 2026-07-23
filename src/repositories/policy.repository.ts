import { query } from "../config/database";

export interface ApprovalPolicyRow {
  id: number;
  document_type: string;
  min_copies: number;
  requires_reprint_approval: boolean;
  requires_manager_approval: boolean;
  requires_sensitive_approval: boolean;
  organization_id: number;
  status: string;
}

export async function findPolicyForDocumentType(documentType: string, organizationId: number) {
  const sql = `
    SELECT *
    FROM approval_policies
    WHERE document_type = $1
      AND organization_id = $2
      AND status = 'ACTIVE'
    ORDER BY id DESC
    LIMIT 1
  `;

  const result = await query<ApprovalPolicyRow>(sql, [documentType, organizationId]);
  return result.rows[0] ?? null;
}
