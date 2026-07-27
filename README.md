# CMS Printer Application

사내 CMS와 연동되는 승인 기반 프린터 애플리케이션입니다. Express API,
PostgreSQL/Supabase 데이터베이스, React 관리자 화면으로 구성됩니다.

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

1. PostgreSQL 또는 Supabase 프로젝트 생성
2. `.env.example`를 참고해 `.env` 작성 (`DATABASE_URL` 또는 `DB_HOST`/`DB_PORT`/`DB_NAME` 설정)
3. DB 스키마 및 데이터셋 시드 자동 일괄 적용:
   ```bash
   npm run db:setup
   ```
   (또는 수동 실행 시: `db/schema.sql` ➔ `db/seed.sql` ➔ `db/seed_dataset_fixtures.sql` 순서로 실행)
4. 백엔드와 프론트엔드 의존성 설치
5. 개발 서버 실행

`db/seed.sql` 및 `db/seed_dataset_fixtures.sql`이 현재 스키마에 대응하는 공식 시드 및 데이터셋 픽스처입니다.
`seed_mock_dataset.sql` 등 기존 레거시 시드 파일은 이전 데이터 모델 기반이므로 현재 스키마에 직접 실행하지 마세요.

## 개발 명령어

```bash
npm install
npm run dev
npm test

cd frontend
npm install
npm run dev
```

## 현재 포함 범위

- Supabase/PostgreSQL DDL과 서버 연결 풀
- 역할 및 조직 범위 기반 API 접근 제어
- 승인, 반려, 재인쇄, 출력 작업 상태 관리
- 템플릿 관리 CRUD
- 감사 로그 및 조직 범위 검증
- Swagger UI
- Jest/Supertest 회귀 테스트
- React/Vite 관리자 화면

## 보안 주의사항

- 개발 환경은 기본적으로 `x-user-id`, `x-role-code`,
  `x-organization-id` 헤더 기반 모의 인증을 사용합니다.
- 운영 환경에서는 `ENABLE_MOCK_AUTH=false`로 두고 실제 SSO/JWT 인증
  미들웨어를 연결해야 합니다.
- 서버는 `pg`로 DB에 직접 연결합니다. Supabase Data API의 브라우저 역할은
  기본 DDL에서 테이블 권한이 제거되고 RLS로 차단됩니다.
- `.env.local`이 과거 커밋에 포함되어 있으므로 실제 비밀값을 사용했다면
  해당 자격 증명을 교체하고 Git 기록 정리 여부를 검토하세요.

## 다음 권장 작업

1. 운영용 SSO/JWT 인증 연결
2. 레거시 데모 픽스처를 현재 스키마로 변환
3. Print Agent 키 해시 저장 및 키 순환 정책 추가
4. 승인/출력 작업 DB 통합 테스트 환경 추가
5. 프론트엔드 컴포넌트 테스트 추가
