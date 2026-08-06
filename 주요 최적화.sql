-- React Lazy & Suspense 최적화 활용 (해결)
    -- 사용자가 처음 진입 시 모든 뷰의 코드들을 다 다운로드 하지 않도록 주요 뷰를 제외한 나머지 뷰들은 Lazy Loading을 통해 필요할 때만 다운로드하도록 구현
    -- Heavy 라이브러리와 분리 및 특정 탭에서만 쓰이는 라이브러리가 초기 index 번들에 포함되지 않도록 처리

-- 네트워크 요청 병렬 처리 및 캐싱
    -- 데이터 병렬 조회(예: Promise.all) 및 캐싱 전략 적용[서로 독립된 데이터는 동시에 요청하여 응답 속도 향상]
    -- HTTP 캐싱 전략 적용(ETag, Cache-Control 등) 및 SWR, React Query와 같은 라이브러리 활용

-- Supabase DB 쿼리 최적화 (해결)
    -- 쿼리 최적화 및 인덱스 활용 (예: 필요한 컬럼만 조회, 불필요한 JOIN 제거, 인덱스 추가 등)
    -- 쿼리 결과 캐싱 및 데이터 페이징 처리 (예: limit, offset, cursor 기반 페이징 등)

-- UI/UX 측면의 즉각적 체감 성능 향상 (해결)
    -- 낙관적 업데이트 (Optimistic UI) 적용: 사용자가 데이터를 변경했을 때 서버 응답을 기다리지 않고 즉시 UI를 업데이트하여 체감 성능 향상 [실패 시 복구]
    -- Skeleton Loader 및 Placeholder 활용: 데이터 로딩 중에도 사용자에게 즉각적인 피드백 제공하여 체감 성능 향상

-- 정적 자원 및 빌드 최적화
    -- 이미지 최적화: WebP, AVIF 등 최신 포맷 사용 및 적절한 해상도 제공
    -- 코드 스플리팅(Code Splitting) 및 트리 쉐이킹(Tree Shaking) 적용: 불필요한 코드 제거 및 번들 크기 최소화
    -- 빌드 시 압축 및 난독화 적용: gzip, Brotli 등 압축 알고리즘 활용

-- 불필요한 리렌더링 차단 (해결)
    -- React.memo, useMemo, useCallback 등 활용하여 불필요한 리렌더링 방지
    -- 상태 관리 최적화: Redux, Zustand 등 상태 관리 라이브러리 사용 시 불필요한 상태 업데이트 최소화
    -- 전역 State 분리 및 최소화: 전역 상태를 최소화하고, 필요한 경우에만 상태를 업데이트하도록 설계

-- 가상화 도입 (해결)
    -- 긴 리스트나 테이블 렌더링 시 react-window, react-virtualized 등 가상화 라이브러리 활용하여 렌더링 성능 향상
    -- 필요 없는 DOM 요소를 렌더링하지 않도록 하여 메모리 사용량 및 렌더링 속도 최적화 (예: Infinite Scroll, Lazy Load 이미지 등) [react-window, react-virtualized, react-infinite-scroller 등 활용]

-- DOM 구조 및 레이아웃 최적화
    -- 불필요한 DOM 요소 제거 및 구조 단순화: 렌더링 성능 향상 및 메모리 사용량 최소화
    -- CSS 최적화: 불필요한 스타일 제거, CSS-in-JS 사용 시 스타일 캐싱 및 중복 제거, transition 및 animation 최적화 (예: transform, opacity 등 GPU 가속 속성 활용)
    -- 레이아웃 변경 최소화: 레이아웃 변경이 발생할 때 reflow/repaint 최소화 (예: position, display 속성 변경 최소화)
    -- content-visibility 속성 활용: 렌더링 성능 향상 및 메모리 사용량 최소화 (예: content-visibility: auto;)
    -- will-change 속성 활용: 브라우저에게 어떤 속성이 변경될지 미리 알려주어 렌더링 성능 향상 (예: will-change: transform;)

-- 고비용 작업의 메인 스레드 분리
    -- Web Worker 활용: 고비용 작업을 메인 스레드에서 분리하여 UI 응답성 향상 (예: 데이터 처리, 이미지 처리 등)
    -- HTML5 Native Drag & Drop API 활용: 브라우저 기본 드래그 앤 드롭 기능을 활용하여 UI 응답성 향상 및 불필요한 라이브러리 제거
    -- @hello-pangea/dnd, dnd-kit 등 라이브러리 활용: 고성능 드래그 앤 드롭 기능 제공 및 UI 응답성 향상
    -- requestIdleCallback 활용: 브라우저가 유휴 상태일 때 작업 수행하여 UI 응답성 향상
