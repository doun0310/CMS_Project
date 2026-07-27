import { PoolClient } from "pg";
import { query } from "../config/database";
import { generateAuditHash } from "../utils/crypto";

export async function createAuditLog(params: {
  actorId?: number | null;
  actionType: string;
  targetType: string;
  targetId: number;
  detailJson?: Record<string, unknown>;
}) {
  const lastLogRes = await query(`SELECT detail_json->>'auditHash' as hash FROM audit_logs ORDER BY id DESC LIMIT 1`);
  const prevHash = lastLogRes.rows[0]?.hash || "GENESIS_HASH_00000000000000000000000000000000";
  const now = new Date();
  const hash = generateAuditHash(prevHash, params.actorId || 0, params.actionType, params.targetType, params.targetId, now);

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
    JSON.stringify({ ...(params.detailJson || {}), auditHash: hash, prevHash })
  ]);

  return { ...result.rows[0], hash };
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
  const lastLogRes = await client.query(`SELECT detail_json->>'auditHash' as hash FROM audit_logs ORDER BY id DESC LIMIT 1`);
  const prevHash = lastLogRes.rows[0]?.hash || "GENESIS_HASH_00000000000000000000000000000000";
  const now = new Date();
  const hash = generateAuditHash(prevHash, params.actorId || 0, params.actionType, params.targetType, params.targetId, now);

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
    JSON.stringify({ ...(params.detailJson || {}), auditHash: hash, prevHash })
  ]);

  return { ...result.rows[0], hash };
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

export async function verifyAuditChain() {
  const sql = `SELECT id, detail_json FROM audit_logs ORDER BY id ASC`;
  const res = await query(sql);
  const rows = res.rows;

  let expectedPrevHash = "GENESIS_HASH_00000000000000000000000000000000";
  let tamperedLogId: number | null = null;

  for (const row of rows) {
    const detail = row.detail_json || {};
    if (detail.prevHash && detail.prevHash !== expectedPrevHash) {
      tamperedLogId = row.id;
      break;
    }
    if (detail.auditHash) {
      expectedPrevHash = detail.auditHash;
    }
  }

  return {
    isValid: tamperedLogId === null,
    tamperedLogId,
    totalLogsVerified: rows.length,
    verifiedAt: new Date().toISOString()
  };
}
