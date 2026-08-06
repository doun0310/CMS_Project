import { supabase, isSupabaseConfigured } from './supabase';
import type { Project, Sprint, Epic } from '../types/Aether';
import { ensureUUID, mapUUIDToLocalID } from '../utils/idUtils';

// ─── Projects ────────────────────────────────────────────────────────────────

export async function fetchProjectsFromSupabase(): Promise<Project[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from('projects').select('*');
    if (error || !data) {
      console.warn('[DB] Projects fetch error:', error?.message);
      return [];
    }
    return data.map(mapDbToProject);
  } catch (err) {
    console.error('[DB] Failed to fetch projects:', err);
    return [];
  }
}

export async function syncProjectToSupabase(project: Project, ownerId: string): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const row = {
      id: ensureUUID(project.remoteId || project.id),
      key: project.key,
      name: project.name,
      description: project.description,
      avatar: project.avatar,
      owner_id: ownerId,
    };
    const { data, error } = await supabase.from('projects').upsert(row).select('id').single();
    if (error) {
      console.error('[DB] Project upsert error:', error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    console.error('[DB] Failed to sync project:', err);
    return null;
  }
}

export async function deleteProjectFromSupabase(remoteId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('projects').delete().eq('id', ensureUUID(remoteId));
    if (error) console.error('[DB] Project delete error:', error.message);
  } catch (err) {
    console.error('[DB] Failed to delete project:', err);
  }
}

function mapDbToProject(row: Record<string, unknown>): Project {
  const localId = mapUUIDToLocalID(row.id as string) || (row.id as string);
  return {
    id: localId,
    remoteId: row.id as string,
    key: (row.key as string) || 'PROJ',
    name: (row.name as string) || 'Unnamed Project',
    description: (row.description as string) || '',
    avatar: (row.avatar as string) || '✦',
    category: 'Software',
  };
}

// ─── Sprints ─────────────────────────────────────────────────────────────────

export async function fetchSprintsFromSupabase(projectRemoteId: string): Promise<Sprint[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('sprints')
      .select('*')
      .eq('project_id', ensureUUID(projectRemoteId));
    if (error || !data) {
      console.warn('[DB] Sprints fetch error:', error?.message);
      return [];
    }
    return data.map(mapDbToSprint);
  } catch (err) {
    console.error('[DB] Failed to fetch sprints:', err);
    return [];
  }
}

export async function syncSprintToSupabase(sprint: Sprint, projectRemoteId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const row = {
      id: ensureUUID(sprint.id),
      project_id: ensureUUID(projectRemoteId),
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status === 'future' ? 'planned' : sprint.status,
      start_date: sprint.startDate || null,
      end_date: sprint.endDate || null,
    };
    const { error } = await supabase.from('sprints').upsert(row);
    if (error) console.error('[DB] Sprint upsert error:', error.message);
  } catch (err) {
    console.error('[DB] Failed to sync sprint:', err);
  }
}

export async function deleteSprintFromSupabase(sprintId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('sprints').delete().eq('id', ensureUUID(sprintId));
    if (error) console.error('[DB] Sprint delete error:', error.message);
  } catch (err) {
    console.error('[DB] Failed to delete sprint:', err);
  }
}

function mapDbToSprint(row: Record<string, unknown>): Sprint {
  const dbStatus = row.status as string;
  const status: Sprint['status'] =
    dbStatus === 'active' ? 'active' :
    dbStatus === 'completed' ? 'completed' : 'future';

  return {
    id: mapUUIDToLocalID(row.id as string) || (row.id as string),
    projectId: mapUUIDToLocalID(row.project_id as string) || (row.project_id as string) || 'p1',
    name: (row.name as string) || 'Sprint',
    goal: (row.goal as string) || '',
    startDate: (row.start_date as string) || new Date().toISOString().split('T')[0],
    endDate: (row.end_date as string) || new Date().toISOString().split('T')[0],
    status,
  };
}

// ─── Epics ───────────────────────────────────────────────────────────────────

export async function fetchEpicsFromSupabase(projectRemoteId: string): Promise<Epic[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('epics')
      .select('*')
      .eq('project_id', ensureUUID(projectRemoteId));
    if (error || !data) {
      console.warn('[DB] Epics fetch error:', error?.message);
      return [];
    }
    return data.map(mapDbToEpic);
  } catch (err) {
    console.error('[DB] Failed to fetch epics:', err);
    return [];
  }
}

export async function syncEpicToSupabase(epic: Epic, projectRemoteId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const row = {
      id: ensureUUID(epic.id),
      project_id: ensureUUID(projectRemoteId),
      name: epic.summary,
      summary: epic.description || '',
      color: epic.color,
    };
    const { error } = await supabase.from('epics').upsert(row);
    if (error) console.error('[DB] Epic upsert error:', error.message);
  } catch (err) {
    console.error('[DB] Failed to sync epic:', err);
  }
}

export async function deleteEpicFromSupabase(epicId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('epics').delete().eq('id', epicId);
    if (error) console.error('[DB] Epic delete error:', error.message);
  } catch (err) {
    console.error('[DB] Failed to delete epic:', err);
  }
}

function mapDbToEpic(row: Record<string, unknown>): Epic {
  return {
    id: mapUUIDToLocalID(row.id as string) || (row.id as string),
    projectId: mapUUIDToLocalID(row.project_id as string) || (row.project_id as string) || 'p1',
    key: `EPIC-${(row.id as string).slice(0, 6).toUpperCase()}`,
    summary: (row.name as string) || 'Epic',
    description: (row.summary as string) || '',
    color: (row.color as string) || '#6366F1',
  };
}

// ─── Project Membership ───────────────────────────────────────────────────────

/**
 * Adds the current user as a member of a project after creating it.
 * Role defaults to 'project_owner'.
 */
export async function addProjectMember(
  projectRemoteId: string,
  userId: string,
  role: 'project_owner' | 'project_manager' | 'project_member' | 'viewer' = 'project_owner'
): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('project_members').upsert({
      project_id: projectRemoteId,
      user_id: userId,
      role,
    }, { onConflict: 'project_id,user_id' });
    if (error) console.error('[DB] Project member upsert error:', error.message);
  } catch (err) {
    console.error('[DB] Failed to add project member:', err);
  }
}
