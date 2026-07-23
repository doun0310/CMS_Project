import { Router } from "express";
import {
  dispatchPrintJob,
  getPrintJob,
  retryPrintJob
} from "../controllers/print-job.controller";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.post("/:printRequestId/dispatch", requireRole(["ADMIN", "MANAGER"]), asyncHandler(dispatchPrintJob));
router.get("/:jobId", requireRole(["SUPERVISOR", "MANAGER", "ADMIN"]), asyncHandler(getPrintJob));
router.post("/:jobId/retry", requireRole(["SUPERVISOR", "MANAGER", "ADMIN"]), asyncHandler(retryPrintJob));

export default router;
