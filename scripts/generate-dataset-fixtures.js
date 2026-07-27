const fs = require("fs");
const path = require("path");

function findDatasetFile() {
  const datasetsDir = path.join(__dirname, "../datasets");
  if (!fs.existsSync(datasetsDir)) return null;

  const dirs = fs.readdirSync(datasetsDir);
  const piiDirName = dirs.find((d) => d.includes("bc-pii-ko"));
  if (!piiDirName) return null;

  const piiDirPath = path.join(datasetsDir, piiDirName);
  if (!fs.existsSync(piiDirPath)) return null;
  const files = fs.readdirSync(piiDirPath);
  const testJsonl = files.find((f) => f.includes("test.jsonl") && !f.includes("gap"));
  if (!testJsonl) return null;

  return path.join(piiDirPath, testJsonl);
}

function generateDatasetFixtures() {
  const jsonlPath = findDatasetFile();
  const outputPath = path.join(__dirname, "../db/seed_dataset_fixtures.sql");

  const sqlStatements = [
    "-- ====================================================================",
    "-- CMS Printer Application - Dataset Seed Fixtures",
    "-- Generated from datasets/bc-pii-ko and datasets/DocLayNet metadata",
    "-- ====================================================================",
    "",
    "-- 1. DocLayNet 구조 메타데이터가 적용된 문서 템플릿",
    "INSERT INTO document_templates (id, code, name, document_type, template_version, file_path, status, created_at, updated_at)",
    "VALUES",
    "  (101, 'TPL-PII-RRN-01', '주민등록번호 포함 민감 보고서 템플릿', 'SENSITIVE_REPORT', 1, '/templates/sensitive_rrn_v1.pdf', 'ACTIVE', NOW(), NOW()),",
    "  (102, 'TPL-PII-CARD-02', '신용카드 결제 및 승인 내역서 템플릿', 'PAYMENT_RECEIPT', 1, '/templates/payment_card_v1.pdf', 'ACTIVE', NOW(), NOW()),",
    "  (103, 'TPL-LAYOUT-DOC-03', 'DocLayNet 11-Class 구조분석용 종합 서식', 'FINANCIAL_STATEMENT', 1, '/templates/doclaynet_multi_layout.pdf', 'ACTIVE', NOW(), NOW())",
    "ON CONFLICT (code, template_version) DO UPDATE SET name = EXCLUDED.name;",
    ""
  ];

  sqlStatements.push("-- 2. bc-pii-ko 샘플 기반 인쇄 요청 및 개인정보 탐지 테스트 시드 데이터");
  sqlStatements.push(
    "INSERT INTO print_requests (id, request_no, document_type, source_document_id, requester_id, requester_organization_id, template_id, printer_id, copies, is_sensitive, is_urgent, is_reprint, request_reason, status, requested_at, created_at, updated_at)",
    "VALUES"
  );

  const valuesArr = [];
  let idCount = 5001;

  if (jsonlPath && fs.existsSync(jsonlPath)) {
    const fileContent = fs.readFileSync(jsonlPath, "utf-8");
    const lines = fileContent.split("\n").filter(Boolean);

    for (let i = 0; i < Math.min(10, lines.length); i++) {
      try {
        const item = JSON.parse(lines[i]);
        const text = item.source_text.replace(/'/g, "''").replace(/\n/g, " ");
        const requestNo = `PR-DATASET-${idCount}`;
        const isSensitive = item.privacy_mask && item.privacy_mask.some((m) => m.bc_type);

        valuesArr.push(
          `  (${idCount}, '${requestNo}', 'SENSITIVE_REPORT', 'DOC-DS-${item.uid || idCount}', 1, 1, 101, 1, 2, ${
            isSensitive ? "TRUE" : "FALSE"
          }, FALSE, FALSE, '${text.slice(0, 250)}', 'PENDING_APPROVAL', NOW(), NOW(), NOW())`
        );
        idCount++;
      } catch (e) {
        // ignore
      }
    }
  }

  // Fallback high-quality dataset samples if jsonl dataset file is absent
  if (valuesArr.length === 0) {
    valuesArr.push(
      `  (5001, 'PR-DATASET-5001', 'SENSITIVE_REPORT', 'DOC-DS-24680341', 1, 1, 101, 1, 2, TRUE, FALSE, FALSE, '각 부서 관리자는 팀원 중 34세 이상인 직원의 정보와 함께 카드번호 4111-1171-6971-2619 보안 검증을 실행하세요.', 'PENDING_APPROVAL', NOW(), NOW(), NOW())`,
      `  (5002, 'PR-DATASET-5002', 'SENSITIVE_REPORT', 'DOC-DS-24831858', 1, 1, 101, 1, 2, TRUE, FALSE, FALSE, '배송 관련 문의는 010-3527-3137 혹은 ciewnzhy@naver.com로 연락해 주세요.', 'PENDING_APPROVAL', NOW(), NOW(), NOW())`,
      `  (5003, 'PR-DATASET-5003', 'SENSITIVE_REPORT', 'DOC-DS-24654363', 1, 1, 101, 1, 2, TRUE, FALSE, FALSE, '직원 주민등록번호 900101-1234567 및 생년월일 1964-10-03 검증 서류 제출.', 'PENDING_APPROVAL', NOW(), NOW(), NOW())`
    );
  }

  sqlStatements.push(valuesArr.join(",\n") + "\nON CONFLICT (request_no) DO NOTHING;");
  sqlStatements.push("");
  sqlStatements.push("-- 3. 승인 단계 시드 생성");
  sqlStatements.push(
    "INSERT INTO approval_steps (print_request_id, step_no, approver_role_code, decision, created_at)",
    "VALUES",
    "  (5001, 1, 'MANAGER', 'PENDING', NOW()),",
    "  (5002, 1, 'MANAGER', 'PENDING', NOW()),",
    "  (5003, 1, 'SUPERVISOR', 'PENDING', NOW())",
    "ON CONFLICT (print_request_id, step_no) DO NOTHING;"
  );

  fs.writeFileSync(outputPath, sqlStatements.join("\n"), "utf-8");
  console.log("Successfully generated:", outputPath);
}

generateDatasetFixtures();
