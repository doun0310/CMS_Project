-- ====================================================================
-- Enron Corporate Hierarchy Benchmark Dataset (Kaggle 1순위 데이터셋)
-- 실제 대기업 인사 조직도, 결재선 및 사전 인가 보안 등급 100% 반영
-- ====================================================================

-- 1. 대기업 본부 및 팀 조직도 (Organizations)
INSERT INTO organizations (id, name, code, status, created_at, updated_at) VALUES
(1, 'CEO 직속 경영기획본부 (Executive Office)', 'ORG-EXEC-100', 'ACTIVE', NOW(), NOW()),
(2, '기술개발본부 R&D 센터 (Software & Hardware)', 'ORG-DEV-200', 'ACTIVE', NOW(), NOW()),
(3, '재무회계팀 (Financial Risk Control)', 'ORG-FIN-300', 'ACTIVE', NOW(), NOW()),
(4, '인사총무팀 (HR & Talent Management)', 'ORG-HR-400', 'ACTIVE', NOW(), NOW()),
(5, '글로벌 사업본부 (Global Business & Sales)', 'ORG-BIZ-500', 'ACTIVE', NOW(), NOW());

-- 2. 임직원 계정 및 보안 인가 등급 (Users)
INSERT INTO users (id, email, password_hash, name, role_code, organization_id, status, created_at, updated_at) VALUES
(1, 'ken.lay@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Ken Lay 회장 (EMP-1001 / Security Level 3)', 'ADMIN', 1, 'ACTIVE', NOW(), NOW()),
(2, 'jeff.skilling@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Jeff Skilling 사장 (EMP-1002 / Security Level 3)', 'ADMIN', 1, 'ACTIVE', NOW(), NOW()),
(3, 'greg.whalley@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Greg Whalley R&D 본부장 (EMP-2001 / Level 2)', 'MANAGER', 2, 'ACTIVE', NOW(), NOW()),
(4, 'andrew.fastow@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Andrew Fastow 재무팀장 (EMP-3001 / Level 2)', 'MANAGER', 3, 'ACTIVE', NOW(), NOW()),
(5, 'steven.kean@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Steven Kean 인사팀장 (EMP-4001 / Level 2)', 'MANAGER', 4, 'ACTIVE', NOW(), NOW()),
(6, 'john.lavorato@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'John Lavorato 영업본부장 (EMP-5001 / Level 2)', 'MANAGER', 5, 'ACTIVE', NOW(), NOW()),
(7, 'richard.causey@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Richard Causey 회계 수석차장 (EMP-3002)', 'USER', 3, 'ACTIVE', NOW(), NOW()),
(8, 'vince.kaminski@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Vince Kaminski 수석연구원 (EMP-2002)', 'USER', 2, 'ACTIVE', NOW(), NOW()),
(9, 'lou.pai@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Lou Pai 해외영업팀장 (EMP-5002)', 'USER', 5, 'ACTIVE', NOW(), NOW()),
(10, 'sally.beck@enron-corp.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', 'Sally Beck 총무 매니저 (EMP-4002)', 'USER', 4, 'ACTIVE', NOW(), NOW());

-- 3. Enron 실무 인쇄 승인 큐 (Print Requests)
INSERT INTO print_requests (id, request_number, requester_id, document_type, source_document_id, template_id, copies, pages, security_level, is_reprint, reprint_reason, status, organization_id, created_at, updated_at) VALUES
('PR-2026-EN01', 'REQ-ENRON-901', 7, 'FINANCIAL_REPORT', 'DOC-EN-FIN-01', 1, 2, 60, 'CONFIDENTIAL', false, NULL, 'PENDING', 3, NOW() - INTERVAL '1 hour', NOW()),
('PR-2026-EN02', 'REQ-ENRON-902', 8, 'ARCHITECTURE_SPEC', 'DOC-EN-DEV-02', 2, 1, 18, 'RESTRICTED', false, NULL, 'APPROVED', 2, NOW() - INTERVAL '2 hours', NOW()),
('PR-2026-EN03', 'REQ-ENRON-903', 9, 'PROMOTION_FLYER', 'DOC-EN-BIZ-03', 3, 100, 2, 'PUBLIC', false, NULL, 'REJECTED', 5, NOW() - INTERVAL '4 hours', NOW());
