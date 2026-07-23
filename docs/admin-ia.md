# Admin IA

기준일: 2026-07-23

## 1. 목적

본 문서는 관리자 화면의 정보 구조를 정의한다.

대상:

- 중간 관리자
- 매니저
- 시스템 관리자

## 2. 상위 메뉴 구조

```text
Dashboard
Requests
Approvals
Print Jobs
Printers
Policies
Templates
Audit Logs
Settings
```

## 3. 메뉴별 상세

### Dashboard

목적:
- 현재 출력 운영 현황 요약 확인

하위 정보:

- 오늘의 인쇄 요청 수
- 승인 대기 건수
- 출력 실패 건수
- 재인쇄 요청 건수

### Requests

목적:
- 인쇄 요청 조회 및 상세 확인

하위 화면:

- 요청 목록
- 요청 상세
- 재인쇄 요청 이력

### Approvals

목적:
- 승인 대기 및 처리 이력 확인

하위 화면:

- 승인 대기 목록
- 승인 상세
- 반려 이력

### Print Jobs

목적:
- 실제 출력 작업 상태 확인

하위 화면:

- 작업 목록
- 작업 상세
- 실패/재시도 내역

### Printers

목적:
- 프린터 등록 및 운영 관리

하위 화면:

- 프린터 목록
- 프린터 등록
- 프린터 상세/수정
- 조직 매핑 관리

### Policies

목적:
- 문서 유형별 승인 규칙 관리

하위 화면:

- 정책 목록
- 정책 등록
- 정책 수정

### Templates

목적:
- 문서 템플릿 및 버전 관리

하위 화면:

- 템플릿 목록
- 템플릿 등록
- 템플릿 수정
- 버전 이력

### Audit Logs

목적:
- 주요 행위 및 상태 변경 이력 조회

하위 화면:

- 로그 목록
- 로그 상세

### Settings

목적:
- 향후 공통 환경설정 확장

후보 항목:

- 상태 코드 관리
- 알림 정책
- 공통 분류 코드

## 4. 역할별 접근 가이드

### 중간 관리자

- Dashboard
- Requests
- Approvals
- Print Jobs

### 매니저

- Dashboard
- Requests
- Approvals
- Print Jobs
- Printers
- Policies
- Templates

### 시스템 관리자

- 전체 메뉴 접근 가능

## 5. 우선 구현 메뉴

MVP 기준 우선순위:

1. Approvals
2. Requests
3. Print Jobs
4. Printers
5. Policies
6. Templates
7. Audit Logs

## 6. 설계 포인트

- 목록 중심 구조로 시작하고 상세는 우측 패널 또는 별도 페이지로 확장 가능하게 설계
- 관리 기능은 데스크톱 우선
- 실패 작업과 민감 문서는 강조 표시
- 재인쇄와 원본 요청은 상호 이동 가능하게 설계
