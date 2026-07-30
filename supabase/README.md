# AI 회고 분석 배포

이 기능은 브라우저가 아닌 Supabase Edge Function에서 OpenAI API를 호출합니다. API 키를 `VITE_` 환경 변수나 클라이언트 코드에 넣지 마세요.

## 1. 데이터베이스 반영

```bash
supabase db push
```

`migrations/202607300001_retrospective_sentiment_reports.sql`이 분석 결과 테이블과 인덱스를 만듭니다.

## 2. 서버 시크릿 등록 및 함수 배포

```bash
supabase secrets set OPENAI_API_KEY="<OpenAI API key>"
supabase secrets set OPENAI_MODEL="gpt-5.6-luna"
supabase functions deploy analyze-retrospective
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`는 Edge Function 런타임이 제공합니다. 서비스 역할 키는 절대로 프런트엔드에 넣지 마세요.

## 3. 앱 환경 변수와 로그인

앱에는 기존과 같이 다음 공개 연결 정보만 설정합니다.

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

분석 함수는 호출자의 Supabase 로그인 세션을 확인합니다. 따라서 팀원이 로그인한 상태여야 분석 실행이 가능하며, 분석 결과는 생성한 사용자별로 보관됩니다. 프로젝트 멤버십 테이블을 운영 중이라면 Edge Function에 멤버십 검증을 추가한 뒤 팀 공용 결과로 확장할 수 있습니다.

## 데이터 처리 원칙

- 회고 항목과 댓글은 항목당 길이·개수 제한 후에만 모델로 전송합니다.
- OpenAI Responses 요청은 `store: false`로 호출합니다.
- 분석 결과에는 개인 평가나 민감 특성 추론을 포함하지 않도록 프롬프트를 제한합니다.
