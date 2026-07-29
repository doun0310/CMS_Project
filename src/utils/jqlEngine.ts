import type { Issue } from '../types/Aether';

export interface JQLFilter {
  status?: string[];
  priority?: string[];
  type?: string[];
  assignee?: string[];
  label?: string[];
  sprint?: string[];
  freeText?: string;
}

export interface SavedFilterPreset {
  id: string;
  name: string;
  query: string;
  icon: string;
}

export const SAVED_JQL_PRESETS: SavedFilterPreset[] = [
  { id: 'f-1', name: 'My In-Progress Tasks', query: 'assignee:me status:in_progress,in_review', icon: '' },
  { id: 'f-2', name: 'Critical Bugs & Security', query: 'type:bug priority:highest,high', icon: '' },
  { id: 'f-3', name: 'Active Sprint Backlog', query: 'sprint:active status:todo', icon: '' },
  { id: 'f-4', name: 'Core Framework Tasks', query: 'label:agile,framework', icon: '' },
];

/**
 * Parses a JQL search query string into structured filter parameters.
 * Syntax examples:
 * - status:in_progress,done
 * - priority:highest,high
 * - type:bug,story
 * - assignee:me
 * - label:security
 * - sprint:active
 * - free text search terms
 */
export function parseJQL(queryStr: string): JQLFilter {
  if (!queryStr || !queryStr.trim()) return {};

  const filter: JQLFilter = {};
  const tokens = queryStr.trim().split(/\s+/);
  const freeTextParts: string[] = [];

  tokens.forEach((token) => {
    if (token.includes(':')) {
      const [key, rawVal] = token.split(':');
      const k = key.toLowerCase();
      const valList = rawVal ? rawVal.split(',').map((v) => v.trim().toLowerCase()) : [];

      if (k === 'status') {
        filter.status = valList;
      } else if (k === 'priority') {
        filter.priority = valList;
      } else if (k === 'type') {
        filter.type = valList;
      } else if (k === 'assignee') {
        filter.assignee = valList;
      } else if (k === 'label' || k === 'labels') {
        filter.label = valList;
      } else if (k === 'sprint') {
        filter.sprint = valList;
      } else {
        freeTextParts.push(token);
      }
    } else {
      freeTextParts.push(token);
    }
  });

  if (freeTextParts.length > 0) {
    filter.freeText = freeTextParts.join(' ').toLowerCase();
  }

  return filter;
}

/**
 * Applies JQL filter parsing to an array of Issues
 */
export function filterIssuesWithJQL(
  issues: Issue[],
  queryStr: string,
  currentUserId: string,
  activeSprintId?: string | null
): Issue[] {
  if (!queryStr || !queryStr.trim()) return issues;

  const parsed = parseJQL(queryStr);

  return issues.filter((issue) => {
    // 1. Status Filter
    if (parsed.status && parsed.status.length > 0) {
      const matchesStatus = parsed.status.some((s) => issue.status.toLowerCase() === s);
      if (!matchesStatus) return false;
    }

    // 2. Priority Filter
    if (parsed.priority && parsed.priority.length > 0) {
      const matchesPriority = parsed.priority.some((p) => issue.priority.toLowerCase() === p);
      if (!matchesPriority) return false;
    }

    // 3. Type Filter
    if (parsed.type && parsed.type.length > 0) {
      const matchesType = parsed.type.some((t) => issue.type.toLowerCase() === t);
      if (!matchesType) return false;
    }

    // 4. Assignee Filter
    if (parsed.assignee && parsed.assignee.length > 0) {
      const matchesAssignee = parsed.assignee.some((a) => {
        if (a === 'me' || a === '@me') return issue.assigneeId === currentUserId;
        if (a === 'unassigned' || a === 'none') return !issue.assigneeId;
        return issue.assigneeId?.toLowerCase() === a;
      });
      if (!matchesAssignee) return false;
    }

    // 5. Label Filter
    if (parsed.label && parsed.label.length > 0) {
      const issueLabels = (issue.labels || []).map((l) => l.toLowerCase());
      const matchesLabel = parsed.label.some((l) => issueLabels.includes(l));
      if (!matchesLabel) return false;
    }

    // 6. Sprint Filter
    if (parsed.sprint && parsed.sprint.length > 0) {
      const matchesSprint = parsed.sprint.some((sp) => {
        if (sp === 'active') return activeSprintId ? issue.sprintId === activeSprintId : true;
        if (sp === 'backlog' || sp === 'none') return !issue.sprintId;
        return issue.sprintId === sp;
      });
      if (!matchesSprint) return false;
    }

    // 7. Free Text Search Filter
    if (parsed.freeText) {
      const q = parsed.freeText;
      const matchKey = issue.key.toLowerCase().includes(q);
      const matchSummary = issue.summary.toLowerCase().includes(q);
      const matchDesc = (issue.description || '').toLowerCase().includes(q);
      const matchLabel = (issue.labels || []).some((l) => l.toLowerCase().includes(q));

      if (!matchKey && !matchSummary && !matchDesc && !matchLabel) return false;
    }

    return true;
  });
}
