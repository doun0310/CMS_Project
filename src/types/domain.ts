export type RequestStatus =
  | "DRAFT"
  | "REQUESTED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "QUEUED"
  | "PRINTING"
  | "PRINT_SUCCESS"
  | "PRINT_FAILED"
  | "CANCELLED";

export type DecisionStatus = "PENDING" | "APPROVED" | "REJECTED" | "SKIPPED";

export interface PrintRequestPayload {
  documentType: string;
  sourceDocumentId: string;
  templateId: number;
  printerId?: number;
  copies: number;
  isSensitive?: boolean;
  isUrgent?: boolean;
  requestReason?: string;
  documentContent?: string;
}

export interface ReprintPayload {
  printerId?: number;
  copies: number;
  reprintReason: string;
}

export interface ApprovalActionPayload {
  comment?: string;
  reason?: string;
}
