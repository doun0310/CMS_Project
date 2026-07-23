INSERT INTO organizations (name, parent_id, org_type, status)
VALUES
    ('본사', NULL, 'COMPANY', 'ACTIVE'),
    ('운영본부', 1, 'DIVISION', 'ACTIVE'),
    ('물류팀', 2, 'TEAM', 'ACTIVE'),
    ('관리팀', 2, 'TEAM', 'ACTIVE');

INSERT INTO users (login_id, name, email, organization_id, role_id, status)
VALUES
    ('staff01', '실무자1', 'staff01@example.com', 3, 1, 'ACTIVE'),
    ('supervisor01', '중간관리자1', 'supervisor01@example.com', 3, 2, 'ACTIVE'),
    ('manager01', '매니저1', 'manager01@example.com', 2, 3, 'ACTIVE'),
    ('admin01', '시스템관리자1', 'admin01@example.com', 1, 4, 'ACTIVE');

INSERT INTO printers (code, name, printer_type, connection_type, ip_address, agent_key, organization_id, location, status)
VALUES
    ('PRT-LOG-01', '물류 라벨 프린터 1', 'LABEL', 'NETWORK', '192.168.0.31', 'agent-logistics-01', 3, '물류창고 A구역', 'ACTIVE'),
    ('PRT-OFF-01', '관리팀 A4 프린터 1', 'A4', 'NETWORK', '192.168.0.41', 'agent-admin-01', 4, '관리팀 사무실', 'ACTIVE');

INSERT INTO printer_organization_maps (printer_id, organization_id)
VALUES
    (1, 3),
    (2, 4);

INSERT INTO document_templates (code, name, document_type, template_version, file_path, status, created_by)
VALUES
    ('ORDER_DOC', '출고지시서', 'ORDER', 1, '/templates/order-v1', 'ACTIVE', 4),
    ('LABEL_DOC', '물류 라벨', 'LABEL', 1, '/templates/label-v1', 'ACTIVE', 4);

INSERT INTO approval_policies (
    document_type,
    min_copies,
    requires_reprint_approval,
    requires_manager_approval,
    requires_sensitive_approval,
    organization_id,
    status
)
VALUES
    ('ORDER', 1, TRUE, FALSE, FALSE, 3, 'ACTIVE'),
    ('LABEL', 50, TRUE, TRUE, FALSE, 3, 'ACTIVE'),
    ('REPORT', 1, TRUE, TRUE, TRUE, 4, 'ACTIVE');
