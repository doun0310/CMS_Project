create table if not exists public.retrospective_sentiment_reports (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  sprint_id text,
  user_id uuid not null references auth.users(id) on delete cascade,
  score smallint not null check (score between 0 and 100),
  tone text not null check (tone in ('positive', 'neutral', 'at_risk')),
  summary text not null,
  positive_signals jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  recommended_actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists retrospective_sentiment_reports_scope_created_idx
  on public.retrospective_sentiment_reports (project_id, sprint_id, created_at desc);

alter table public.retrospective_sentiment_reports enable row level security;

-- Reports are accessed only through the Edge Function, which verifies the user
-- and uses the service-role key for persistence. No browser table policy is added.
