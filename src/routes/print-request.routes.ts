import { Router } from "express";
import {
  createPrintRequest,
  getPrintRequest,
  listPrintRequests,
  reprintRequest
} from "../controllers/print-request.controller";
import { asyncHandler } from "../utils/async-handler";
import { requireRole } from "../middleware/require-role";

const router = Router();

router.use(requireRole(["STAFF", "SUPERVISOR", "MANAGER", "ADMIN", "USER"]));
router.get("/", asyncHandler(listPrintRequests));
router.get("/:id", asyncHandler(getPrintRequest));
router.post("/", asyncHandler(createPrintRequest));
router.post("/:id/reprint", asyncHandler(reprintRequest));

export default router;
