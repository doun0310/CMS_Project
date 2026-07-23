# CMS Printer Application API Test Scenarios

기준일: 2026-07-23

## 1. 목적

본 문서는 사내 CMS Printer Application의 핵심 API에 대한 수동 테스트 시나리오를 정의한다.

테스트 범위:

- 인쇄 요청 생성
- 재인쇄 요청
- 승인/반려 처리
- 출력 큐 적재
- Agent 작업 조회 및 상태 회신
- 관리자 CRUD

## 2. 사전 조건

- PostgreSQL DB 기동 완료
- `schema.sql`, `seed.sql` 반영 완료
- 서버 실행 가능 상태
- 테스트 헤더 사용 가능

예시 헤더:

```text
x-user-id: 1
x-role-code: ADMIN
x-organization-id: 1
```

## 3. 공통 확인 항목

- HTTP status가 기대값과 일치하는지
- `success` 필드가 기대값과 일치하는지
- DB 상태가 올바르게 반영되는지
- `audit_logs` 기록이 생성되는지

## 4. 인쇄 요청 테스트

### TC-PR-001 인쇄 요청 생성 성공

목적:
- 실무자가 정상적으로 인쇄 요청을 생성할 수 있는지 확인

요청:
- `POST /api/v1/print-requests`

예시 Body:

```json
{
  "documentType": "ORDER",
  "sourceDocumentId": "ORD-20260723-1001",
  "templateId": 1,
  "printerId": 1,
  "copies": 1,
  "isSensitive": false,
  "isUrgent": false,
  "requestReason": "출고 문서 출력"
}
```

기대 결과:

- HTTP 201
- `status = PENDING_APPROVAL`
- `approvalRoute[0].approverRoleCode = SUPERVISOR`
- `print_requests` 데이터 생성
- `approval_steps` 데이터 생성
- `audit_logs`에 `CREATE_REQUEST` 기록 생성

### TC-PR-002 민감 문서 인쇄 요청 생성

목적:
- 민감 문서 요청 시 매니저 승인으로 라우팅되는지 확인

조건:
- `isSensitive = true`

기대 결과:

- 승인자가 `MANAGER`로 지정됨

### TC-PR-003 필수값 누락

목적:
- 필수 필드 누락 시 요청이 거절되는지 확인

기대 결과:

- HTTP 400
- 오류 메시지 반환

## 5. 재인쇄 테스트

### TC-RP-001 재인쇄 요청 성공

목적:
- 기존 요청을 기반으로 재인쇄 요청을 생성할 수 있는지 확인

요청:
- `POST /api/v1/print-requests/{id}/reprint`

예시 Body:

```json
{
  "copies": 1,
  "reprintReason": "용지 훼손"
}
```

기대 결과:

- HTTP 201
- `is_reprint = true`
- `original_request_id` 연결
- `approval_steps` 생성
- `audit_logs`에 `REPRINT_REQUEST` 기록

### TC-RP-002 재인쇄 사유 누락

기대 결과:

- HTTP 400
- 재인쇄 요청 생성 실패

## 6. 승인 테스트

### TC-AP-001 승인 대기 목록 조회

목적:
- 중간 관리자 또는 매니저가 본인 역할의 승인 대기 목록을 조회할 수 있는지 확인

요청:
- `GET /api/v1/approvals/pending`

기대 결과:

- HTTP 200
- 승인 대상 목록 반환

### TC-AP-002 승인 성공

목적:
- 승인 처리 후 요청 상태가 변경되는지 확인

요청:
- `POST /api/v1/approvals/{printRequestId}/approve`

예시 Body:

```json
{
  "comment": "출력 승인"
}
```

기대 결과:

- HTTP 200
- `print_requests.status = APPROVED`
- `approved_at` 저장
- `approval_steps.decision = APPROVED`
- `audit_logs`에 `APPROVE` 기록

### TC-AP-003 반려 성공

목적:
- 반려 처리 시 반려 사유와 상태가 저장되는지 확인

기대 결과:

- `print_requests.status = REJECTED`
- `approval_steps.decision = REJECTED`
- `audit_logs`에 `REJECT` 기록

### TC-AP-004 승인 권한 없음

목적:
- 실무자가 승인 API를 호출할 수 없는지 확인

기대 결과:

- HTTP 403

## 7. 출력 작업 테스트

### TC-PJ-001 출력 작업 큐 적재 성공

목적:
- 승인 완료 요청이 출력 큐에 적재되는지 확인

요청:
- `POST /api/v1/print-jobs/{printRequestId}/dispatch`

기대 결과:

- `print_jobs` 생성
- `print_requests.status = QUEUED`
- `audit_logs`에 `DISPATCH_PRINT_JOB` 기록

### TC-PJ-002 프린터 미지정 요청 큐 적재 실패

목적:
- 프린터가 지정되지 않은 요청은 큐 적재가 실패해야 함

기대 결과:

- 오류 응답 반환

### TC-PJ-003 출력 작업 재시도

목적:
- 실패한 작업을 다시 `QUEUED` 상태로 되돌릴 수 있는지 확인

기대 결과:

- `retry_count` 증가
- `job_status = QUEUED`
- `print_requests.status = QUEUED`
- `audit_logs`에 `RETRY_PRINT_JOB` 기록

## 8. Agent 테스트

### TC-AG-001 Agent 작업 조회

목적:
- Agent가 처리 가능한 `QUEUED` 작업을 조회할 수 있는지 확인

요청:
- `POST /api/v1/agent/jobs/poll`

예시 Body:

```json
{
  "agentKey": "agent-logistics-01",
  "printerIds": [1]
}
```

기대 결과:

- `jobs` 배열 반환
- 각 작업에 `jobId`, `printRequestId`, `templatePath`, `copies` 포함

### TC-AG-002 Agent가 PRINTING 상태 회신

목적:
- 출력 시작 상태가 반영되는지 확인

요청:
- `POST /api/v1/agent/jobs/{jobId}/status`

예시 Body:

```json
{
  "jobStatus": "PRINTING"
}
```

기대 결과:

- `print_jobs.job_status = PRINTING`
- `print_requests.status = PRINTING`
- `audit_logs` 기록 생성

### TC-AG-003 Agent가 SUCCESS 상태 회신

기대 결과:

- `print_jobs.job_status = SUCCESS`
- `print_requests.status = PRINT_SUCCESS`
- `printed_at` 저장

### TC-AG-004 Agent가 FAILED 상태 회신

예시 Body:

```json
{
  "jobStatus": "FAILED",
  "failureReason": "Printer offline"
}
```

기대 결과:

- `print_jobs.job_status = FAILED`
- `print_requests.status = PRINT_FAILED`
- `failure_reason` 저장

## 9. 관리자 기능 테스트

### TC-AD-001 프린터 등록

목적:
- 관리자가 프린터를 등록할 수 있는지 확인

기대 결과:

- HTTP 201
- `printers` 데이터 생성
- `audit_logs` 기록 생성

### TC-AD-002 승인 정책 등록

기대 결과:

- `approval_policies` 데이터 생성
- `audit_logs` 기록 생성

### TC-AD-003 템플릿 등록

기대 결과:

- `document_templates` 데이터 생성
- `created_by` 저장
- `audit_logs` 기록 생성

### TC-AD-004 매니저의 타 조직 데이터 수정 시도

목적:
- 조직 범위 검증이 동작하는지 확인

기대 결과:

- 오류 응답 반환

## 10. 권장 실행 순서

1. 인쇄 요청 생성
2. 승인 처리
3. 출력 큐 적재
4. Agent poll
5. Agent status update
6. 재인쇄 요청
7. 관리자 CRUD

## 11. 후속 자동화 후보

- Postman Collection 작성
- Newman 기반 CI 테스트
- Jest + Supertest API 테스트
- DB fixture 초기화 스크립트
