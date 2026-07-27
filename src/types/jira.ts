export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask';

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
}

export interface Project {
  id: string;
  key: string;
  name: string;
  category: string;
  avatar: string;
  description: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
  lastExecuted?: string;
}

export type ViewMode = 'board' | 'backlog' | 'roadmap' | 'reports' | 'automation' | 'settings';
