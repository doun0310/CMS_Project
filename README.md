# CMS Printer Application

사내 CMS와 연동되는 승인 기반 프린터 애플리케이션 초기 구성입니다.

## 목표

- 인쇄 요청 생성
- 역할 기반 승인 처리
- 실제 프린터 작업 추적
- 재인쇄 및 감사 로그 관리

## 기본 스택

- Node.js
- TypeScript
- Express
- PostgreSQL
- `pg`

## 디렉터리 구조

```text
.
├── db
│   ├── schema.sql
│   └── seed.sql
├── docs
│   └── api-overview.md
├── src
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── routes
│   ├── services
│   ├── types
│   ├── utils
│   ├── app.ts
│   └── server.ts
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json
```

## 주요 역할

- `STAFF`: 인쇄 요청 생성 및 본인 요청 조회
- `SUPERVISOR`: 팀 승인 및 반려
- `MANAGER`: 민감 문서, 대량 출력 승인
- `ADMIN`: 프린터, 정책, 템플릿, 전체 로그 관리

## 시작 순서

1. PostgreSQL 데이터베이스 생성
2. `db/schema.sql` 실행
3. `db/seed.sql` 실행
4. `.env.example`를 참고해 `.env` 작성
5. 의존성 설치 후 개발 서버 실행

## 개발 명령어

```bash
npm install
npm run dev
npm test
```

## 현재 포함 범위

- DDL 초안
- 기본 프로젝트 구조
- API 골격 라우트
- PostgreSQL 연결 골격
- 실제 SQL 기반 핵심 서비스 일부
- 템플릿 관리 CRUD
- 감사 로그 및 조직 범위 검증 일부
- Swagger UI 연동 골격
- Jest/Supertest 테스트 골격

## 다음 권장 작업

1. 실제 DB 연결 계층 추가
2. 승인 라우팅 비즈니스 로직 고도화
3. Print Agent 통신 방식 확정
4. 프론트엔드 관리자 화면 설계
5. 테스트 코드 추가
