# CMS Printer Application ERD Specification

기준일: 2026-07-23

## 1. 목적

본 문서는 CMS Printer Application의 데이터 구조와 엔티티 관계를 설명한다.

## 2. 핵심 엔티티

- organizations
- roles
- users
- printers
- printer_organization_maps
- document_templates
- approval_policies
- print_requests
- approval_steps
- print_jobs
- audit_logs

## 3. 엔티티 설명

### organizations

조직 구조를 저장한다.

주요 컬럼:

- `id`
- `name`
- `parent_id`
- `org_type`
- `status`

설명:

- 회사, 본부, 팀 같은 계층 구조를 표현한다.
- `parent_id`로 상위 조직과 연결된다.

### roles

사용자 역할 정의 테이블이다.

주요 컬럼:

- `id`
- `code`
- `name`
- `description`

역할 예시:

- `STAFF`
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

### users

시스템 사용자 정보를 저장한다.

주요 컬럼:

- `id`
- `login_id`
- `name`
- `email`
- `organization_id`
- `role_id`
- `status`

### printers

출력 장치 정보를 저장한다.

주요 컬럼:

- `id`
- `code`
- `name`
- `printer_type`
- `connection_type`
- `ip_address`
- `agent_key`
- `organization_id`
- `location`
- `status`

### printer_organization_maps

프린터와 사용 가능 조직 간 매핑을 저장한다.

주요 컬럼:

- `id`
- `printer_id`
- `organization_id`

설명:

- 하나의 프린터를 여러 조직이 사용할 수 있게 확장하기 위한 테이블이다.

### document_templates

문서 템플릿 메타데이터를 저장한다.

주요 컬럼:

- `id`
- `code`
- `name`
- `document_type`
- `template_version`
- `file_path`
- `status`
- `created_by`

### approval_policies

문서 유형별 승인 정책을 정의한다.

주요 컬럼:

- `id`
- `document_type`
- `min_copies`
- `requires_reprint_approval`
- `requires_manager_approval`
- `requires_sensitive_approval`
- `organization_id`
- `status`

### print_requests

인쇄 요청의 중심 엔티티다.

주요 컬럼:

- `id`
- `request_no`
- `document_type`
- `source_document_id`
- `requester_id`
- `requester_organization_id`
- `template_id`
- `printer_id`
- `copies`
- `is_sensitive`
- `is_urgent`
- `is_reprint`
- `original_request_id`
- `request_reason`
- `reprint_reason`
- `status`
- `requested_at`
- `approved_at`
- `rejected_at`
- `printed_at`

설명:

- 일반 요청과 재인쇄 요청을 모두 표현한다.
- 재인쇄 요청은 `original_request_id`로 원본 요청과 연결된다.

### approval_steps

승인 단계를 저장한다.

주요 컬럼:

- `id`
- `print_request_id`
- `step_no`
- `approver_role_code`
- `approver_id`
- `decision`
- `decision_reason`
- `decided_at`

설명:

- 단일 승인뿐 아니라 다단계 승인으로 확장 가능한 구조다.

### print_jobs

실제 출력 처리 단위를 저장한다.

주요 컬럼:

- `id`
- `print_request_id`
- `printer_id`
- `agent_key`
- `job_status`
- `retry_count`
- `started_at`
- `finished_at`
- `failure_reason`

설명:

- 한 건의 인쇄 요청이 하나 이상의 출력 작업으로 확장될 수 있다.

### audit_logs

감사 이력을 저장한다.

주요 컬럼:

- `id`
- `actor_id`
- `action_type`
- `target_type`
- `target_id`
- `detail_json`
- `created_at`

설명:

- 요청 생성, 승인, 반려, 정책 변경, 출력 상태 회신 등을 모두 기록한다.

## 4. 관계 요약

### 조직 및 사용자

- `organizations` 1 : N `users`
- `roles` 1 : N `users`

### 프린터 및 조직

- `organizations` 1 : N `printers`
- `printers` N : M `organizations` via `printer_organization_maps`

### 템플릿 및 정책

- `users` 1 : N `document_templates`
- `organizations` 1 : N `approval_policies`

### 인쇄 요청

- `users` 1 : N `print_requests`
- `organizations` 1 : N `print_requests`
- `document_templates` 1 : N `print_requests`
- `printers` 1 : N `print_requests`
- `print_requests` 1 : N `approval_steps`
- `print_requests` 1 : N `print_jobs`
- `print_requests` self reference via `original_request_id`

### 감사 로그

- `users` 1 : N `audit_logs`

## 5. ERD 텍스트 다이어그램

```text
organizations
  ├─< users >─ roles
  ├─< printers
  ├─< approval_policies
  └─< print_requests

printers
  └─< printer_organization_maps >─ organizations

users
  ├─< print_requests
  ├─< document_templates
  └─< audit_logs

document_templates
  └─< print_requests

print_requests
  ├─< approval_steps
  ├─< print_jobs
  └─< print_requests (reprint relation)
```

## 6. 상태값 기준

### print_requests.status

- `DRAFT`
- `REQUESTED`
- `PENDING_APPROVAL`
- `APPROVED`
- `REJECTED`
- `QUEUED`
- `PRINTING`
- `PRINT_SUCCESS`
- `PRINT_FAILED`
- `CANCELLED`

### approval_steps.decision

- `PENDING`
- `APPROVED`
- `REJECTED`
- `SKIPPED`

### print_jobs.job_status

- `QUEUED`
- `PRINTING`
- `SUCCESS`
- `FAILED`

## 7. 설계 포인트

- `print_requests`와 `print_jobs`를 분리해 업무 요청과 실제 출력 처리를 구분했다.
- `approval_steps`를 분리해 승인 규칙 확장 가능성을 확보했다.
- `audit_logs.detail_json`으로 유연한 감사 정보 저장이 가능하다.
- `printer_organization_maps`로 조직별 프린터 접근 정책을 확장할 수 있다.

## 8. 참고 파일

- [db/schema.sql](/Users/jhrsoft/Downloads/프로젝트%20테스트/db/schema.sql)
- [db/seed.sql](/Users/jhrsoft/Downloads/프로젝트%20테스트/db/seed.sql)
