-- CMS Printer Application
-- PostgreSQL DDL
-- Date: 2026-07-23

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organizations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id BIGINT REFERENCES organizations(id),
    org_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_organizations_type
        CHECK (org_type IN ('COMPANY', 'DIVISION', 'TEAM')),
    CONSTRAINT chk_organizations_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    login_id VARCHAR(60) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    role_id BIGINT NOT NULL REFERENCES roles(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_users_status
        CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED'))
);

CREATE TABLE printers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    printer_type VARCHAR(20) NOT NULL,
    connection_type VARCHAR(20) NOT NULL,
    ip_address INET,
    agent_key VARCHAR(100),
    organization_id BIGINT REFERENCES organizations(id),
    location VARCHAR(200),
    status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',
    black_toner_level INTEGER,
    paper_level INTEGER,
    last_checked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_printers_type
        CHECK (
            printer_type IN (
                'A4',
                'LABEL',
                'BARCODE',
                'RECEIPT',
                'COLOR_LASER',
                'MONO_LASER',
                'COLOR_INKJET'
            )
        ),
    CONSTRAINT chk_printers_connection
        CHECK (
            connection_type IN (
                'NETWORK',
                'USB',
                'SERVER_QUEUE',
                'NETWORK_SNMP',
                'AGENT_DIRECT'
            )
        ),
    CONSTRAINT chk_printers_status
        CHECK (
            status IN (
                'ACTIVE',
                'INACTIVE',
                'MAINTENANCE',
                'ONLINE',
                'OFFLINE',
                'LOW_TONER',
                'ERROR',
                'PRINTING'
            )
        ),
    CONSTRAINT chk_printers_black_toner_level
        CHECK (black_toner_level IS NULL OR black_toner_level BETWEEN 0 AND 100),
    CONSTRAINT chk_printers_paper_level
        CHECK (paper_level IS NULL OR paper_level BETWEEN 0 AND 100)
);

CREATE TABLE document_templates (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    document_type VARCHAR(30) NOT NULL,
    template_version INTEGER NOT NULL DEFAULT 1,
    file_path VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_document_templates UNIQUE (code, template_version),
    CONSTRAINT chk_document_templates_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE approval_policies (
    id BIGSERIAL PRIMARY KEY,
    document_type VARCHAR(30) NOT NULL,
    min_copies INTEGER NOT NULL DEFAULT 1,
    requires_reprint_approval BOOLEAN NOT NULL DEFAULT TRUE,
    requires_manager_approval BOOLEAN NOT NULL DEFAULT FALSE,
    requires_sensitive_approval BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_approval_policies_min_copies
        CHECK (min_copies > 0),
    CONSTRAINT chk_approval_policies_status
        CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

CREATE TABLE print_requests (
    id BIGSERIAL PRIMARY KEY,
    request_no VARCHAR(40) NOT NULL UNIQUE,
    document_type VARCHAR(30) NOT NULL,
    source_document_id VARCHAR(100) NOT NULL,
    requester_id BIGINT NOT NULL REFERENCES users(id),
    requester_organization_id BIGINT NOT NULL REFERENCES organizations(id),
    template_id BIGINT NOT NULL REFERENCES document_templates(id),
    printer_id BIGINT REFERENCES printers(id),
    copies INTEGER NOT NULL,
    is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
    is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
    is_reprint BOOLEAN NOT NULL DEFAULT FALSE,
    original_request_id BIGINT REFERENCES print_requests(id),
    request_reason VARCHAR(300),
    reprint_reason VARCHAR(300),
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    printed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_print_requests_copies
        CHECK (copies > 0),
    CONSTRAINT chk_print_requests_status
        CHECK (
            status IN (
                'DRAFT',
                'REQUESTED',
                'PENDING_APPROVAL',
                'APPROVED',
                'REJECTED',
                'QUEUED',
                'PRINTING',
                'PRINT_SUCCESS',
                'PRINT_FAILED',
                'CANCELLED'
            )
        ),
    CONSTRAINT chk_print_requests_reprint_reason
        CHECK (
            (is_reprint = FALSE)
            OR (is_reprint = TRUE AND reprint_reason IS NOT NULL)
        )
);

CREATE TABLE approval_steps (
    id BIGSERIAL PRIMARY KEY,
    print_request_id BIGINT NOT NULL REFERENCES print_requests(id) ON DELETE CASCADE,
    step_no INTEGER NOT NULL,
    approver_role_code VARCHAR(30) NOT NULL,
    approver_id BIGINT REFERENCES users(id),
    decision VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    decision_reason VARCHAR(300),
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_approval_steps UNIQUE (print_request_id, step_no),
    CONSTRAINT chk_approval_steps_no
        CHECK (step_no > 0),
    CONSTRAINT chk_approval_steps_decision
        CHECK (decision IN ('PENDING', 'APPROVED', 'REJECTED', 'SKIPPED'))
);

CREATE TABLE print_jobs (
    id BIGSERIAL PRIMARY KEY,
    print_request_id BIGINT NOT NULL REFERENCES print_requests(id) ON DELETE CASCADE,
    printer_id BIGINT NOT NULL REFERENCES printers(id),
    agent_key VARCHAR(100),
    job_status VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    retry_count INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    failure_reason VARCHAR(300),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_print_jobs_retry_count
        CHECK (retry_count >= 0),
    CONSTRAINT chk_print_jobs_status
        CHECK (job_status IN ('QUEUED', 'PRINTING', 'SUCCESS', 'FAILED'))
);

CREATE TABLE printer_organization_maps (
    id BIGSERIAL PRIMARY KEY,
    printer_id BIGINT NOT NULL REFERENCES printers(id) ON DELETE CASCADE,
    organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_printer_organization_maps UNIQUE (printer_id, organization_id)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_id BIGINT REFERENCES users(id),
    action_type VARCHAR(40) NOT NULL,
    target_type VARCHAR(40) NOT NULL,
    target_id BIGINT NOT NULL,
    detail_json JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_organization_id ON users (organization_id);
CREATE INDEX idx_users_role_id ON users (role_id);
CREATE INDEX idx_organizations_parent_id ON organizations (parent_id);

CREATE INDEX idx_printers_organization_id ON printers (organization_id);
CREATE INDEX idx_printers_agent_key ON printers (agent_key);

CREATE INDEX idx_document_templates_document_type ON document_templates (document_type);
CREATE INDEX idx_document_templates_created_by ON document_templates (created_by);
CREATE INDEX idx_approval_policies_document_type ON approval_policies (document_type);
CREATE INDEX idx_approval_policies_organization_id ON approval_policies (organization_id);

CREATE INDEX idx_print_requests_requester_id ON print_requests (requester_id);
CREATE INDEX idx_print_requests_requester_org_id ON print_requests (requester_organization_id);
CREATE INDEX idx_print_requests_printer_id ON print_requests (printer_id);
CREATE INDEX idx_print_requests_status ON print_requests (status);
CREATE INDEX idx_print_requests_document_type ON print_requests (document_type);
CREATE INDEX idx_print_requests_requested_at ON print_requests (requested_at);
CREATE INDEX idx_print_requests_original_request_id ON print_requests (original_request_id);

CREATE INDEX idx_approval_steps_request_id ON approval_steps (print_request_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps (approver_id);
CREATE INDEX idx_approval_steps_decision ON approval_steps (decision);

CREATE INDEX idx_print_jobs_request_id ON print_jobs (print_request_id);
CREATE INDEX idx_print_jobs_printer_id ON print_jobs (printer_id);
CREATE INDEX idx_print_jobs_status ON print_jobs (job_status);
CREATE INDEX idx_print_jobs_queued_created_at
    ON print_jobs (created_at)
    WHERE job_status = 'QUEUED';

CREATE INDEX idx_printer_organization_maps_organization_id
    ON printer_organization_maps (organization_id);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs (actor_id);
CREATE INDEX idx_audit_logs_target ON audit_logs (target_type, target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);

-- Supabase exposes the public schema through the Data API by default.
-- This application uses the server-side pg connection, so browser roles receive
-- no direct table access. Add explicit policies later if Data API access is introduced.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE printer_organization_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
        REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
        REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
    END IF;
END
$$;

INSERT INTO roles (code, name, description)
VALUES
    ('STAFF', '실무자', '인쇄 요청 생성 및 본인 요청 조회'),
    ('SUPERVISOR', '중간 관리자', '팀 단위 승인 및 반려'),
    ('MANAGER', '매니저', '부서 단위 승인 및 예외 승인'),
    ('ADMIN', '시스템 관리자', '전체 정책 및 시스템 관리');
