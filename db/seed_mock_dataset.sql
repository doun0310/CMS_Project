-- ====================================================================
-- CMS Printer Application 모의 데이터셋 (Mock Enterprise Dataset)
-- 벤치마킹 데이터: Enterprise Asset Management & Corporate Hierarchy Benchmark
-- ====================================================================

-- 1. 조직 / 부서 (Organizations)
INSERT INTO organizations (id, name, code, status, created_at, updated_at) VALUES
(1, '경영기획본부', 'ORG-EXEC', 'ACTIVE', NOW(), NOW()),
(2, '기술개발본부', 'ORG-DEV', 'ACTIVE', NOW(), NOW()),
(3, '재무회계팀', 'ORG-FIN', 'ACTIVE', NOW(), NOW()),
(4, '인사총무팀', 'ORG-HR', 'ACTIVE', NOW(), NOW()),
(5, '마케팅팀', 'ORG-MKT', 'ACTIVE', NOW(), NOW());

-- 2. 사용자 (Users)
INSERT INTO users (id, email, password_hash, name, role_code, organization_id, status, created_at, updated_at) VALUES
(1, 'admin@company.com', '$2b$10$Ep5n...hash', '김보안 이사', 'ADMIN', 1, 'ACTIVE', NOW(), NOW()),
(2, 'dev.manager@company.com', '$2b$10$Ep5n...hash', '이동현 팀장', 'MANAGER', 2, 'ACTIVE', NOW(), NOW()),
(3, 'fin.manager@company.com', '$2b$10$Ep5n...hash', '박정훈 팀장', 'MANAGER', 3, 'ACTIVE', NOW(), NOW()),
(4, 'hr.manager@company.com', '$2b$10$Ep5n...hash', '최성민 팀장', 'MANAGER', 4, 'ACTIVE', NOW(), NOW()),
(5, 'kim.minsu@company.com', '$2b$10$Ep5n...hash', '김민수 대리', 'USER', 3, 'ACTIVE', NOW(), NOW()),
(6, 'park.seoyeon@company.com', '$2b$10$Ep5n...hash', '박서연 과장', 'USER', 2, 'ACTIVE', NOW(), NOW()),
(7, 'jung.sujin@company.com', '$2b$10$Ep5n...hash', '정수진 사원', 'USER', 5, 'ACTIVE', NOW(), NOW()),
(8, 'choi.hyunwoo@company.com', '$2b$10$Ep5n...hash', '최현우 차장', 'USER', 4, 'ACTIVE', NOW(), NOW()),
(9, 'kang.jiwon@company.com', '$2b$10$Ep5n...hash', '강지원 연구원', 'USER', 2, 'ACTIVE', NOW(), NOW()),
(10, 'yoon.seo@company.com', '$2b$10$Ep5n...hash', '윤서아 주임', 'USER', 5, 'ACTIVE', NOW(), NOW());

-- 3. 사내 네트워크 프린터 Fleet (Printers)
INSERT INTO printers (id, code, name, printer_type, connection_type, ip_address, organization_id, location, status, created_at, updated_at) VALUES
(1, 'PRT-2F-HP01', '2F 본관 메인 복합기', 'COLOR_LASER', 'NETWORK_SNMP', '192.168.1.150', 1, '본관 2층 경영지원실 앞', 'ONLINE', NOW(), NOW()),
(2, 'PRT-3F-XR01', '3F R&D 센터 고속 복합기', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.151', 2, 'R&D 센터 3층 개발존', 'ONLINE', NOW(), NOW()),
(3, 'PRT-4F-CN01', '4F 재무/인사 전용 보안 프린터', 'COLOR_LASER', 'NETWORK_SNMP', '192.168.1.152', 3, '4F 재무회계팀 보안구역', 'ONLINE', NOW(), NOW()),
(4, 'PRT-5F-HP02', '5F 마케팅/디자인 대형 복합기', 'COLOR_INKJET', 'NETWORK_SNMP', '192.168.1.153', 5, '5F 마케팅본부 중앙', 'ONLINE', NOW(), NOW()),
(5, 'PRT-1F-RICOH', '1F 로비 무인 출력 키오스크', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.154', 1, '1F 안내데스크 옆', 'OFFLINE', NOW(), NOW()),
(6, 'PRT-3F-XR02', '3F 연구소 서브 프린터', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.155', 2, 'R&D 센터 3층 회의실B', 'ONLINE', NOW(), NOW());

-- 4. 승인 통제 정책 (Approval Policies)
INSERT INTO approval_policies (id, document_type, min_copies, requires_reprint_approval, requires_manager_approval, requires_sensitive_approval, organization_id, status, created_at, updated_at) VALUES
(1, 'FINANCIAL_REPORT', 1, true, true, true, 3, 'ACTIVE', NOW(), NOW()),
(2, 'ARCHITECTURE_SPEC', 5, false, true, true, 2, 'ACTIVE', NOW(), NOW()),
(3, 'PROMOTION_FLYER', 30, true, true, false, 5, 'ACTIVE', NOW(), NOW()),
(4, 'HR_EVALUATION', 1, true, true, true, 4, 'ACTIVE', NOW(), NOW()),
(5, 'GENERAL_DOC', 50, true, false, false, 1, 'ACTIVE', NOW(), NOW());

-- 5. 문서 서식 템플릿 (Document Templates)
INSERT INTO document_templates (id, code, name, document_type, template_version, file_path, created_by, status, created_at, updated_at) VALUES
(1, 'TPL-FIN-01', '2026 Q3 재무회계 분기 보고서 서식', 'FINANCIAL_REPORT', 2, '/templates/fin_q3_v2.docx', 3, 'ACTIVE', NOW(), NOW()),
(2, 'TPL-DEV-01', '시스템 아키텍처 기술 사양서', 'ARCHITECTURE_SPEC', 1, '/templates/arch_spec_v1.pdf', 2, 'ACTIVE', NOW(), NOW()),
(3, 'TPL-MKT-01', '신제품 홍보 브로슈어 시안', 'PROMOTION_FLYER', 1, '/templates/mkt_flyer_v1.ai', 7, 'ACTIVE', NOW(), NOW()),
(4, 'TPL-HR-01', '임직원 인사평가 및 연봉조정서', 'HR_EVALUATION', 3, '/templates/hr_eval_v3.xlsx', 4, 'ACTIVE', NOW(), NOW());

-- 6. 인쇄 요청 결재 큐 (Print Requests)
INSERT INTO print_requests (id, request_number, requester_id, document_type, source_document_id, template_id, copies, pages, security_level, is_reprint, reprint_reason, status, organization_id, created_at, updated_at) VALUES
('PR-2026-001', 'REQ-8801', 5, 'FINANCIAL_REPORT', 'DOC-FIN-9901', 1, 2, 45, 'CONFIDENTIAL', false, NULL, 'PENDING', 3, NOW() - INTERVAL '2 hours', NOW()),
('PR-2026-002', 'REQ-8802', 6, 'ARCHITECTURE_SPEC', 'DOC-DEV-3310', 2, 1, 12, 'RESTRICTED', false, NULL, 'APPROVED', 2, NOW() - INTERVAL '3 hours', NOW()),
('PR-2026-003', 'REQ-8803', 7, 'PROMOTION_FLYER', 'DOC-MKT-1102', 3, 50, 4, 'PUBLIC', false, NULL, 'REJECTED', 5, NOW() - INTERVAL '5 hours', NOW()),
('PR-2026-004', 'REQ-8804', 8, 'HR_EVALUATION', 'DOC-HR-5521', 4, 1, 8, 'CONFIDENTIAL', false, NULL, 'PENDING', 4, NOW() - INTERVAL '1 hour', NOW()),
('PR-2026-005', 'REQ-8805', 9, 'ARCHITECTURE_SPEC', 'DOC-DEV-3315', 2, 2, 24, 'RESTRICTED', true, '고객사 미팅용 추가 출력', 'APPROVED', 2, NOW() - INTERVAL '30 minutes', NOW());

-- 7. 인쇄 승인 처리 이력 (Approval Histories)
INSERT INTO approval_histories (id, print_request_id, approver_id, approval_step, status, comment, created_at) VALUES
(1, 'PR-2026-002', 2, 1, 'APPROVED', '기술개발본부 3층 출력 승인 완료', NOW() - INTERVAL '2 hours 50 minutes'),
(2, 'PR-2026-003', 4, 1, 'REJECTED', '컬러 50장 대량 출력 사유 부족. 디지털 문서 배포 권장', NOW() - INTERVAL '4 hours 40 minutes'),
(3, 'PR-2026-005', 2, 1, 'APPROVED', '재인쇄 사유 확인 완료 및 출력 허가', NOW() - INTERVAL '20 minutes');

-- 8. 보안 감사 이력 & 해시 체인 (Audit Logs)
INSERT INTO audit_logs (id, actor_id, action_type, target_type, target_id, detail_json, ip_address, created_at) VALUES
(1, 6, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 2, '{"docName": "Project_Alpha_Architecture_v2.pdf", "copies": 1}', '10.0.2.88', NOW() - INTERVAL '3 hours'),
(2, 2, 'APPROVAL_GRANTED', 'PRINT_REQUEST', 2, '{"comment": "기술개발본부 3층 출력 승인 완료"}', '10.0.2.10', NOW() - INTERVAL '2 hours 50 minutes'),
(3, 7, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 3, '{"docName": "Marketing_Flyer_Draft.ai", "copies": 50}', '10.0.5.14', NOW() - INTERVAL '5 hours'),
(4, 4, 'REJECTION_SUBMITTED', 'PRINT_REQUEST', 3, '{"reason": "컬러 50장 대량 출력 사유 부족"}', '10.0.4.1', NOW() - INTERVAL '4 hours 40 minutes'),
(5, 1, 'SYNC_SNMP', 'PRINTER', 1, '{"status": "ONLINE", "blackTonerLevel": 85}', '10.0.1.1', NOW() - INTERVAL '1 hour');
