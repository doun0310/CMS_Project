# AetherPulse

AetherPulse는 React와 TypeScript로 만든 애자일 프로젝트 관리 웹 애플리케이션입니다. Jira 같은 프로젝트 관리 도구에서 자주 쓰이는 칸반 보드, 백로그, 스프린트, 회고 기능을 한 프로젝트 안에서 구현해 보았습니다.

처음 실행하면 준비된 예시 데이터로 바로 화면을 확인할 수 있습니다. Supabase를 연결하지 않아도 기본 기능은 사용할 수 있고, 필요할 때만 로그인과 데이터 동기화 기능을 추가할 수 있도록 만들었습니다.

## 구현한 기능

- **칸반 보드와 백로그**
  - 이슈를 만들고 담당자, 우선순위, 스프린트, 라벨 등을 설정할 수 있습니다.
  - 보드에서는 카드를 드래그해서 상태를 바꿀 수 있고, 스윔레인과 WIP 제한도 확인할 수 있습니다.

- **스프린트 관리와 리포트**
  - 스프린트를 만들고 이슈를 배정하거나 완료할 수 있습니다.
  - 스프린트의 번다운 차트와 누적 흐름을 보여 주며, 간단한 리포트는 CSV로 내려받을 수 있습니다.

- **로드맵과 프로젝트 화면**
  - 이슈의 시작일과 마감일을 기준으로 로드맵을 보여 줍니다.
  - 여러 프로젝트를 전환해서 볼 수 있고, 포트폴리오와 아키텍처 화면도 함께 구성했습니다.

- **회고 기능**
  - 회고 내용을 `잘한 점`, `개선할 점`, `실행 항목`으로 나누어 작성할 수 있습니다.
  - 실행 항목은 바로 이슈로 만들어 다음 스프린트에서 관리할 수 있습니다.

- **개인 설정과 백업**
  - 한국어, 영어, 일본어, 중국어를 지원합니다.
  - 다크/라이트 테마와 강조색을 바꿀 수 있으며, 현재 데이터를 JSON으로 내보내거나 다시 불러올 수 있습니다.

## 데이터 저장 방식

기본적으로는 `src/mock/AetherData.ts`에 있는 예시 데이터로 시작합니다. 이후에 수정한 내용은 브라우저의 `localStorage`에 저장됩니다. 그래서 별도의 백엔드 설정 없이도 기능을 테스트해 볼 수 있습니다.

Supabase를 연결하면 로그인 기능을 사용할 수 있고, 이슈와 회고 항목을 Supabase에 저장할 수 있습니다. 이슈 변경 사항을 구독하는 기능도 포함되어 있습니다.

> Supabase를 연결하지 않은 상태에서는 데이터가 현재 브라우저에만 저장됩니다. 다른 기기나 브라우저에서는 같은 데이터를 볼 수 없습니다.

## AI 관련 기능

이슈 명세 제안, 스토리 포인트와 위험도 제안, 스프린트 상태 확인, 작업량 분배, 데일리 스탠드업 기능은 현재 입력된 데이터를 기준으로 계산하는 규칙 기반 기능입니다. 외부 AI 모델을 호출하지 않아도 동작합니다.

회고 분석 기능은 선택적으로 OpenAI API를 사용할 수 있습니다. Supabase Edge Function을 배포하고 API 키를 서버 시크릿으로 등록하면 회고 내용을 모델에 전달해 요약, 위험 요소, 다음 액션을 받아옵니다. 설정하지 않았거나 호출에 실패하면 브라우저에서 만든 간단한 분석 결과를 대신 보여 줍니다.

> 화면에 보이는 GitHub, Slack 등의 이름과 일부 자동화 기능은 동작 방식을 보여 주기 위한 데모입니다. 실제 외부 서비스의 웹훅이나 API를 연결하는 서버는 포함되어 있지 않습니다.

## 사용 기술

| 구분 | 기술 |
| --- | --- |
| 프런트엔드 | React 19, TypeScript, Vite |
| 상태 관리 | React Context, Custom Hooks |
| 스타일 | CSS, CSS Custom Properties |
| 백엔드(선택) | Supabase Auth, PostgreSQL, Realtime |
| 코드 검사 | TypeScript, oxlint |

## 실행 방법

Node.js와 npm이 설치되어 있다면 아래 순서로 실행할 수 있습니다.

```bash
git clone https://github.com/doun0310/CMS_Project.git
cd CMS_Project
npm install
npm run dev
```

명령어를 실행하면 Vite가 로컬 주소를 알려 줍니다. 해당 주소를 브라우저에서 열면 됩니다.

### 자주 쓰는 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 타입 검사 후 빌드
npm run lint     # 코드 검사
npm run preview  # 빌드 결과 확인
```

## Supabase 설정하기 (선택)

Supabase를 연결하려면 먼저 Supabase에서 프로젝트를 만든 뒤, 프로젝트 루트에 있는 `supabase_schema.sql` 파일을 SQL Editor에서 실행합니다.

그 다음 `.env.example` 파일을 참고해서 `.env` 파일을 만들고 아래 값을 입력합니다.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

`VITE_`로 시작하는 환경 변수는 브라우저에서 사용할 수 있는 값입니다. OpenAI API 키나 Supabase 서비스 역할 키처럼 공개하면 안 되는 값은 `.env`에 넣지 않아야 합니다.

### 회고 분석 Edge Function 설정

OpenAI를 이용한 회고 분석까지 사용하려면 Supabase CLI로 마이그레이션과 함수를 배포해야 합니다. Supabase 프로젝트 연결이 끝난 상태에서 아래 명령어를 실행합니다.

```bash
supabase db push
supabase secrets set OPENAI_API_KEY="<OpenAI API key>"
supabase secrets set OPENAI_MODEL="<사용할 모델 이름>"
supabase functions deploy analyze-retrospective
```

OpenAI API 키는 반드시 Edge Function의 서버 시크릿으로만 관리해야 합니다. 관련 설정은 [`supabase/README.md`](supabase/README.md)에 더 자세히 적어 두었습니다.

## 폴더 구조

```text
src/
├─ components/       # 화면, 공통 컴포넌트, 모달
├─ context/          # 전역 상태와 브라우저 저장 처리
├─ hooks/            # 이슈, 스프린트, 회고 관련 동작
├─ mock/             # 처음 실행할 때 쓰는 예시 데이터
├─ services/         # Supabase 연동과 분석 로직
└─ types/            # 타입 정의
supabase/
├─ functions/        # 회고 분석 Edge Function
└─ migrations/       # 회고 분석 결과 테이블 마이그레이션
supabase_schema.sql  # 기본 테이블과 RLS 정책
```

## 참고 사항

- 이 프로젝트의 예시 데이터와 분석 결과는 실제 서비스의 지표나 보안 검증을 대신하지 않습니다.
- 배포하기 전에는 `.env` 파일에 개인 키나 서버용 비밀값이 들어 있지 않은지 확인해야 합니다.
