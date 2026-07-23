# CMS Printer Application Detailed API Specification

기준일: 2026-07-23

## 1. 공통 규칙

### Base URL

`/api/v1`

### 공통 응답 형식

성공:

```json
{
  "success": true,
  "data": {}
}
```

실패:

```json
{
  "success": false,
  "code": "BAD_REQUEST",
  "message": "Error message",
  "details": null
}
```

### 테스트용 헤더

현재 개발 단계에서는 아래 헤더로 사용자 컨텍스트를 주입한다.

```text
x-user-id
x-role-code
x-organization-id
```

## 2. Print Requests

### POST /print-requests

설명:
- 인쇄 요청 생성

권한:
- `STAFF`
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

Request Body:

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

Response:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "requestNo": "PR-1721721721721",
    "status": "PENDING_APPROVAL",
    "approvalRoute": [
      {
        "stepNo": 1,
        "approverRoleCode": "SUPERVISOR",
        "decision": "PENDING"
      }
    ]
  }
}
```

### GET /print-requests

설명:
- 현재 사용자 조직 기준 인쇄 요청 목록 조회

권한:
- 전체 역할

### GET /print-requests/:id

설명:
- 인쇄 요청 상세 조회

권한:
- 전체 역할

### POST /print-requests/:id/reprint

설명:
- 재인쇄 요청 생성

권한:
- 전체 역할

Request Body:

```json
{
  "copies": 1,
  "reprintReason": "용지 훼손"
}
```

## 3. Approvals

### GET /approvals/pending

설명:
- 현재 승인자 역할 기준 대기 목록 조회

권한:
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

### POST /approvals/:printRequestId/approve

설명:
- 승인 처리

권한:
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

Request Body:

```json
{
  "comment": "출력 승인"
}
```

### POST /approvals/:printRequestId/reject

설명:
- 반려 처리

권한:
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

Request Body:

```json
{
  "reason": "부수 과다, 사유 확인 필요"
}
```

## 4. Print Jobs

### POST /print-jobs/:printRequestId/dispatch

설명:
- 승인 완료 건을 출력 큐에 적재

권한:
- `MANAGER`
- `ADMIN`

### GET /print-jobs/:jobId

설명:
- 출력 작업 상태 조회

권한:
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

### POST /print-jobs/:jobId/retry

설명:
- 실패 작업 재시도

권한:
- `SUPERVISOR`
- `MANAGER`
- `ADMIN`

Request Body:

```json
{
  "reason": "용지 보충 후 재시도"
}
```

## 5. Agent

### POST /agent/jobs/poll

설명:
- Agent가 출력 대기 작업 조회

권한:
- 내부 Agent

Request Body:

```json
{
  "agentKey": "agent-logistics-01",
  "printerIds": [1]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "jobId": 1,
        "printRequestId": 10,
        "documentType": "ORDER",
        "templatePath": "/templates/order-v1",
        "payload": {
          "sourceDocumentId": "ORD-20260723-1001"
        },
        "copies": 1
      }
    ]
  }
}
```

### POST /agent/jobs/:jobId/status

설명:
- Agent가 출력 상태 회신

Request Body:

```json
{
  "jobStatus": "SUCCESS",
  "failureReason": null
}
```

허용 상태:

- `PRINTING`
- `SUCCESS`
- `FAILED`

## 6. Admin - Printers

### GET /printers

설명:
- 프린터 목록 조회

권한:
- `MANAGER`
- `ADMIN`

### POST /printers

설명:
- 프린터 등록

권한:
- `ADMIN`

Request Body:

```json
{
  "code": "PRT-LOG-02",
  "name": "물류 라벨 프린터 2",
  "printerType": "LABEL",
  "connectionType": "NETWORK",
  "ipAddress": "192.168.0.32",
  "agentKey": "agent-logistics-01",
  "organizationId": 3,
  "location": "물류창고 B구역",
  "status": "ACTIVE"
}
```

### PATCH /printers/:id

설명:
- 프린터 정보 수정

권한:
- `ADMIN`

## 7. Admin - Approval Policies

### GET /approval-policies

설명:
- 승인 정책 목록 조회

권한:
- `MANAGER`
- `ADMIN`

### POST /approval-policies

설명:
- 승인 정책 등록

권한:
- `ADMIN`

Request Body:

```json
{
  "documentType": "LABEL",
  "minCopies": 50,
  "requiresReprintApproval": true,
  "requiresManagerApproval": true,
  "requiresSensitiveApproval": false,
  "organizationId": 3,
  "status": "ACTIVE"
}
```

### PATCH /approval-policies/:id

설명:
- 승인 정책 수정

권한:
- `ADMIN`

## 8. Admin - Templates

### GET /templates

설명:
- 템플릿 목록 조회

권한:
- `MANAGER`
- `ADMIN`

### POST /templates

설명:
- 템플릿 등록

권한:
- `ADMIN`

Request Body:

```json
{
  "code": "ORDER_DOC",
  "name": "출고지시서 v2",
  "documentType": "ORDER",
  "templateVersion": 2,
  "filePath": "/templates/order-v2",
  "status": "ACTIVE"
}
```

### PATCH /templates/:id

설명:
- 템플릿 수정

권한:
- `ADMIN`

## 9. 에러 케이스 예시

- 필수값 누락: `400`
- 권한 없음: `403`
- 대상 없음: `404`
- 조직 범위 위반: `403`
- 잘못된 상태값: `400`

## 10. 향후 보완 항목

- Swagger/OpenAPI 문서화
- 응답 DTO 표준화
- 페이지네이션 쿼리 파라미터 추가
- 필터링 파라미터 추가
- `404`, `409`, `422` 등 세분화된 에러 코드 도입

## 11. 참고 파일

- [docs/api-overview.md](/Users/jhrsoft/Downloads/프로젝트%20테스트/docs/api-overview.md)
- [docs/api-test-scenarios.md](/Users/jhrsoft/Downloads/프로젝트%20테스트/docs/api-test-scenarios.md)
