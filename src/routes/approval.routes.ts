import { Router } from "express";
import {
  approveRequest,
  getPendingApprovals,
  rejectRequest
} from "../controllers/approval.controller";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/pending", requireRole(["SUPERVISOR", "MANAGER", "ADMIN"]), asyncHandler(getPendingApprovals));
router.post("/:printRequestId/approve", requireRole(["SUPERVISOR", "MANAGER", "ADMIN"]), asyncHandler(approveRequest));
router.post("/:printRequestId/reject", requireRole(["SUPERVISOR", "MANAGER", "ADMIN"]), asyncHandler(rejectRequest));

export default router;
