import { PoolClient } from "pg";
import { query } from "../config/database";

export interface PrintJobRow {
  id: number;
  print_request_id: number;
  printer_id: number;
  agent_key: string | null;
  job_status: string;
  retry_count: number;
  started_at: string | null;
  finished_at: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

export async function createPrintJob(params: {
  printRequestId: number;
  printerId: number;
  agentKey?: string | null;
}, client?: PoolClient) {
  const sql = `
    INSERT INTO print_jobs (
      print_request_id,
      printer_id,
      agent_key,
      job_status
    )
    VALUES ($1, $2, $3, 'QUEUED')
    RETURNING *
  `;

  const values = [
    params.printRequestId,
    params.printerId,
    params.agentKey ?? null
  ];
  const result = client
    ? await client.query<PrintJobRow>(sql, values)
    : await query<PrintJobRow>(sql, values);

  return result.rows[0];
}

export async function findPrintJobById(jobId: number) {
  const sql = `
    SELECT *
    FROM print_jobs
    WHERE id = $1
  `;

  const result = await query<PrintJobRow>(sql, [jobId]);
  return result.rows[0] ?? null;
}

export async function findPrintJobByIdForUpdate(client: PoolClient, jobId: number) {
  const result = await client.query<PrintJobRow>(
    `
      SELECT *
      FROM print_jobs
      WHERE id = $1
      FOR UPDATE
    `,
    [jobId]
  );

  return result.rows[0] ?? null;
}

export async function findPrintJobForAgent(jobId: number, agentKey: string) {
  const sql = `
    SELECT j.*
    FROM print_jobs j
    INNER JOIN printers pr ON pr.id = j.printer_id
    WHERE j.id = $1
      AND pr.agent_key = $2
      AND (j.agent_key = $2 OR j.agent_key IS NULL)
  `;

  const result = await query<PrintJobRow>(sql, [jobId, agentKey]);
  return result.rows[0] ?? null;
}

export async function findPrintJobForAgentForUpdate(
  client: PoolClient,
  jobId: number,
  agentKey: string
) {
  const result = await client.query<PrintJobRow>(
    `
      SELECT j.*
      FROM print_jobs j
      INNER JOIN printers pr ON pr.id = j.printer_id
      WHERE j.id = $1
        AND pr.agent_key = $2
        AND (j.agent_key = $2 OR j.agent_key IS NULL)
      FOR UPDATE OF j
    `,
    [jobId, agentKey]
  );

  return result.rows[0] ?? null;
}

export async function listQueuedJobsByAgent(agentKey: string, printerIds: number[]) {
  const sql = `
    SELECT
      j.*,
      p.document_type,
      p.source_document_id,
      p.copies,
      t.file_path AS template_path
    FROM print_jobs j
    INNER JOIN print_requests p ON p.id = j.print_request_id
    INNER JOIN document_templates t ON t.id = p.template_id
    INNER JOIN printers pr ON pr.id = j.printer_id
    WHERE j.job_status = 'QUEUED'
      AND (j.agent_key = $1 OR j.agent_key IS NULL)
      AND pr.agent_key = $1
      AND j.printer_id = ANY($2::bigint[])
    ORDER BY j.created_at ASC
    LIMIT 20
  `;

  const result = await query(sql, [agentKey, printerIds]);
  return result.rows;
}

export async function updatePrintJobStatus(params: {
  jobId: number;
  jobStatus: string;
  failureReason?: string | null;
}, client?: PoolClient) {
  const sql = `
    UPDATE print_jobs
    SET job_status = $2,
        failure_reason = $3,
        started_at = CASE
          WHEN $2 = 'PRINTING' AND started_at IS NULL THEN NOW()
          ELSE started_at
        END,
        finished_at = CASE
          WHEN $2 IN ('SUCCESS', 'FAILED') THEN NOW()
          ELSE finished_at
        END,
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;

  const values = [
    params.jobId,
    params.jobStatus,
    params.failureReason ?? null
  ];
  const result = client
    ? await client.query<PrintJobRow>(sql, values)
    : await query<PrintJobRow>(sql, values);

  return result.rows[0] ?? null;
}

export async function retryPrintJobById(
  jobId: number,
  reason?: string,
  client?: PoolClient
) {
  const sql = `
    UPDATE print_jobs
    SET job_status = 'QUEUED',
        retry_count = retry_count + 1,
        failure_reason = $2,
        started_at = NULL,
        finished_at = NULL,
        updated_at = NOW()
    WHERE id = $1
      AND job_status = 'FAILED'
    RETURNING *
  `;

  const values = [jobId, reason ?? null];
  const result = client
    ? await client.query<PrintJobRow>(sql, values)
    : await query<PrintJobRow>(sql, values);
  return result.rows[0] ?? null;
}
