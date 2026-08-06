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
  assignee_id TEXT,
  reporter_id TEXT,
  key TEXT NOT NULL,
  summary TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'task',
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  component TEXT DEFAULT 'Core Framework',
  story_points INT DEFAULT 1,
  original_estimate_hours NUMERIC DEFAULT 8,
  logged_hours NUMERIC DEFAULT 0,
  labels TEXT[] DEFAULT '{}',
  due_date TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  github_branch TEXT,
  linked_prs JSONB DEFAULT '[]'::jsonb,
  linked_commits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  author_id TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Retrospective Items Table
CREATE TABLE IF NOT EXISTS public.retrospective_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sprint_id UUID REFERENCES public.sprints(id) ON DELETE CASCADE,
  author_id TEXT,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'planned',
  assignee_id TEXT,
  comments JSONB NOT NULL DEFAULT '[]'::jsonb,
  voter_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Real-time Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id TEXT,
  actor_id TEXT,
  type TEXT NOT NULL,
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Workflow States Table
CREATE TABLE IF NOT EXISTS public.workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  color TEXT DEFAULT '#6366F1',
  position INT DEFAULT 0
);

-- 11. Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  leave_type TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  approver_id TEXT,
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.retrospective_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;

-- =============================================
-- Row Level Security Policies (Production-Grade)
-- =============================================

-- Enable RLS and add Permissive Policies for Web / Local Sync
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retrospective_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Allow public / anon read and write access across tables (Development & App Sync)
CREATE POLICY "profiles_anon_all" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "projects_anon_all" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "project_members_anon_all" ON public.project_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "epics_anon_all" ON public.epics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sprints_anon_all" ON public.sprints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "issues_anon_all" ON public.issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "comments_anon_all" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "retro_anon_all" ON public.retrospective_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "notifications_anon_all" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "workflow_states_anon_all" ON public.workflow_states FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "leave_requests_anon_all" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);

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


