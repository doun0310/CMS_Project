import { PoolClient } from "pg";
import { query } from "../config/database";

export interface ApprovalStepRow {
  id: number;
  print_request_id: number;
  step_no: number;
  approver_role_code: string;
  approver_id: number | null;
  decision: string;
  decision_reason: string | null;
  decided_at: string | null;
  created_at: string;
}

export async function createApprovalStep(
  client: PoolClient,
  params: {
    printRequestId: number;
    stepNo: number;
    approverRoleCode: string;
  }
) {
  const sql = `
    INSERT INTO approval_steps (
      print_request_id,
      step_no,
      approver_role_code,
      decision
    )
    VALUES ($1, $2, $3, 'PENDING')
    RETURNING *
  `;

  const result = await client.query<ApprovalStepRow>(sql, [
    params.printRequestId,
    params.stepNo,
    params.approverRoleCode
  ]);

  return result.rows[0];
}

export async function listPendingApprovalsForRole(roleCode: string, organizationId: number) {
  const sql = `
    SELECT
      a.*,
      p.request_no,
      p.document_type,
      p.requester_id,
      p.copies,
      p.is_sensitive,
      p.requested_at
    FROM approval_steps a
    INNER JOIN print_requests p ON p.id = a.print_request_id
    WHERE a.decision = 'PENDING'
      AND a.approver_role_code = $1
      AND p.requester_organization_id = $2
    ORDER BY p.requested_at ASC
  `;

  const result = await query(sql, [roleCode, organizationId]);
  return result.rows;
}

export async function findPendingApprovalStep(
  client: PoolClient,
  printRequestId: number,
  roleCode: string,
  organizationId: number,
  allowAnyOrganization: boolean,
  allowAnyRole: boolean
) {
  const sql = `
    SELECT a.*
    FROM approval_steps a
    INNER JOIN print_requests p ON p.id = a.print_request_id
    WHERE a.print_request_id = $1
      AND ($5 OR a.approver_role_code = $2)
      AND a.decision = 'PENDING'
      AND ($4 OR p.requester_organization_id = $3)
    ORDER BY a.step_no ASC
    LIMIT 1
    FOR UPDATE OF a
  `;

  const result = await client.query<ApprovalStepRow>(sql, [
    printRequestId,
    roleCode,
    organizationId,
    allowAnyOrganization,
    allowAnyRole
  ]);
  return result.rows[0] ?? null;
}

export async function approveStep(
  client: PoolClient,
  params: {
    stepId: number;
    approverId: number;
    comment?: string;
  }
) {
  const sql = `
    UPDATE approval_steps
    SET approver_id = $2,
        decision = 'APPROVED',
        decision_reason = $3,
        decided_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query<ApprovalStepRow>(sql, [
    params.stepId,
    params.approverId,
    params.comment ?? null
  ]);

  return result.rows[0];
}

export async function rejectStep(
  client: PoolClient,
  params: {
    stepId: number;
    approverId: number;
    reason: string;
  }
) {
  const sql = `
    UPDATE approval_steps
    SET approver_id = $2,
        decision = 'REJECTED',
        decision_reason = $3,
        decided_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const result = await client.query<ApprovalStepRow>(sql, [
    params.stepId,
    params.approverId,
    params.reason
  ]);

  return result.rows[0];
}
