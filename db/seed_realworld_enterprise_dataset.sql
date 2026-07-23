-- ====================================================================
-- Real-world Enterprise Print Management Mock Dataset
-- 대기업 사내 네트워크, 프린터 텔레메트리, SHA-256 문서 해시 반영 데이터셋
-- ====================================================================

-- 1. 조직 / 부서 (Organizations)
INSERT INTO organizations (id, name, code, status, created_at, updated_at) VALUES
(1, '경영기획본부 (Executive Office)', 'ORG-EXEC-01', 'ACTIVE', NOW(), NOW()),
(2, '기술개발본부 (R&D Center)', 'ORG-DEV-02', 'ACTIVE', NOW(), NOW()),
(3, '재무회계팀 (Finance & Accounting)', 'ORG-FIN-03', 'ACTIVE', NOW(), NOW()),
(4, '인사총무팀 (HR & General Affairs)', 'ORG-HR-04', 'ACTIVE', NOW(), NOW()),
(5, '글로벌마케팅팀 (Global Marketing)', 'ORG-MKT-05', 'ACTIVE', NOW(), NOW());

-- 2. 사용자 계정 (Users - 사번, 직급, 보안등급 메타데이터 수록)
INSERT INTO users (id, email, password_hash, name, role_code, organization_id, status, created_at, updated_at) VALUES
(1, 'admin.kim@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '김보안 CISO 이사 (EMP-2026-0001)', 'ADMIN', 1, 'ACTIVE', NOW(), NOW()),
(2, 'dh.lee@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '이동현 본부장 (EMP-2026-0102)', 'MANAGER', 2, 'ACTIVE', NOW(), NOW()),
(3, 'jh.park@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '박정훈 팀장 (EMP-2026-0103)', 'MANAGER', 3, 'ACTIVE', NOW(), NOW()),
(4, 'sm.choi@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '최성민 팀장 (EMP-2026-0104)', 'MANAGER', 4, 'ACTIVE', NOW(), NOW()),
(5, 'ms.kim@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '김민수 수석대리 (EMP-2026-0205)', 'USER', 3, 'ACTIVE', NOW(), NOW()),
(6, 'sy.park@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '박서연 책임과장 (EMP-2026-0206)', 'USER', 2, 'ACTIVE', NOW(), NOW()),
(7, 'sj.jung@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '정수진 매니저 (EMP-2026-0307)', 'USER', 5, 'ACTIVE', NOW(), NOW()),
(8, 'hw.choi@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '최현우 수석차장 (EMP-2026-0108)', 'USER', 4, 'ACTIVE', NOW(), NOW()),
(9, 'jw.kang@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '강지원 선임연구원 (EMP-2026-0209)', 'USER', 2, 'ACTIVE', NOW(), NOW()),
(10, 'sa.yoon@company.com', '$2b$10$Ep5nJ60V0mQJ8bX1vQz7uOqY...hash', '윤서아 주임 (EMP-2026-0310)', 'USER', 5, 'ACTIVE', NOW(), NOW());

-- 3. 사내 하드웨어 프린터 Fleet (Printers - 시리얼번호, MAC주소, IP, 텔레메트리 메타데이터 반영)
INSERT INTO printers (id, code, name, printer_type, connection_type, ip_address, organization_id, location, status, created_at, updated_at) VALUES
(1, 'PRT-2F-HP01', 'HP Color LaserJet Enterprise M856 (MAC: 00:1A:2B:3C:4D:5E / S/N: JP3389001)', 'COLOR_LASER', 'NETWORK_SNMP', '192.168.1.150', 1, '본관 2층 경영기획실 앞 (PostScript 3 v4.12)', 'ONLINE', NOW(), NOW()),
(2, 'PRT-3F-XR01', 'Xerox AltaLink C8055 High-Speed (MAC: 00:1A:2B:3C:4D:5F / S/N: XR8891002)', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.151', 2, 'R&D 센터 3층 개발존 중앙 (PCL 6 Engine)', 'ONLINE', NOW(), NOW()),
(3, 'PRT-4F-CN01', 'Canon imageRUNNER ADVANCE C5560i (MAC: 00:1A:2B:3C:4D:60 / S/N: CN5512003)', 'COLOR_LASER', 'NETWORK_SNMP', '192.168.1.152', 3, '4F 재무회계팀 보안구역 (IC카드 게이트 탑재)', 'ONLINE', NOW(), NOW()),
(4, 'PRT-5F-HP02', 'HP PageWide Color 779dn (MAC: 00:1A:2B:3C:4D:61 / S/N: JP7714004)', 'COLOR_INKJET', 'NETWORK_SNMP', '192.168.1.153', 5, '5F 글로벌마케팅본부 중앙 A3 대응 복합기', 'ONLINE', NOW(), NOW()),
(5, 'PRT-1F-RICOH', 'Ricoh MP 6055 Mono Kiosk (MAC: 00:1A:2B:3C:4D:62 / S/N: RC6619005)', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.154', 1, '1F 안내데스크 옆 무인 발급 전용 프린터', 'OFFLINE', NOW(), NOW()),
(6, 'PRT-3F-XR02', 'Xerox VersaLink B405 (MAC: 00:1A:2B:3C:4D:63 / S/N: XR4420006)', 'MONO_LASER', 'NETWORK_SNMP', '192.168.1.155', 2, 'R&D 센터 3층 소회의실B 내부', 'ONLINE', NOW(), NOW());

-- 4. 승인 통제 정책 (Approval Policies)
INSERT INTO approval_policies (id, document_type, min_copies, requires_reprint_approval, requires_manager_approval, requires_sensitive_approval, organization_id, status, created_at, updated_at) VALUES
(1, 'FINANCIAL_REPORT', 1, true, true, true, 3, 'ACTIVE', NOW(), NOW()),
(2, 'ARCHITECTURE_SPEC', 5, false, true, true, 2, 'ACTIVE', NOW(), NOW()),
(3, 'PROMOTION_FLYER', 30, true, true, false, 5, 'ACTIVE', NOW(), NOW()),
(4, 'HR_EVALUATION', 1, true, true, true, 4, 'ACTIVE', NOW(), NOW()),
(5, 'GENERAL_DOC', 50, true, false, false, 1, 'ACTIVE', NOW(), NOW());

-- 5. 문서 서식 템플릿 (Document Templates)
INSERT INTO document_templates (id, code, name, document_type, template_version, file_path, created_by, status, created_at, updated_at) VALUES
(1, 'TPL-FIN-2026-Q3', '2026년 3분기 연결재무제표 및 감사보고서 양식 (v2.4)', 'FINANCIAL_REPORT', 2, '/templates/fin/2026_Q3_Financial_Statement_v2.docx', 3, 'ACTIVE', NOW(), NOW()),
(2, 'TPL-DEV-ARCH-V1', '마이크로서비스 클라우드 아키텍처 기술사양서', 'ARCHITECTURE_SPEC', 1, '/templates/dev/MSA_Cloud_Architecture_v1.pdf', 2, 'ACTIVE', NOW(), NOW()),
(3, 'TPL-MKT-FLYER-05', '2026 신제품 하반기 글로벌 브로슈어 시안', 'PROMOTION_FLYER', 1, '/templates/mkt/Global_Product_Flyer_2026.ai', 7, 'ACTIVE', NOW(), NOW()),
(4, 'TPL-HR-EVAL-2026', '2026년도 임직원 인사고과 및 목표합의서 (v3.0)', 'HR_EVALUATION', 3, '/templates/hr/2026_Employee_Evaluation_v3.xlsx', 4, 'ACTIVE', NOW(), NOW());

-- 6. 인쇄 요청 결재 큐 (Print Requests - SHA-256 문서해시, 바이트 용량 반영)
INSERT INTO print_requests (id, request_number, requester_id, document_type, source_document_id, template_id, copies, pages, security_level, is_reprint, reprint_reason, status, organization_id, created_at, updated_at) VALUES
('PR-2026-0001', 'REQ-20260723-001', 5, 'FINANCIAL_REPORT', 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 1, 2, 45, 'CONFIDENTIAL', false, NULL, 'PENDING', 3, NOW() - INTERVAL '2 hours 15 minutes', NOW()),
('PR-2026-0002', 'REQ-20260723-002', 6, 'ARCHITECTURE_SPEC', 'SHA256:8f4e5a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f', 2, 1, 12, 'RESTRICTED', false, NULL, 'APPROVED', 2, NOW() - INTERVAL '3 hours 40 minutes', NOW()),
('PR-2026-0003', 'REQ-20260723-003', 7, 'PROMOTION_FLYER', 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b', 3, 50, 4, 'PUBLIC', false, NULL, 'REJECTED', 5, NOW() - INTERVAL '5 hours 10 minutes', NOW()),
('PR-2026-0004', 'REQ-20260723-004', 8, 'HR_EVALUATION', 'SHA256:9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', 4, 1, 8, 'CONFIDENTIAL', false, NULL, 'PENDING', 4, NOW() - INTERVAL '1 hour 05 minutes', NOW()),
('PR-2026-0005', 'REQ-20260723-005', 9, 'ARCHITECTURE_SPEC', 'SHA256:4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b', 2, 2, 24, 'RESTRICTED', true, '해외 파트너사 현장 미팅 제출용 추가 인쇄', 'APPROVED', 2, NOW() - INTERVAL '25 minutes', NOW());

-- 7. 인쇄 승인 처리 이력 (Approval Histories)
INSERT INTO approval_histories (id, print_request_id, approver_id, approval_step, status, comment, created_at) VALUES
(1, 'PR-2026-0002', 2, 1, 'APPROVED', '[승인] R&D 아키텍처 서식 3층 Xerox 복합기 출력 승인 완료 (보안등급: RESTRICTED)', NOW() - INTERVAL '3 hours 30 minutes'),
(2, 'PR-2026-0003', 4, 1, 'REJECTED', '[반려] 컬러 50장 대량 출력 사유 미흡. 종이 자원 절감을 위해 PDF 디지털 문서 배포를 권장함.', NOW() - INTERVAL '4 hours 50 minutes'),
(3, 'PR-2026-0005', 2, 1, 'APPROVED', '[재인쇄 승인] 고객사 미팅 사유 확인 완료 및 출력 승인.', NOW() - INTERVAL '20 minutes');

-- 8. 보안 감사 이력 & SHA-256 해시 체인 (Audit Logs - IP주소, 클라이언트 OS, 해시 체인 반영)
INSERT INTO audit_logs (id, actor_id, action_type, target_type, target_id, detail_json, ip_address, created_at) VALUES
(1, 6, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 2, '{"clientOS": "Windows 11 Pro 23H2", "docName": "MSA_Cloud_Architecture_v1.pdf", "fileSizeBytes": 18450210, "sha256": "8f4e5a2b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f"}', '10.0.2.88', NOW() - INTERVAL '3 hours 40 minutes'),
(2, 2, 'APPROVAL_GRANTED', 'PRINT_REQUEST', 2, '{"approverRole": "MANAGER", "comment": "R&D 아키텍처 서식 출력 승인 완료"}', '10.0.2.10', NOW() - INTERVAL '3 hours 30 minutes'),
(3, 7, 'CREATE_PRINT_REQUEST', 'PRINT_REQUEST', 3, '{"clientOS": "macOS Sonoma 14.5", "docName": "Global_Product_Flyer_2026.ai", "fileSizeBytes": 45120890, "sha256": "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b"}', '10.0.5.14', NOW() - INTERVAL '5 hours 10 minutes'),
(4, 4, 'REJECTION_SUBMITTED', 'PRINT_REQUEST', 3, '{"approverRole": "MANAGER", "rejectionCategory": "EXCESSIVE_COLOR", "reason": "컬러 50장 대량 출력 사유 미흡"}', '10.0.4.1', NOW() - INTERVAL '4 hours 50 minutes'),
(5, 1, 'SYNC_SNMP', 'PRINTER', 1, '{"printerSN": "JP3389001", "status": "ONLINE", "blackToner": 85, "paperTrayStatus": "OK"}', '10.0.1.1', NOW() - INTERVAL '1 hour');
