export type DailyEventType = 
  | 'status_changed' 
  | 'issue_created' 
  | 'comment_added' 
  | 'pr_merged' 
  | 'blocker_flagged';

export interface DailyEvent {
  id: string;
  userId: string;
  userName: string;
  eventType: DailyEventType;
  title: string;
  description?: string;
  timestamp: string;
  issueKey?: string;
  issueId?: string;
  statusFrom?: string;
  statusTo?: string;
}

export interface SummaryItem {
  id: string;
  issueKey?: string;
  title: string;
  detail?: string;
  status?: string;
  priority?: string;
  category?: string;
}

export interface DailySummary {
  id: string;
  userId: string;
  summaryDate: string; // YYYY-MM-DD
  doneToday: SummaryItem[];
  planTomorrow: SummaryItem[];
  blockers: SummaryItem[];
  aiInsights?: string;
  engineUsed: 'AI' | 'TEMPLATE';
  createdAt: string;
  updatedAt?: string;
}

export type ExportFormat = 'slack' | 'notion' | 'markdown' | 'text';
