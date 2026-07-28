export type IssueType = 'initiative' | 'feature' | 'workitem' | 'bug' | 'subtask' | 'epic' | 'story' | 'task';

export type IssueStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface Epic {
  id: string;
  key: string;
  summary: string;
  color: string;
  description?: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'future' | 'completed';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface RetrospectiveItem {
  id: string;
  type: 'went_well' | 'to_improve' | 'action_item';
  content: string;
  votes: number;
  authorId: string;
  createdAt: string;
}

export interface WorkloadSuggestion {
  issueId: string;
  issueKey: string;
  issueSummary: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
}

export interface ActivityLog {
  id: string;
  authorId: string;
  action: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  key: string;
  summary: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  assigneeId: string | null;
  reporterId: string;
  epicId: string | null;
  sprintId: string | null; // null = backlog
  storyPoints: number;
  subtasks: SubTask[];
  comments: Comment[];
  history: ActivityLog[];
  labels: string[];
  component: string;
  dueDate: string;
  originalEstimate: number; // hours
  timeLogged: number; // hours
  createdAt: string;
  updatedAt: string;
  blockedBy?: string[]; // issue keys or ids
  blocks?: string[];    // issue keys or ids
  acceptanceCriteria?: string[];
  testScenarios?: { id: string; title: string; gherkin: string; codeSnippet: string }[];
  customFields?: Record<string, string>;
}

export interface CustomFieldDef {
  id: string;
  name: string;
  type: 'text' | 'select' | 'url' | 'badge';
  options?: string[];
  defaultValue?: string;
}

export interface Project {
  id: string;
  key: string;
  name: string;
  category: string;
  avatar: string;
  description: string;
  customFieldDefs?: CustomFieldDef[];
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastExecuted?: string;
  executionCount?: number;
}

export interface AutomationAuditLog {
  id: string;
  ruleName: string;
  triggeredAt: string;
  targetIssueKey: string;
  actionTaken: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}

export type ViewMode = 'my-work' | 'board' | 'backlog' | 'roadmap' | 'reports' | 'automation' | 'settings' | 'retrospective' | 'architecture' | 'portfolio' | 'retro-kanban';

