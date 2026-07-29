# ⚡ AetherPulse - Next-Gen AI-Powered Smart Agile Workspace

> **AetherPulse**는 인공지능(AI) 기반의 차세대 스마트 애자일 프로젝트 관리 워크스페이스입니다.  
> Atlassian Aether 스타일의 직관적인 디자인, AI 코파일럿, 1-Click 워크로드 자동 재배치, 애자일 회고 보드, 컴플라이언스 및 코드 거버넌스 워크벤치를 탑재하여 팀의 생산성과 협업 효율성을 극대화합니다.

---

## 🌟 핵심 역량 및 핵심 기능 (Core Capabilities)

### 🤖 1. AI 기반 스마트 코파일럿 & 분석 엔진 (AI Engineering & Analytics)
- **AI Workload Auto-Balancer**: 팀원별 업무 과부하(Story Points) 감지 및 1-Click 최적 업무 재배치.
- **AI Tech Debt & Code Governance**: Security, Performance, Testing, Code Smells 4대 부채 스캔 및 1-Click 리팩토링 태스크 생성.
- **AI Dependency Graph & Blast Radius**: 상류/하류 서비스 및 티켓 영향 범위 시각화 (Blast Radius Index).
- **AI Monte Carlo Forecaster**: 1,000회 통계 시뮬레이션을 통한 85% 고신뢰 목표 동기화.
- **SRE Post-Mortem & Auto-Triage**: 5-Whys 근본 원인 체인 분석 및 이슈 라벨/우선순위 자동 분류.

### 📋 2. 고도화된 애자일 프로젝트 관리 (Agile Project Management)
- **Interactive Kanban & Backlog**: 드래그 앤 드롭, 컬럼 접기, WIP Limit 과부하 경고 엔진.
- **Timeline Roadmap & Epic Tracking**: 에픽 마일스톤 및 Critical Path 병목 감지.
- **Sprint Retrospective & Action Kanban**: 3컬럼 회고 보드 및 회고 액션 전용 칸반 보드 (Action Execution Rate 추적).
- **Executive Portfolio View**: 다중 프로젝트 헬스 대시보드 및 전사 리소스 할당 히트맵.

### 🛡️ 3. 엔터프라이즈 거버넌스 & 컴플라이언스 (Enterprise Governance & Compliance)
- **Enterprise Regulatory Compliance Matrix**: SOC2, GDPR, ISO 27001, HIPAA 4대 보안 표준 감사 점수 측정 및 공식 감사 인증서 추출.
- **Release Go / No-Go Decision Gate**: 4대 이해관계자 서명 팩 및 프로덕션 배포 승인 워크플로우.
- **Cross-Team Skill Matrix**: 4대 분야 기술 숙련도 평가 및 최적 담당자 1-Click 배정.
- **Capacity & Holiday Calendar**: 팀 가용 용량(Net Capacity) 및 휴가/PTO 통합 관리.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 |
| :--- | :--- |
| **Core Framework** | React 19, TypeScript, Vite |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Realtime WebSockets, RLS Security) |
| **Styling** | Vanilla CSS (CSS Custom Properties & Design Tokens), Dark/Light Theme System |
| **State & Modal** | React Context API, Centralized Lazy ModalManager (`React.lazy` / `Suspense`) |
| **Data Persistence** | Supabase DB, LocalStorage API Fallback, Custom JSON Import/Export |
| **Lint & Quality** | TypeScript Compiler (`tsc -b`), React ErrorBoundary System |

---

## 🚀 빠른 시작 (Getting Started)

### 1. 의존성 설치
```bash
npm install
```

### 2. Supabase 환경변수 설정
`.env` 파일에 발급받은 Supabase 프로젝트 URL 및 Anon Key를 설정합니다:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Supabase DB 스키마 생성
프로젝트 루트의 [`supabase_schema.sql`](file:///Users/jhrsoft/Downloads/%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%20%ED%85%8C%EC%8A%A4%ED%8A%B8/supabase_schema.sql) 스크립트 내용을 복사하여 Supabase Dashboard의 **SQL Editor**에 붙여넣고 실행합니다.

### 4. 개발 서버 실행
```bash
npm run dev
```

### 5. 프로덕션 빌드 및 검증
```bash
npm run build
```
