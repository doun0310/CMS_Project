import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  User,
  Project,
  Epic,
  Sprint,
  Issue,
  AutomationRule,
  ViewMode,
  IssueStatus,
  IssueType,
  Priority,
  SubTask,
  RetrospectiveItem
} from '../types/jira';
import {
  initialUsers,
  initialProjects,
  initialEpics,
  initialSprints,
  initialIssues,
  initialAutomationRules,
  initialRetrospectiveItems
} from '../mock/jiraData';
import { translations, type Language } from '../i18n/translations';

interface JiraContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  currentProject: Project;
  setCurrentProject: (proj: Project) => void;
  projects: Project[];
  users: User[];
  epics: Epic[];
  sprints: Sprint[];
  issues: Issue[];
  automationRules: AutomationRule[];
  retrospectiveItems: RetrospectiveItem[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Retro Actions
  addRetroItem: (type: 'went_well' | 'to_improve' | 'action_item', content: string) => void;
  voteRetroItem: (id: string) => void;
  deleteRetroItem: (id: string) => void;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onlyMyIssues: boolean;
  setOnlyMyIssues: (val: boolean) => void;
  selectedEpicId: string | null;
  setSelectedEpicId: (id: string | null) => void;
  selectedType: IssueType | 'all';
  setSelectedType: (type: IssueType | 'all') => void;
  selectedPriority: Priority | 'all';
  setSelectedPriority: (prio: Priority | 'all') => void;
  currentUser: User;
  setCurrentUser: (u: User) => void;

  // Selected Issue Modal
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;

  // Issue CRUD Actions
  createIssue: (issueData: Partial<Issue>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  moveIssueStatus: (issueId: string, newStatus: IssueStatus) => void;
  addComment: (issueId: string, text: string) => void;
  toggleSubtask: (issueId: string, subtaskId: string) => void;
  addSubtask: (issueId: string, title: string) => void;

  // Sprint Actions
  startSprint: (sprintId: string) => void;
  completeSprint: (sprintId: string) => void;
  createSprint: (name: string, goal: string) => void;

  // Automation Actions
  toggleAutomationRule: (ruleId: string) => void;

  // System Data Management
  resetDemoData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
}

const STORAGE_KEY = 'JIRA_VERSE_APP_DATA_V1';

const JiraContext = createContext<JiraContextType | undefined>(undefined);

export const JiraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [language, setLanguage] = useState<Language>('ko');
  const [projects] = useState<Project[]>(initialProjects);
  const [currentProject, setCurrentProject] = useState<Project>(initialProjects[0]);
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[2]); // Alex Rivera Lead
  const [epics, setEpics] = useState<Epic[]>(initialEpics);
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(initialAutomationRules);
  const [retrospectiveItems, setRetrospectiveItems] = useState<RetrospectiveItem[]>(initialRetrospectiveItems);

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMyIssues, setOnlyMyIssues] = useState<boolean>(false);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<IssueType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  // Load state from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.issues) setIssues(parsed.issues);
        if (parsed.sprints) setSprints(parsed.sprints);
        if (parsed.epics) setEpics(parsed.epics);
        if (parsed.automationRules) setAutomationRules(parsed.automationRules);
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch (e) {
      console.error('Failed to load local storage data:', e);
    }
  }, []);

  // Save state to LocalStorage
  useEffect(() => {
    try {
      const stateToSave = {
        issues,
        sprints,
        epics,
        automationRules,
        theme,
        language
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [issues, sprints, epics, automationRules, theme, language]);

  // Apply Theme attribute to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Helper trigger automation
  const triggerAutomations = (triggerType: string) => {
    automationRules.forEach(rule => {
      if (!rule.enabled) return;
      if (rule.id === 'auto-1' && triggerType === 'DONE_STATUS') {
        setAutomationRules(prev => prev.map(r => r.id === 'auto-1' ? { ...r, lastExecuted: new Date().toLocaleTimeString() } : r));
      }
    });
  };

  const moveIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          const now = new Date().toISOString();
          const updatedHistory = [
            ...item.history,
            {
              id: 'h_' + Date.now(),
              authorId: currentUser.id,
              action: `Status changed to ${newStatus.toUpperCase()}`,
              timestamp: now
            }
          ];
          const updated = {
            ...item,
            status: newStatus,
            history: updatedHistory,
            updatedAt: now
          };
          if (newStatus === 'done') {
            triggerAutomations('DONE_STATUS');
          }
          return updated;
        }
        return item;
      })
    );
  };

  const createIssue = (issueData: Partial<Issue>) => {
    const nextIdNum = issues.length + 101;
    const key = `${currentProject.key}-${nextIdNum}`;
    const now = new Date().toISOString();

    const newIssue: Issue = {
      id: 'issue_' + Date.now(),
      key,
      summary: issueData.summary || 'New Issue',
      description: issueData.description || '',
      type: issueData.type || 'story',
      status: issueData.status || 'todo',
      priority: issueData.priority || 'medium',
      assigneeId: issueData.assigneeId || currentUser.id,
      reporterId: currentUser.id,
      epicId: issueData.epicId || null,
      sprintId: issueData.sprintId !== undefined ? issueData.sprintId : sprints.find(s => s.status === 'active')?.id || null,
      storyPoints: issueData.storyPoints || 3,
      subtasks: [],
      comments: [],
      history: [{ id: 'h_1', authorId: currentUser.id, action: 'Created issue', timestamp: now }],
      labels: issueData.labels || ['agile'],
      component: issueData.component || 'Core Engine',
      dueDate: issueData.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      originalEstimate: issueData.originalEstimate || 8,
      timeLogged: 0,
      createdAt: now,
      updatedAt: now
    };

    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item))
    );
  };

  const deleteIssue = (id: string) => {
    setIssues(prev => prev.filter(item => item.id !== id));
    if (selectedIssueId === id) setSelectedIssueId(null);
  };

  const addComment = (issueId: string, text: string) => {
    if (!text.trim()) return;
    const newComment = {
      id: 'c_' + Date.now(),
      authorId: currentUser.id,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };
    setIssues(prev =>
      prev.map(item =>
        item.id === issueId ? { ...item, comments: [...item.comments, newComment] } : item
      )
    );
  };

  const toggleSubtask = (issueId: string, subtaskId: string) => {
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          const updatedSubtasks = item.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...item, subtasks: updatedSubtasks };
        }
        return item;
      })
    );
  };

  const addSubtask = (issueId: string, title: string) => {
    if (!title.trim()) return;
    const newSub: SubTask = { id: 'st_' + Date.now(), title: title.trim(), completed: false };
    setIssues(prev =>
      prev.map(item => (item.id === issueId ? { ...item, subtasks: [...item.subtasks, newSub] } : item))
    );
  };

  const startSprint = (sprintId: string) => {
    setSprints(prev =>
      prev.map(s => (s.id === sprintId ? { ...s, status: 'active' } : s))
    );
  };

  const completeSprint = (sprintId: string) => {
    setSprints(prev =>
      prev.map(s => (s.id === sprintId ? { ...s, status: 'completed' } : s))
    );
    // Move remaining non-done issues in sprint to Backlog (sprintId = null)
    setIssues(prev =>
      prev.map(item =>
        item.sprintId === sprintId && item.status !== 'done' ? { ...item, sprintId: null } : item
      )
    );
  };

  const createSprint = (name: string, goal: string) => {
    const newSprint: Sprint = {
      id: 'sprint_' + Date.now(),
      name,
      goal,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'future'
    };
    setSprints(prev => [...prev, newSprint]);
  };

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addRetroItem = (type: 'went_well' | 'to_improve' | 'action_item', content: string) => {
    const newItem: RetrospectiveItem = {
      id: `retro-${Date.now()}`,
      type,
      content,
      votes: 1,
      authorId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setRetrospectiveItems(prev => [newItem, ...prev]);
  };

  const voteRetroItem = (id: string) => {
    setRetrospectiveItems(prev =>
      prev.map(item => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
    );
  };

  const deleteRetroItem = (id: string) => {
    setRetrospectiveItems(prev => prev.filter(item => item.id !== id));
  };

  const resetDemoData = () => {
    setIssues(initialIssues);
    setSprints(initialSprints);
    setEpics(initialEpics);
    setAutomationRules(initialAutomationRules);
    setRetrospectiveItems(initialRetrospectiveItems);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportDataJSON = () => {
    return JSON.stringify({ issues, sprints, epics, automationRules, retrospectiveItems }, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.issues) setIssues(data.issues);
      if (data.sprints) setSprints(data.sprints);
      if (data.epics) setEpics(data.epics);
      if (data.retrospectiveItems) setRetrospectiveItems(data.retrospectiveItems);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  return (
    <JiraContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        currentProject,
        setCurrentProject,
        projects,
        users,
        epics,
        sprints,
        issues,
        automationRules,
        retrospectiveItems,
        viewMode,
        setViewMode,
        addRetroItem,
        voteRetroItem,
        deleteRetroItem,
        searchQuery,
        setSearchQuery,
        onlyMyIssues,
        setOnlyMyIssues,
        selectedEpicId,
        setSelectedEpicId,
        selectedType,
        setSelectedType,
        selectedPriority,
        setSelectedPriority,
        currentUser,
        setCurrentUser,
        selectedIssueId,
        setSelectedIssueId,
        isCreateModalOpen,
        setIsCreateModalOpen,
        createIssue,
        updateIssue,
        deleteIssue,
        moveIssueStatus,
        addComment,
        toggleSubtask,
        addSubtask,
        startSprint,
        completeSprint,
        createSprint,
        toggleAutomationRule,
        resetDemoData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </JiraContext.Provider>
  );
};

export const useJira = () => {
  const context = useContext(JiraContext);
  if (!context) throw new Error('useJira must be used within a JiraProvider');
  return context;
};
