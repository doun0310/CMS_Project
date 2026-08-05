-- ========================================================
-- AetherPulse Supabase PostgreSQL Database Schema DDL
-- Paste this script into your Supabase Dashboard -> SQL Editor
-- ========================================================

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'Developer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  avatar TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project Members (Junction Table)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'Member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 4. Epics Table
CREATE TABLE IF NOT EXISTS public.epics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  summary TEXT,
  color TEXT DEFAULT '#6366F1',
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sprints Table
CREATE TABLE IF NOT EXISTS public.sprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Issues Table
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE SET NULL,
  epic_id UUID REFERENCES public.epics(id) ON DELETE SET NULL,
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  key TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'task' CHECK (type IN ('feature', 'story', 'workitem', 'task', 'bug', 'initiative', 'epic', 'subtask')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'in_review', 'done')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('lowest', 'low', 'medium', 'high', 'highest')),
  component TEXT DEFAULT 'Core Framework',
  story_points INT DEFAULT 1,
  original_estimate_hours NUMERIC DEFAULT 8,
  logged_hours NUMERIC DEFAULT 0,
  labels TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Retrospective Items Table
CREATE TABLE IF NOT EXISTS public.retrospective_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL CHECK (category IN ('good', 'improve', 'action')),
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
  assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  voter_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.retrospective_items
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS comments JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS voter_ids JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 9. GitHub Integration & CI/CD Linkage Columns
ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS github_branch TEXT,
ADD COLUMN IF NOT EXISTS linked_prs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS linked_commits JSONB DEFAULT '[]'::jsonb;

-- 10. Real-time Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('mention', 'assigned', 'comment', 'status_change', 'github_event')),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Workflow States Table
CREATE TABLE IF NOT EXISTS public.workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('todo', 'in_progress', 'done')),
  color TEXT DEFAULT '#6366F1',
  position INT DEFAULT 0
);

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retrospective_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- =============================================
-- Row Level Security Policies (Production-Grade)
-- =============================================

-- Enable RLS on remaining tables
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;

-- ---- Profiles ----
-- Anyone can read profiles; users can only modify their own.
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ---- Projects ----
-- Members and owners can read; only owners can modify.
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (
  owner_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = id AND pm.user_id = auth.uid())
);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (owner_id = auth.uid());

-- ---- Project Members ----
-- Members can read membership; owners manage membership.
CREATE POLICY "project_members_select" ON public.project_members FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);
CREATE POLICY "project_members_insert" ON public.project_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);
CREATE POLICY "project_members_delete" ON public.project_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.owner_id = auth.uid())
);

-- ---- Issues ----
-- Project members can CRUD issues within their projects.
CREATE POLICY "issues_select" ON public.issues FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.issues.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "issues_insert" ON public.issues FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "issues_update" ON public.issues FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.issues.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "issues_delete" ON public.issues FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.issues.project_id AND pm.user_id = auth.uid())
);

-- ---- Comments ----
-- Project members can read; authors can write their own.
CREATE POLICY "comments_select" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.issues i
    JOIN public.project_members pm ON pm.project_id = i.project_id
    WHERE i.id = public.comments.issue_id AND pm.user_id = auth.uid()
  )
);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "comments_update" ON public.comments FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "comments_delete" ON public.comments FOR DELETE USING (author_id = auth.uid());

-- ---- Notifications ----
-- Users can only see and manage their own notifications.
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "notifications_delete" ON public.notifications FOR DELETE USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- ---- Epics ----
CREATE POLICY "epics_select" ON public.epics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.epics.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "epics_modify" ON public.epics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.epics.project_id AND pm.user_id = auth.uid())
);

-- ---- Sprints ----
CREATE POLICY "sprints_select" ON public.sprints FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.sprints.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "sprints_modify" ON public.sprints FOR ALL USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.sprints.project_id AND pm.user_id = auth.uid())
);

-- ---- Retrospective Items ----
CREATE POLICY "retro_select" ON public.retrospective_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.retrospective_items.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "retro_modify" ON public.retrospective_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.retrospective_items.project_id AND pm.user_id = auth.uid())
);

-- ---- Workflow States ----
CREATE POLICY "workflow_states_select" ON public.workflow_states FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.workflow_states.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "workflow_states_modify" ON public.workflow_states FOR ALL USING (
  EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = public.workflow_states.project_id AND pm.user_id = auth.uid())
);

-- =============================================
-- Auto-create profiles for OAuth users
-- (GitHub, Google 등 OAuth 로그인 시 자동 실행)
-- =============================================

-- 새 auth.users 행 삽입 시 profiles 테이블에 자동으로 행을 생성하는 함수
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    -- GitHub: name / Google: full_name / 없으면 이메일 앞부분
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    -- GitHub: avatar_url / Google: picture
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO NOTHING; -- 이미 존재하면 무시 (중복 실행 방지)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users에 새 사용자가 생성될 때마다 위 함수를 자동 실행하는 트리거
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

