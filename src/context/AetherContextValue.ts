import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Language } from '../i18n/translations';
import type {
  AutomationAuditLog,
  AppNotification,
  AutomationRule,
  Epic,
  Issue,
  IssueStatus,
  IssueType,
  Priority,
  Project,
  RetrospectiveItem,
  Sprint,
  User,
  ViewMode
} from '../types/Aether';

export interface AetherContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  currentProject: Project;
  setCurrentProject: (project: Project) => void;
  projects: Project[];
  createProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (projectId: string) => boolean;
  users: User[];
  /** Actual Supabase Auth session user, separate from the demo workspace profile. */
  authUser: User | null;
  isAuthLoading: boolean;
  epics: Epic[];
  createEpic: (summary: string) => Epic;
  updateEpic: (epicId: string, updates: Partial<Omit<Epic, 'id' | 'projectId'>>) => void;
  deleteEpic: (epicId: string) => void;
  sprints: Sprint[];
  issues: Issue[];
  portfolioIssues: Issue[];
  automationRules: AutomationRule[];
  automationAuditLogs: AutomationAuditLog[];
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationsRead: () => void;
  clearNotifications: () => void;
  retrospectiveItems: RetrospectiveItem[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  addRetroItem: (type: RetrospectiveItem['type'], content: string, assigneeId?: string | null) => void;
  voteRetroItem: (id: string) => void;
  updateRetroItem: (id: string, updates: Partial<Omit<RetrospectiveItem, 'id' | 'authorId' | 'createdAt'>>) => void;
  addRetroComment: (id: string, text: string) => void;
  deleteRetroItem: (id: string) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onlyMyIssues: boolean;
  setOnlyMyIssues: Dispatch<SetStateAction<boolean>>;
  selectedEpicId: string | null;
  setSelectedEpicId: (id: string | null) => void;
  selectedType: IssueType | 'all';
  setSelectedType: (type: IssueType | 'all') => void;
  selectedPriority: Priority | 'all';
  setSelectedPriority: (priority: Priority | 'all') => void;
  selectedLabel: string | null;
  setSelectedLabel: (label: string | null) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  signedInAccounts: User[];
  switchAccount: (account: User) => void;
  addSignedInAccount: (account: User) => void;
  removeAccount: (accountId: string) => void;
  signOutAllAccounts: () => void;

  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;

  createIssue: (issueData: Partial<Issue>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
  addComment: (issueId: string, text: string) => void;
  toggleSubtask: (issueId: string, subtaskId: string) => void;
  addSubtask: (issueId: string, title: string) => void;

  startSprint: (sprintId: string) => void;
  completeSprint: (sprintId: string) => void;
  createSprint: (name: string, goal: string) => void;
  updateSprint: (sprintId: string, updates: Partial<Omit<Sprint, 'id' | 'projectId'>>) => void;
  deleteSprint: (sprintId: string) => void;

  toggleAutomationRule: (ruleId: string) => void;
  addAutomationRule: (name: string, trigger: string, action: string) => void;
  deleteAutomationRule: (ruleId: string) => void;
  runAutomationRule: (ruleId: string) => void;

  resetDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (json: string) => boolean;
}

export const AetherContext = createContext<AetherContextValue | undefined>(undefined);

export const useAether = (): AetherContextValue => {
  const context = useContext(AetherContext);
  if (!context) {
    throw new Error('useAether must be used within an AetherProvider');
  }
  return context;
};
