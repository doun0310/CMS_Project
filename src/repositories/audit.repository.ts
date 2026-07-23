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
