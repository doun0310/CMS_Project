# API Overview

## Base URL

`/api/v1`

## 주요 엔드포인트

### Print Requests

- `POST /print-requests`
- `POST /print-requests/:id/reprint`
- `GET /print-requests`
- `GET /print-requests/:id`

### Approvals

- `GET /approvals/pending`
- `POST /approvals/:printRequestId/approve`
- `POST /approvals/:printRequestId/reject`

### Print Jobs

- `POST /print-jobs/:printRequestId/dispatch`
- `GET /print-jobs/:jobId`
- `POST /print-jobs/:jobId/retry`

### Agent

- `POST /agent/jobs/poll`
- `POST /agent/jobs/:jobId/status`

### Admin

- `GET /printers`
- `POST /printers`
- `PATCH /printers/:id`
- `GET /approval-policies`
- `POST /approval-policies`
- `PATCH /approval-policies/:id`
- `GET /templates`
- `POST /templates`
- `PATCH /templates/:id`

## 응답 원칙

- 성공 시 `success: true`
- 실패 시 `success: false`
- 목록 응답은 `data.items`
- 단건 응답은 `data`
