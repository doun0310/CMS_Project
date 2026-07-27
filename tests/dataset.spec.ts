import { detectPII } from "../src/utils/pii-detector";
import { analyzeDocumentLayout, DocumentElement } from "../src/utils/layout-analyzer";
import { PrintRequestService } from "../src/services/print-request.service";
import {
  findAssignablePrinterById,
  isActiveTemplate,
  insertPrintRequest
} from "../src/repositories/print-request.repository";
import { createApprovalStep } from "../src/repositories/approval.repository";
import { createAuditLogTx } from "../src/repositories/audit.repository";
import { findPolicyForDocumentType } from "../src/repositories/policy.repository";

jest.mock("../src/config/database", () => ({
  withTransaction: jest.fn((callback) => callback({}))
}));

jest.mock("../src/repositories/print-request.repository", () => ({
  findAssignablePrinterById: jest.fn(),
  findPrintRequestById: jest.fn(),
  isActiveTemplate: jest.fn(),
  insertPrintRequest: jest.fn(),
  listPrintRequestsByOrganization: jest.fn()
}));

jest.mock("../src/repositories/policy.repository", () => ({
  findPolicyForDocumentType: jest.fn()
}));

jest.mock("../src/repositories/approval.repository", () => ({
  createApprovalStep: jest.fn()
}));

jest.mock("../src/repositories/audit.repository", () => ({
  createAuditLogTx: jest.fn()
}));

const mockedIsActiveTemplate = jest.mocked(isActiveTemplate);
const mockedFindPolicyForDocumentType = jest.mocked(findPolicyForDocumentType);
const mockedInsertPrintRequest = jest.mocked(insertPrintRequest);
const mockedCreateApprovalStep = jest.mocked(createApprovalStep);

describe("Dataset Integration & Utility Suite", () => {
  describe("bc-pii-ko PII Detector", () => {
    it("detects Korean RRN (주민등록번호) and auto-masks text", () => {
      const input = "본인 확인용 주민등록번호는 900101-1234567 입니다.";
      const result = detectPII(input);

      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain("주민등록번호");
      expect(result.maskedText).toContain("[주민등록번호_마스킹]");
      expect(result.sensitiveScore).toBeGreaterThanOrEqual(5);
    });

    it("detects mobile numbers, emails, and card numbers", () => {
      const input = "연락처: 010-1234-5678, 이메일: user@test.com, 카드: 1234-5678-9012-3456";
      const result = detectPII(input);

      expect(result.hasPII).toBe(true);
      expect(result.detectedTypes).toContain("전화번호");
      expect(result.detectedTypes).toContain("이메일주소");
      expect(result.detectedTypes).toContain("카드번호");
      expect(result.maskedText).toContain("[전화번호_마스킹]");
      expect(result.maskedText).toContain("[이메일주소_마스킹]");
      expect(result.maskedText).toContain("[카드번호_마스킹]");
    });

    it("returns hasPII = false for clean text", () => {
      const input = "일반적인 업무 진행 보고서입니다. 특이사항 없음.";
      const result = detectPII(input);

      expect(result.hasPII).toBe(false);
      expect(result.detectedTypes.length).toBe(0);
      expect(result.maskedText).toBe(input);
    });
  });

  describe("DocLayNet Document Layout Analyzer", () => {
    it("analyzes 11-class layout elements and calculates top/bottom margins", () => {
      const elements: DocumentElement[] = [
        { id: "1", category: "Page-header", bbox: { x: 0, y: 0, width: 500, height: 30 } },
        { id: "2", category: "Title", bbox: { x: 50, y: 50, width: 400, height: 40 } },
        { id: "3", category: "Section-header", bbox: { x: 50, y: 100, width: 300, height: 25 } },
        { id: "4", category: "Table", bbox: { x: 50, y: 140, width: 400, height: 200 } },
        { id: "5", category: "Text", bbox: { x: 50, y: 350, width: 400, height: 100 } },
        { id: "6", category: "Page-footer", bbox: { x: 0, y: 700, width: 500, height: 30 } }
      ];

      const result = analyzeDocumentLayout(elements);

      expect(result.totalElements).toBe(6);
      expect(result.hasTable).toBe(true);
      expect(result.hasHeaderFooter).toBe(true);
      expect(result.categoryDistribution["Table"]).toBe(1);
      expect(result.recommendedMargins.top).toBe(15);
    });
  });

  describe("PrintRequestService with PII Auto-Escalation", () => {
    it("automatically escalates approval to MANAGER when PII is detected in documentContent", async () => {
      mockedIsActiveTemplate.mockResolvedValue(true);
      mockedFindPolicyForDocumentType.mockResolvedValue(null);
      mockedInsertPrintRequest.mockResolvedValue({
        id: 99,
        request_no: "PR-TEST-PII",
        document_type: "REPORT",
        is_sensitive: true,
        status: "PENDING_APPROVAL"
      } as never);
      mockedCreateApprovalStep.mockResolvedValue({
        id: 1,
        step_no: 1,
        approver_role_code: "MANAGER",
        decision: "PENDING"
      } as never);

      const response = await new PrintRequestService().create(
        {
          documentType: "REPORT",
          sourceDocumentId: "DOC-PII-99",
          templateId: 1,
          copies: 1,
          documentContent: "직원 주민등록번호: 850505-1234567 이 포함되어 있습니다."
        },
        { id: 10, organizationId: 1 }
      );

      expect(response.isSensitive).toBe(true);
      expect(response.piiAnalysis?.hasPII).toBe(true);
      expect(response.piiAnalysis?.detectedTypes).toContain("주민등록번호");
      expect(mockedCreateApprovalStep).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          approverRoleCode: "MANAGER"
        })
      );
    });
  });
});
