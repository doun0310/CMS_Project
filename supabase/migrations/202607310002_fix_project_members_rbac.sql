-- Align the earlier RBAC migration with the existing CMS_Project schema.
drop policy if exists "project members can read issues" on public.issues;
drop policy if exists "members can create issues" on public.issues;
drop policy if exists "members can update issues" on public.issues;
drop policy if exists "managers can delete issues" on public.issues;
drop policy if exists "project members can read retrospective items" on public.retrospective_items;
drop policy if exists "members can create retrospective items" on public.retrospective_items;
drop policy if exists "members can update retrospective items" on public.retrospective_items;
drop policy if exists "managers can delete retrospective items" on public.retrospective_items;

drop function if exists public.has_project_role(text, text[]) cascade;

alter table public.project_members
  alter column project_id set not null,
  alter column user_id set not null,
  alter column role set not null,
  alter column role drop default;

alter table public.project_members drop constraint if exists project_members_role_check;
alter table public.project_members add constraint project_members_role_check
  check (role in ('viewer', 'project_member', 'project_manager', 'project_owner'));
alter table public.project_members drop constraint if exists project_members_project_user_key;
alter table public.project_members add constraint project_members_project_user_key unique (project_id, user_id);

create or replace function public.has_project_role(target_project_id uuid, allowed_roles text[])
returns boolean language plpgsql stable security definer set search_path = public as $function$
begin
  return exists (
    select 1 from public.project_members
    where project_id = target_project_id
      and user_id = (select auth.uid())
      and role = any(allowed_roles)
  );
end;
$function$;

revoke all on function public.has_project_role(uuid, text[]) from public;

alter table public.issues enable row level security;
alter table public.retrospective_items enable row level security;

create policy "project members can read issues" on public.issues for select to authenticated
using ((select public.has_project_role(project_id, array['viewer', 'project_member', 'project_manager', 'project_owner']::text[])));
create policy "members can create issues" on public.issues for insert to authenticated
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));
create policy "members can update issues" on public.issues for update to authenticated
using ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])))
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));
create policy "managers can delete issues" on public.issues for delete to authenticated
using ((select public.has_project_role(project_id, array['project_manager', 'project_owner']::text[])));

create policy "project members can read retrospective items" on public.retrospective_items for select to authenticated
using ((select public.has_project_role(project_id, array['viewer', 'project_member', 'project_manager', 'project_owner']::text[])));
create policy "members can create retrospective items" on public.retrospective_items for insert to authenticated
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));
create policy "members can update retrospective items" on public.retrospective_items for update to authenticated
using ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])))
with check ((select public.has_project_role(project_id, array['project_member', 'project_manager', 'project_owner']::text[])));
create policy "managers can delete retrospective items" on public.retrospective_items for delete to authenticated
using ((select public.has_project_role(project_id, array['project_manager', 'project_owner']::text[])));
