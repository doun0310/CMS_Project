-- Project-scoped authorization. Roles are stored in this table, never in
-- auth.user_metadata, because end users can edit their own user metadata.
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('viewer', 'project_member', 'project_manager', 'project_owner')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create index if not exists project_members_user_project_idx
  on public.project_members (user_id, project_id);

create or replace function public.has_project_role(target_project_id uuid, allowed_roles text[])
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $function$
begin
  return exists (
    select 1
    from public.project_members
    where project_id = target_project_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
end;
$function$;

-- One-time bootstrap for each existing project. Invoke this as the intended
-- owner immediately after deployment; later role changes must use the Edge Function.
create or replace function public.claim_initial_project_owner(target_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.project_members where project_id = target_project_id) then
    raise exception 'This project already has members';
  end if;

  insert into public.project_members (project_id, user_id, role)
  values (target_project_id, (select auth.uid()), 'project_owner');
end;
$$;

revoke all on function public.has_project_role(uuid, text[]) from public;
grant execute on function public.claim_initial_project_owner(uuid) to authenticated;

alter table public.project_members enable row level security;

create policy "members can read their project membership"
on public.project_members for select to authenticated
using (user_id = (select auth.uid()));

-- Membership writes intentionally have no browser policy. They go through the
-- manage-project-member Edge Function after it verifies the caller is an owner.

alter table public.issues enable row level security;
alter table public.retrospective_items enable row level security;

-- Remove previous browser policies so an older permissive policy cannot bypass roles.
do $$
declare policy_name text;
begin
  for policy_name in select policyname from pg_policies where schemaname = 'public' and tablename = 'issues' loop
    execute format('drop policy if exists %I on public.issues', policy_name);
  end loop;
  for policy_name in select policyname from pg_policies where schemaname = 'public' and tablename = 'retrospective_items' loop
    execute format('drop policy if exists %I on public.retrospective_items', policy_name);
  end loop;
end $$;

create policy "project members can read issues"
on public.issues for select to authenticated
using ((select public.has_project_role(project_id, array['viewer', 'project_member', 'project_manager', 'project_owner']::text[])));

create policy "members can create issues"
on public.issues for insert to authenticated
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));

create policy "members can update issues"
on public.issues for update to authenticated
using ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])))
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));

create policy "managers can delete issues"
on public.issues for delete to authenticated
using ((select public.has_project_role(project_id, array['project_manager', 'project_owner']::text[])));

create policy "project members can read retrospective items"
on public.retrospective_items for select to authenticated
using ((select public.has_project_role(project_id, array['viewer', 'project_member', 'project_manager', 'project_owner']::text[])));

create policy "members can create retrospective items"
on public.retrospective_items for insert to authenticated
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));

create policy "members can update retrospective items"
on public.retrospective_items for update to authenticated
using ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])))
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));

create policy "managers can delete retrospective items"
on public.retrospective_items for delete to authenticated
using ((select public.has_project_role(project_id, array['project_manager', 'project_owner']::text[])));
