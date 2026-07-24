import { PoolClient } from "pg";
import { query } from "../config/database";

export async function createAuditLog(params: {
  actorId?: number | null;
  actionType: string;
  targetType: string;
  targetId: number;
  detailJson?: Record<string, unknown>;
}) {
  const sql = `
    INSERT INTO audit_logs (
      actor_id,
      action_type,
      target_type,
      target_id,
      detail_json
    )
    VALUES ($1, $2, $3, $4, $5::jsonb)
    RETURNING *
  `;

  const result = await query(sql, [
    params.actorId ?? null,
    params.actionType,
    params.targetType,
    params.targetId,
    JSON.stringify(params.detailJson ?? {})
  ]);

  return result.rows[0];
}

export async function createAuditLogTx(
  client: PoolClient,
  params: {
    actorId?: number | null;
    actionType: string;
    targetType: string;
    targetId: number;
    detailJson?: Record<string, unknown>;
  }
) {
  const sql = `
    INSERT INTO audit_logs (
      actor_id,
      action_type,
      target_type,
      target_id,
      detail_json
    )
    VALUES ($1, $2, $3, $4, $5::jsonb)
    RETURNING *
  `;

  const result = await client.query(sql, [
    params.actorId ?? null,
    params.actionType,
    params.targetType,
    params.targetId,
    JSON.stringify(params.detailJson ?? {})
  ]);

  return result.rows[0];
}

export async function listAuditLogs(organizationId: number | null) {
  const sql = `
    SELECT 
      a.id,
      a.action_type as action,
      COALESCE(u.name, 'System') as actor_name,
      CONCAT(a.target_type, ' #', a.target_id) as target_resource,
      a.detail_json::text as details,
      '-'::text AS ip_address,
      a.created_at
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE ($1::bigint IS NULL OR u.organization_id = $1)
    ORDER BY a.created_at DESC
    LIMIT 100
  `;
  const result = await query(sql, [organizationId]);
  return result.rows;
}
