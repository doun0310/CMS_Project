import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { Language } from '../i18n/translations';
import type {
  AutomationAuditLog,
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
  users: User[];
  epics: Epic[];
  sprints: Sprint[];
  issues: Issue[];
  automationRules: AutomationRule[];
  automationAuditLogs: AutomationAuditLog[];
  retrospectiveItems: RetrospectiveItem[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  addRetroItem: (type: RetrospectiveItem['type'], content: string) => void;
  voteRetroItem: (id: string) => void;
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

  toggleAutomationRule: (ruleId: string) => void;
  addAutomationRule: (name: string, trigger: string, action: string) => void;
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
