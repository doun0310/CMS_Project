import { Router } from "express";
import {
  createPrintRequest,
  getPrintRequest,
  listPrintRequests,
  reprintRequest
} from "../controllers/print-request.controller";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/", asyncHandler(listPrintRequests));
router.get("/:id", asyncHandler(getPrintRequest));
router.post("/", asyncHandler(createPrintRequest));
router.post("/:id/reprint", asyncHandler(reprintRequest));

export default router;
