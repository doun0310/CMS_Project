import { Request, Response } from "express";
import { AgentService } from "../services/agent.service";
import { fail, ok } from "../utils/api-response";

const service = new AgentService();

export async function pollAgentJobs(req: Request, res: Response) {
  const { agentKey, printerIds } = req.body;

  if (!agentKey || !Array.isArray(printerIds)) {
    return fail(res, "agentKey and printerIds are required", 400);
  }

  return ok(res, await service.poll(agentKey, printerIds));
}

export async function updateAgentJobStatus(req: Request, res: Response) {
  const { jobStatus, failureReason } = req.body;

  if (!jobStatus) {
    return fail(res, "jobStatus is required", 400);
  }

  return ok(res, await service.updateStatus(req.params.jobId, jobStatus, failureReason));
}
