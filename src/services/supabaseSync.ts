import { supabase, isSupabaseConfigured } from './supabase';
import type { Issue, RetrospectiveItem, LeaveRequest } from '../types/Aether';
import type { SupabaseIssueRow, SupabaseRetroRow, SupabaseLeaveRequestRow } from '../types/SupabaseTypes';

/**
 * Maps a Supabase DB row to an AetherPulse Issue object
 */
export function mapDbToIssue(row: SupabaseIssueRow): Issue {
  return {
    id: row.id,
    key: row.key || 'TASK-1',
    summary: row.summary || '',
    description: row.description || '',
    type: row.type as Issue['type'] || 'task',
    status: row.status as Issue['status'] || 'todo',
    priority: row.priority as Issue['priority'] || 'medium',
    assigneeId: row.assignee_id || null,
    reporterId: row.reporter_id || 'usr_1',
    epicId: row.epic_id || null,
    sprintId: row.sprint_id || null,
    storyPoints: row.story_points ?? 1,
    subtasks: (row.subtasks || []) as Issue['subtasks'],
    comments: (row.comments || []) as Issue['comments'],
    history: (row.history || []) as Issue['history'],
    labels: row.labels || ['agile'],
    component: row.component || 'Core Framework',
    dueDate: row.due_date || new Date().toISOString().split('T')[0],
    originalEstimate: row.original_estimate_hours || 8,
    timeLogged: row.logged_hours || 0,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
    githubBranch: row.github_branch || undefined,
    linkedPRs: (row.linked_prs || []) as Issue['linkedPRs'],
    linkedCommits: (row.linked_commits || []) as Issue['linkedCommits'],
  };
}

/**
 * Maps an AetherPulse Issue object to a Supabase DB row
 */
export function mapIssueToDb(issue: Issue, projectId: string): SupabaseIssueRow & { project_id: string } {
  return {
    id: issue.id,
    project_id: projectId,
    sprint_id: issue.sprintId,
    epic_id: issue.epicId,
    assignee_id: issue.assigneeId,
    reporter_id: issue.reporterId,
    key: issue.key,
    summary: issue.summary,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    priority: issue.priority,
    component: issue.component,
    story_points: issue.storyPoints,
    original_estimate_hours: issue.originalEstimate,
    logged_hours: issue.timeLogged,
    labels: issue.labels,
    github_branch: issue.githubBranch || null,
    linked_prs: issue.linkedPRs || [],
    linked_commits: issue.linkedCommits || [],
    updated_at: new Date().toISOString(),
  };
}

/**
 * Fetch all issues from Supabase DB
 */
export async function fetchIssuesFromSupabase(): Promise<Issue[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from('issues').select('*');
    if (error || !data) {
      console.warn('Supabase fetch error:', error?.message);
      return [];
    }
    return (data as SupabaseIssueRow[]).map(mapDbToIssue);
  } catch (err) {
    console.error('Failed to fetch issues from Supabase:', err);
    return [];
  }
}

const ISSUE_SYNC_DEBOUNCE_MS = 400;
const pendingIssueSyncs = new Map<string, ReturnType<typeof setTimeout>>();

const syncIssueImmediately = async (issue: Issue, projectId: string) => {
  if (!isSupabaseConfigured) return;
  try {
    const dbRow = mapIssueToDb(issue, projectId);
    const { error } = await supabase.from('issues').upsert(dbRow);
    if (error) {
    console.error('Supabase issue sync error:', error.message);
    }
  } catch (err) {
    console.error('Failed to sync issue to Supabase:', err);
  }
};

/**
 * Coalesce successive local changes for the same issue. Dragging a card or
 * editing several fields therefore produces a single server write after 400ms.
 */
export function syncIssueToSupabase(issue: Issue, projectId: string) {
  const pending = pendingIssueSyncs.get(issue.id);
  if (pending) clearTimeout(pending);

  const timer = setTimeout(() => {
    pendingIssueSyncs.delete(issue.id);
    void syncIssueImmediately(issue, projectId);
  }, ISSUE_SYNC_DEBOUNCE_MS);
  pendingIssueSyncs.set(issue.id, timer);
}

/**
 * Delete an issue from Supabase
 */
export async function deleteIssueFromSupabase(issueId: string) {
  const pending = pendingIssueSyncs.get(issueId);
  if (pending) {
    clearTimeout(pending);
    pendingIssueSyncs.delete(issueId);
  }
  if (!isSupabaseConfigured) return;
  try {
    const { error } = await supabase.from('issues').delete().eq('id', issueId);
    if (error) {
      console.error('Supabase issue delete error:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete issue from Supabase:', err);
  }
}

/**
 * Fetch Retrospective items from Supabase
 */
export async function fetchRetroFromSupabase(): Promise<RetrospectiveItem[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from('retrospective_items').select('*');
    if (error || !data) return [];
    return (data as SupabaseRetroRow[]).map(mapDbToRetroItem);
  } catch (err) {
    console.error('Failed to fetch retro items from Supabase:', err);
    return [];
  }
}

export function mapDbToRetroItem(row: SupabaseRetroRow): RetrospectiveItem {
  return {
    id: row.id,
    projectId: row.project_id,
    type: row.category === 'good' ? 'went_well' : row.category === 'improve' ? 'to_improve' : 'action_item',
    content: row.content || '',
    authorId: row.author_id || 'usr_1',
    votes: row.upvotes || 0,
    createdAt: row.created_at || new Date().toISOString(),
    status: row.status || 'planned',
    assigneeId: row.assignee_id || null,
    comments: Array.isArray(row.comments) ? row.comments as RetrospectiveItem['comments'] : [],
    voterIds: Array.isArray(row.voter_ids) ? row.voter_ids as string[] : [],
  };
}

/**
 * Sync Retrospective item to Supabase
 */
export async function syncRetroToSupabase(item: RetrospectiveItem, projectId: string, sprintId: string) {
  if (!isSupabaseConfigured) return;
  try {
    const dbRow = {
      id: item.id,
      project_id: projectId,
      sprint_id: sprintId,
      author_id: item.authorId,
      category: item.type === 'went_well' ? 'good' : item.type === 'to_improve' ? 'improve' : 'action',
      content: item.content,
      upvotes: item.votes,
      status: item.status || 'planned',
      assignee_id: item.assigneeId || null,
      comments: item.comments || [],
      voter_ids: item.voterIds || [],
    };
    await supabase.from('retrospective_items').upsert(dbRow);
  } catch (err) {
    console.error('Failed to sync retro item to Supabase:', err);
  }
}

/**
 * Maps a Supabase DB leave_requests row to an AetherPulse LeaveRequest object
 */
export function mapDbToLeaveRequest(row: SupabaseLeaveRequestRow): LeaveRequest {
  return {
    id: row.id,
    userId: row.user_id,
    leaveType: row.leave_type as LeaveRequest['leaveType'],
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status as LeaveRequest['status'],
    approverId: row.approver_id || null,
    rejectReason: row.reject_reason || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Fetch all leave requests from Supabase DB
 */
export async function fetchLeaveRequestsFromSupabase(): Promise<LeaveRequest[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase.from('leave_requests').select('*').order('created_at', { ascending: false });
    if (error || !data) {
      console.warn('Supabase leave_requests fetch error:', error?.message);
      return [];
    }
    return (data as SupabaseLeaveRequestRow[]).map(mapDbToLeaveRequest);
  } catch (err) {
    console.error('Failed to fetch leave requests from Supabase:', err);
    return [];
  }
}

/**
 * Sync Leave Request object to Supabase DB
 */
export async function syncLeaveRequestToSupabase(req: LeaveRequest) {
  if (!isSupabaseConfigured) return;
  try {
    const dbRow = {
      id: req.id,
      user_id: req.userId,
      leave_type: req.leaveType,
      start_date: req.startDate,
      end_date: req.endDate,
      reason: req.reason,
      status: req.status,
      approver_id: req.approverId || null,
      reject_reason: req.rejectReason || null,
    };
    await supabase.from('leave_requests').upsert(dbRow);
  } catch (err) {
    console.error('Failed to sync leave request to Supabase:', err);
  }
}

