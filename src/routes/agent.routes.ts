import { Router } from "express";
import { pollAgentJobs, updateAgentJobStatus } from "../controllers/agent.controller";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post("/jobs/poll", asyncHandler(pollAgentJobs));
router.post("/jobs/:jobId/status", asyncHandler(updateAgentJobStatus));

export default router;
