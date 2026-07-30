# AetherPulse

AetherPulse는 팀 프로젝트의 할 일을 정리하고 스프린트를 관리할 수 있는 웹 애플리케이션입니다. React와 TypeScript로 만들었으며, 칸반 보드와 회고처럼 애자일 프로젝트에서 자주 쓰는 기능을 구현했습니다.

## 한눈에 보기

- 할 일을 만들고 담당자, 우선순위, 마감일을 설정할 수 있습니다.
- 칸반 보드에서 카드를 드래그해 `할 일 → 진행 중 → 검토 중 → 완료` 상태로 옮길 수 있습니다.
- 백로그에 있는 일을 스프린트에 넣고, 진행 상황과 리포트를 확인할 수 있습니다.
- 회고 내용을 기록하고, 필요한 항목은 다음 작업으로 만들 수 있습니다.
- 다크 모드, 언어 변경, JSON 백업과 복원을 지원합니다.

## 데이터는 어디에 저장되나요?

처음에는 예시 데이터로 실행됩니다. 별도 설정을 하지 않아도 사용할 수 있으며, 변경한 내용은 현재 브라우저에 저장됩니다.

Supabase를 연결하면 로그인과 이슈·회고 데이터 저장 기능을 사용할 수 있습니다. 연결하지 않은 경우에는 다른 브라우저나 기기에서 데이터가 공유되지 않습니다.

## AI 기능

이슈의 예상 난이도, 스프린트 상태, 작업량 분배, 데일리 스탠드업 기능은 입력된 데이터를 기준으로 계산해 주는 보조 기능입니다.

회고 분석에는 OpenAI API를 선택적으로 연결할 수 있습니다. 설정하지 않아도 간단한 로컬 분석 결과를 확인할 수 있습니다.

> GitHub, Slack 등 외부 서비스 이름이 보이는 일부 메뉴는 화면과 동작 방식을 보여 주기 위한 데모입니다. 실제 외부 서비스 연동 서버는 포함되어 있지 않습니다.

## 실행 방법

Node.js와 npm이 설치되어 있다면 아래 명령어로 실행할 수 있습니다.

```bash
git clone https://github.com/doun0310/CMS_Project.git
cd CMS_Project
npm install
npm run dev
```

실행 후 터미널에 표시된 로컬 주소를 브라우저에서 열면 됩니다.

```bash
npm run build    # 빌드
npm run lint     # 코드 검사
npm run preview  # 빌드 결과 확인
```

## 사용 기술

| 구분 | 기술 |
| --- | --- |
| 프런트엔드 | React, TypeScript, Vite |
| 상태 관리 | React Context, Custom Hooks |
| 스타일 | CSS |
| 선택적 백엔드 | Supabase |

## Supabase 연결하기 (선택)

1. Supabase에서 프로젝트를 만듭니다.
2. `supabase_schema.sql` 파일을 Supabase SQL Editor에서 실행합니다.
3. `.env.example`을 참고해 `.env` 파일을 만들고 아래 값을 입력합니다.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

OpenAI를 이용한 회고 분석까지 사용하려면 `supabase/README.md`의 Edge Function 설정 방법을 참고하세요. API 키나 서비스 역할 키처럼 민감한 값은 `.env`에 넣거나 GitHub에 올리면 안 됩니다.
