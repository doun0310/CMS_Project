-- ================================================================
-- AetherPulse RLS Security Patch
-- 적용: Supabase Dashboard → SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────────
-- [0] issue_attachments 테이블 재생성
--     이전 마이그레이션(20260804_storage_attachments.sql)에서
--     ① public. 스키마 누락
--     ② REFERENCES users(id) → 존재하지 않는 테이블 참조
--     위 두 버그로 테이블이 생성되지 않았으므로 여기서 올바르게 생성
-- ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.issue_attachments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id    uuid        NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  url         text        NOT NULL,
  size        bigint      NOT NULL,
  mime_type   text,
  uploader_id uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- RLS 활성화 (이미 활성화되어 있어도 무해)
ALTER TABLE public.issue_attachments ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────────
-- [1] issue_attachments — RLS 정책 추가 (기존에 정책 없음)
-- ────────────────────────────────────────────────────────────────

-- 프로젝트 멤버만 해당 이슈의 첨부파일 조회 가능
CREATE POLICY "members read attachments"
ON public.issue_attachments FOR SELECT
TO authenticated
USING (
  public.has_project_role(
    (SELECT project_id FROM public.issues WHERE id = issue_id),
    ARRAY['viewer', 'project_member', 'project_manager', 'project_owner']
  )
);

-- 프로젝트 멤버(viewer 제외)만 첨부파일 업로드 가능, 본인 업로더로만 삽입
CREATE POLICY "members insert attachments"
ON public.issue_attachments FOR INSERT
TO authenticated
WITH CHECK (
  uploader_id = auth.uid()
  AND public.has_project_role(
    (SELECT project_id FROM public.issues WHERE id = issue_id),
    ARRAY['project_member', 'project_manager', 'project_owner']
  )
);

-- 본인이 업로드한 파일만 삭제 가능
CREATE POLICY "members delete own attachments"
ON public.issue_attachments FOR DELETE
TO authenticated
USING (uploader_id = auth.uid());

-- ────────────────────────────────────────────────────────────────
-- [2] storage.objects — 파일 소유자 검증 강화
--     기존 정책: authenticated이면 누구나 수정/삭제 가능
--     변경 후:  파일 경로 첫 세그먼트(user_id)가 본인인 경우만 허용
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Allow authenticated users to upload issue attachments"
  ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update issue attachments"
  ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete issue attachments"
  ON storage.objects;

-- 업로드: 경로가 자신의 uid로 시작하는 경우만 허용 (예: {uid}/filename)
CREATE POLICY "Authenticated users upload own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'issue-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 수정: 본인 소유 파일만
CREATE POLICY "Authenticated users update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'issue-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 삭제: 본인 소유 파일만
CREATE POLICY "Authenticated users delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'issue-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ────────────────────────────────────────────────────────────────
-- [3] profiles — 전체 공개 정책 → 로그인한 사용자만 조회
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

CREATE POLICY "profiles_select"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- ────────────────────────────────────────────────────────────────
-- [4] notifications — INSERT를 인증된 사용자로 제한
--     (public.notifications 테이블이 없을 수 있으므로 IF EXISTS 처리)
-- ────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
  ) THEN
    DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;

    CREATE POLICY "notifications_insert"
    ON public.notifications FOR INSERT
    TO authenticated
    WITH CHECK (true); -- 인증된 사용자로 제한만 하려면 auth.role() 조건은 불필요
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────
-- [5] epics — FOR ALL 정책 제거 후 역할별 세분화
--     기존: viewer도 수정 가능 (FOR ALL + 멤버 여부만 확인)
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "epics_modify" ON public.epics;

CREATE POLICY "members modify epics"
ON public.epics FOR INSERT
TO authenticated
WITH CHECK (
  public.has_project_role(project_id,
    ARRAY['project_member', 'project_manager', 'project_owner'])
);

CREATE POLICY "members update epics"
ON public.epics FOR UPDATE
TO authenticated
USING (
  public.has_project_role(project_id,
    ARRAY['project_member', 'project_manager', 'project_owner'])
);

CREATE POLICY "managers delete epics"
ON public.epics FOR DELETE
TO authenticated
USING (
  public.has_project_role(project_id,
    ARRAY['project_manager', 'project_owner'])
);

-- ────────────────────────────────────────────────────────────────
-- [6] sprints — FOR ALL 정책 제거 후 역할별 세분화
-- ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "sprints_modify" ON public.sprints;

CREATE POLICY "members modify sprints"
ON public.sprints FOR INSERT
TO authenticated
WITH CHECK (
  public.has_project_role(project_id,
    ARRAY['project_member', 'project_manager', 'project_owner'])
);

CREATE POLICY "members update sprints"
ON public.sprints FOR UPDATE
TO authenticated
USING (
  public.has_project_role(project_id,
    ARRAY['project_member', 'project_manager', 'project_owner'])
);

CREATE POLICY "managers delete sprints"
ON public.sprints FOR DELETE
TO authenticated
USING (
  public.has_project_role(project_id,
    ARRAY['project_manager', 'project_owner'])
);

-- ────────────────────────────────────────────────────────────────
-- [7] workflow_states — FOR ALL 정책 제거 후 역할별 세분화
-- ────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'workflow_states'
  ) THEN

    DROP POLICY IF EXISTS "workflow_states_modify" ON public.workflow_states;

    CREATE POLICY "managers modify workflow states"
    ON public.workflow_states FOR INSERT
    TO authenticated
    WITH CHECK (
      public.has_project_role(project_id,
        ARRAY['project_manager', 'project_owner'])
    );

    CREATE POLICY "managers update workflow states"
    ON public.workflow_states FOR UPDATE
    TO authenticated
    USING (
      public.has_project_role(project_id,
        ARRAY['project_manager', 'project_owner'])
    );

    CREATE POLICY "managers delete workflow states"
    ON public.workflow_states FOR DELETE
    TO authenticated
    USING (
      public.has_project_role(project_id,
        ARRAY['project_manager', 'project_owner'])
    );

  END IF;
END $$;