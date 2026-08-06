/**
 * Supabase database row types — maps to the snake_case columns in PostgreSQL.
 * Used to replace `any` in data-mapping functions.
 */

export interface SupabaseIssueRow {
  id: string;
  project_id?: string;
  sprint_id?: string | null;
  epic_id?: string | null;
  assignee_id?: string | null;
  reporter_id?: string | null;
  key?: string;
  summary?: string;
  description?: string;
  type?: string;
  status?: string;
  priority?: string;
  component?: string;
  story_points?: number | null;
  original_estimate_hours?: number | null;
  logged_hours?: number | null;
  labels?: string[];
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
  github_branch?: string | null;
  linked_prs?: unknown[];
  linked_commits?: unknown[];
  subtasks?: unknown[];
  comments?: unknown[];
  history?: unknown[];
}

export interface SupabaseRetroRow {
  id: string;
  project_id?: string;
  sprint_id?: string;
  author_id?: string | null;
  category?: 'good' | 'improve' | 'action';
  content?: string;
  upvotes?: number;
  status?: 'planned' | 'in_progress' | 'done';
  assignee_id?: string | null;
  comments?: unknown;
  voter_ids?: unknown;
  created_at?: string;
}

export interface SupabaseLeaveRequestRow {
  id: string;
  user_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  approver_id?: string | null;
  reject_reason?: string | null;
  created_at?: string;
}

/**
 * Supabase Realtime payload structure.
 * Replaces `any` in the subscription callbacks.
 */
export interface RealtimePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: Partial<T> & { id?: string };
  schema: string;
  table: string;
  commit_timestamp: string;
}

