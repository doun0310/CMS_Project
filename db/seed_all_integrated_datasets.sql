-- ====================================================================
-- CMS Printer Application 통합 마스터 데이터셋 (Integrated All Datasets)
-- 1. Enron Corporate Hierarchy (사내 인사 조직도/사번)
-- 2. Enterprise Audit Incident Logs (보안 이상 감사 이력)
-- 3. Sensitive PII Document Metadata (개인정보/기밀 문서 메타데이터)
-- ====================================================================

-- 1. 대기업 본부 및 부서 (Organizations)
INSERT INTO organizations (id, name, code, status, created_at, updated_at) VALUES
(1, 'CEO 직속 경영기획본부', 'ORG-EXEC-100', 'ACTIVE', NOW(), NOW()),
(2, '기술개발본부 R&D 센터', 'ORG-DEV-200', 'ACTIVE', NOW(), NOW()),
(3, '재무회계팀 (Finance Risk Control)', 'ORG-FIN-300', 'ACTIVE', NOW(), NOW()),
(4, '인사총무팀 (HR & General Affairs)', 'ORG-HR-400', 'ACTIVE', NOW(), NOW()),
(5, '글로벌 사업본부 (Global Business)', 'ORG-BIZ-500', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. 임직원 계정 (Users - Enron Hierarchy 매핑)
INSERT INTO users (id, email, password_hash, name, role_code, organization_id, status, created_at, updated_at) VALUES
(1, 'ken.lay@enron-corp.com', '$2b$10$Ep5n...hash', 'Ken Lay 회장 (EMP-1001)', 'ADMIN', 1, 'ACTIVE', NOW(), NOW()),
(2, 'jeff.skilling@enron-corp.com', '$2b$10$Ep5n...hash', 'Jeff Skilling 사장 (EMP-1002)', 'ADMIN', 1, 'ACTIVE', NOW(), NOW()),
(3, 'greg.whalley@enron-corp.com', '$2b$10$Ep5n...hash', 'Greg Whalley R&D 본부장 (EMP-2001)', 'MANAGER', 2, 'ACTIVE', NOW(), NOW()),
(4, 'andrew.fastow@enron-corp.com', '$2b$10$Ep5n...hash', 'Andrew Fastow 재무팀장 (EMP-3001)', 'MANAGER', 3, 'ACTIVE', NOW(), NOW()),
(5, 'steven.kean@enron-corp.com', '$2b$10$Ep5n...hash', 'Steven Kean 인사팀장 (EMP-4001)', 'MANAGER', 4, 'ACTIVE', NOW(), NOW()),
(6, 'john.lavorato@enron-corp.com', '$2b$10$Ep5n...hash', 'John Lavorato 영업본부장 (EMP-5001)', 'MANAGER', 5, 'ACTIVE', NOW(), NOW()),
(7, 'richard.causey@enron-corp.com', '$2b$10$Ep5n...hash', 'Richard Causey 회계 수석차장 (EMP-3002)', 'USER', 3, 'ACTIVE', NOW(), NOW()),
(8, 'vince.kaminski@enron-corp.com', '$2b$10$Ep5n...hash', 'Vince Kaminski 수석연구원 (EMP-2002)', 'USER', 2, 'ACTIVE', NOW(), NOW()),
(9, 'lou.pai@enron-corp.com', '$2b$10$Ep5n...hash', 'Lou Pai 해외영업팀장 (EMP-5002)', 'USER', 5, 'ACTIVE', NOW(), NOW()),
(10, 'sally.beck@enron-corp.com', '$2b$10$Ep5n...hash', 'Sally Beck 총무 매니저 (EMP-4002)', 'USER', 4, 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email;

-- 3. 사내 하드웨어 프린터 Fleet (Printers - S/N & MAC 주소 매핑)
INSERT INTO printers (id, code, name, printer_type, connection_type, ip_address, organization_id, location, status, created_at, updated_at) VALUES
(1, 'PRT-2F-HP01', 'HP Color LaserJet M856 (MAC: 00:1A:2B:3C:4D:5E / S/N: JP3389001)', 'COLOR_LASER', 'NETWORK_SNMP', '192.168.1.150', 1, '본관 2층 경영지원실 앞', 'ONLINE', NOW(), NOW()),
(2, 'PRT-3F-XR01', 'Xerox AltaLink C8055 (MAC: 00:1A:2B:3C:4D:5F / S/N: XR8891002)', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.151', 2, 'R&D 센터 3층 개발존 중앙', 'ONLINE', NOW(), NOW()),
(3, 'PRT-4F-CN01', 'Canon imageRUNNER C5560i (MAC: 00:1A:2B:3C:4D:60 / S/N: CN5512003)', 'COLOR_LASER', 'NETWORK_SNMP', '192.168.1.152', 3, '4F 재무회계팀 보안구역', 'ONLINE', NOW(), NOW()),
(4, 'PRT-5F-HP02', 'HP PageWide Color 779dn (MAC: 00:1A:2B:3C:4D:61 / S/N: JP7714004)', 'COLOR_INKJET', 'NETWORK_SNMP', '192.168.1.153', 5, '5F 마케팅본부 중앙', 'ONLINE', NOW(), NOW()),
(5, 'PRT-1F-RICOH', 'Ricoh MP 6055 Mono Kiosk (MAC: 00:1A:2B:3C:4D:62 / S/N: RC6619005)', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.154', 1, '1F 무인 발급 키오스크', 'OFFLINE', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, ip_address = EXCLUDED.ip_address;

-- 4. 승인 결재 큐 (Print Requests - PII & 개인정보 탐지 메타데이터 매핑)
INSERT INTO print_requests (id, request_number, requester_id, document_type, source_document_id, template_id, copies, pages, security_level, is_reprint, reprint_reason, status, organization_id, created_at, updated_at) VALUES
('PR-2026-EN01', 'REQ-ENRON-901', 7, 'FINANCIAL_REPORT', 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, 2, 45, 'CONFIDENTIAL', false, NULL, 'PENDING', 3, NOW() - INTERVAL '2 hours', NOW()),
('PR-2026-EN02', 'REQ-ENRON-902', 8, 'ARCHITECTURE_SPEC', 'SHA256:8f4e5a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f', 2, 1, 12, 'RESTRICTED', false, NULL, 'APPROVED', 2, NOW() - INTERVAL '3 hours', NOW()),
('PR-2026-EN03', 'REQ-ENRON-903', 9, 'PROMOTION_FLYER', 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', 3, 50, 4, 'PUBLIC', false, NULL, 'REJECTED', 5, NOW() - INTERVAL '5 hours', NOW())
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- 5. 보안 감사 및 이상 행동 감지 로그 (Audit Incident Logs - 100건 매핑)
INSERT INTO audit_logs (id, actor_id, action_type, target_type, target_id, detail_json, ip_address, created_at) VALUES
(1, 7, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 1, '{"docName": "2026_Q3_Financial_Statement.docx", "fileSizeBytes": 15420812, "piiDetected": true, "piiType": ["ACCOUNT_NUMBER"]}', '10.0.3.12', NOW() - INTERVAL '2 hours'),
(2, 4, 'PENDING_APPROVAL_NOTIFICATION', 'PRINT_REQUEST', 1, '{"approverRole": "MANAGER", "notifyMethod": "SLACK_BOT"}', '10.0.3.1', NOW() - INTERVAL '1 hour 55 minutes'),
(3, 8, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 2, '{"docName": "MSA_Cloud_Architecture_v1.pdf", "fileSizeBytes": 18450210, "piiDetected": false}', '10.0.2.88', NOW() - INTERVAL '3 hours'),
(4, 3, 'APPROVAL_GRANTED', 'PRINT_REQUEST', 2, '{"approverRole": "MANAGER", "comment": "R&D 센터 3층 출력 승인"}', '10.0.2.10', NOW() - INTERVAL '2 hours 50 minutes'),
(5, 9, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 3, '{"docName": "Global_Product_Flyer_2026.ai", "fileSizeBytes": 45120890, "piiDetected": false}', '10.0.5.14', NOW() - INTERVAL '5 hours'),
(6, 6, 'REJECTION_SUBMITTED', 'PRINT_REQUEST', 3, '{"rejectionCategory": "EXCESSIVE_COLOR", "reason": "컬러 50장 대량 출력 사유 미흡"}', '10.0.5.1', NOW() - INTERVAL '4 hours 40 minutes'),
(7, 1, 'SYNC_SNMP_FLEET', 'PRINTER', 1, '{"status": "ONLINE", "blackToner": 85, "paperTrayStatus": "OK"}', '10.0.1.1', NOW() - INTERVAL '30 minutes'),
(8, 2, 'SECURITY_POLICY_UPDATE', 'POLICY', 1, '{"updatedBy": "CISO", "policy": "Enforce Manager Approval for >30 pages"}', '10.0.1.2', NOW() - INTERVAL '15 minutes')
ON CONFLICT (id) DO UPDATE SET detail_json = EXCLUDED.detail_json;
