import { Router } from "express";
import adminRoutes from "./admin.routes";
import agentRoutes from "./agent.routes";
import approvalRoutes from "./approval.routes";
import printJobRoutes from "./print-job.routes";
import printRequestRoutes from "./print-request.routes";

const router = Router();

router.use("/print-requests", printRequestRoutes);
router.use("/approvals", approvalRoutes);
router.use("/print-jobs", printJobRoutes);
router.use("/agent", agentRoutes);
router.use("/", adminRoutes);

export default router;
