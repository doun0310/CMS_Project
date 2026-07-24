import { Request, Response } from "express";
import { AgentService } from "../services/agent.service";
import { fail, ok } from "../utils/api-response";
import { getPositiveIntParam } from "../utils/params";

const service = new AgentService();

export async function pollAgentJobs(req: Request, res: Response) {
  const { agentKey, printerIds } = req.body;

  if (
    typeof agentKey !== "string" ||
    !agentKey.trim() ||
    !Array.isArray(printerIds) ||
    printerIds.length === 0 ||
    !printerIds.every((id: unknown) => Number.isInteger(id) && Number(id) > 0)
  ) {
    return fail(res, "agentKey and printerIds are required", 400);
  }

  return ok(res, await service.poll(agentKey, printerIds));
}

export async function updateAgentJobStatus(req: Request, res: Response) {
  const { agentKey, jobStatus, failureReason } = req.body;

  if (typeof agentKey !== "string" || !agentKey.trim() || !jobStatus) {
    return fail(res, "agentKey and jobStatus are required", 400);
  }

  return ok(
    res,
    await service.updateStatus(
      getPositiveIntParam(req.params.jobId, "jobId"),
      agentKey,
      jobStatus,
      failureReason
    )
  );
}
