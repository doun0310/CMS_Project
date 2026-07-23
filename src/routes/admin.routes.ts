import { Router } from "express";
import {
  createPolicy,
  createPrinter,
  createTemplate,
  listPolicies,
  listPrinters,
  listTemplates,
  syncPrinterSnmp,
  updatePolicy,
  updatePrinter,
  updateTemplate
} from "../controllers/admin.controller";
import { requireRole } from "../middleware/require-role";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/printers", requireRole(["ADMIN", "MANAGER"]), asyncHandler(listPrinters));
router.post("/printers", requireRole(["ADMIN"]), asyncHandler(createPrinter));
router.patch("/printers/:id", requireRole(["ADMIN"]), asyncHandler(updatePrinter));
router.post("/printers/:id/snmp-sync", requireRole(["ADMIN", "MANAGER"]), asyncHandler(syncPrinterSnmp));

router.get("/approval-policies", requireRole(["ADMIN", "MANAGER"]), asyncHandler(listPolicies));
router.post("/approval-policies", requireRole(["ADMIN"]), asyncHandler(createPolicy));
router.patch("/approval-policies/:id", requireRole(["ADMIN"]), asyncHandler(updatePolicy));

router.get("/templates", requireRole(["ADMIN", "MANAGER"]), asyncHandler(listTemplates));
router.post("/templates", requireRole(["ADMIN"]), asyncHandler(createTemplate));
router.patch("/templates/:id", requireRole(["ADMIN"]), asyncHandler(updateTemplate));

export default router;
