import React, { useEffect, useState, type ReactNode } from 'react';
import type {
  Epic,
  Sprint,
  Issue,
  AutomationRule,
  AutomationAuditLog,
  IssueStatus,
  IssueType,
  Priority,
  SubTask,
  RetrospectiveItem,
  ViewMode
} from '../types/Aether';
import {
  initialUsers,
  initialProjects,
  initialEpics,
  initialSprints,
  initialIssues,
  initialAutomationRules,
  initialRetrospectiveItems,
  initialAutomationAuditLogs
} from '../mock/AetherData';
import { translations, type Language } from '../i18n/translations';
import { AetherContext } from './AetherContextValue';

const STORAGE_KEY = 'AETHER_PULSE_APP_DATA_V1';
// Read the previous product key once so existing users keep their local workspace data.
const PREVIOUS_STORAGE_KEY = 'JIRA_VERSE_APP_DATA_V1';

interface PersistedState {
  issues?: Issue[];
  sprints?: Sprint[];
  epics?: Epic[];
  automationRules?: AutomationRule[];
  retrospectiveItems?: RetrospectiveItem[];
  automationAuditLogs?: AutomationAuditLog[];
  theme?: 'light' | 'dark';
  language?: Language;
  accentColor?: string;
}

const isLanguage = (value: unknown): value is Language =>
  value === 'ko' || value === 'en' || value === 'ja' || value === 'zh';

const readPersistedState = (): PersistedState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(PREVIOUS_STORAGE_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return {};

    const data = parsed as Record<string, unknown>;
    return {
      issues: Array.isArray(data.issues) ? data.issues as Issue[] : undefined,
      sprints: Array.isArray(data.sprints) ? data.sprints as Sprint[] : undefined,
      epics: Array.isArray(data.epics) ? data.epics as Epic[] : undefined,
      automationRules: Array.isArray(data.automationRules)
        ? data.automationRules as AutomationRule[]
        : undefined,
      retrospectiveItems: Array.isArray(data.retrospectiveItems)
        ? data.retrospectiveItems as RetrospectiveItem[]
        : undefined,
      automationAuditLogs: Array.isArray(data.automationAuditLogs)
        ? data.automationAuditLogs as AutomationAuditLog[]
        : undefined,
      theme: data.theme === 'light' || data.theme === 'dark' ? data.theme : undefined,
      language: isLanguage(data.language) ? data.language : undefined,
      accentColor: typeof data.accentColor === 'string' ? data.accentColor : undefined
    };
  } catch (error) {
    console.error('Failed to load local storage data:', error);
    return {};
  }
};

export const AetherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persistedState] = useState(readPersistedState);
  const [theme, setTheme] = useState<'light' | 'dark'>(persistedState.theme ?? 'dark');
  const [accentColor, setAccentColor] = useState(persistedState.accentColor ?? '#6366f1');
  const [language, setLanguage] = useState<Language>(persistedState.language ?? 'ko');

  useEffect(() => {
    document.documentElement.style.setProperty('--color-in-progress', accentColor);
    document.documentElement.style.setProperty('--border-focus', accentColor);
  }, [accentColor]);
  const [projects] = useState(initialProjects);
  const [currentProject, setCurrentProject] = useState(initialProjects[0]);
  const [users] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[2]);
  const [epics, setEpics] = useState(persistedState.epics ?? initialEpics);
  const [sprints, setSprints] = useState(persistedState.sprints ?? initialSprints);
  const [issues, setIssues] = useState(persistedState.issues ?? initialIssues);
  const [automationRules, setAutomationRules] = useState(
    persistedState.automationRules ?? initialAutomationRules
  );
  const [automationAuditLogs, setAutomationAuditLogs] = useState(
    persistedState.automationAuditLogs ?? initialAutomationAuditLogs
  );
  const [retrospectiveItems, setRetrospectiveItems] = useState(
    persistedState.retrospectiveItems ?? initialRetrospectiveItems
  );

  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyMyIssues, setOnlyMyIssues] = useState<boolean>(false);
  const [selectedEpicId, setSelectedEpicId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<IssueType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  useEffect(() => {
    try {
      const stateToSave = {
        issues,
        sprints,
        epics,
        automationRules,
        retrospectiveItems,
        automationAuditLogs,
        theme,
        language,
        accentColor
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      localStorage.removeItem(PREVIOUS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }, [issues, sprints, epics, automationRules, retrospectiveItems, automationAuditLogs, theme, language, accentColor]);

  // Apply Theme attribute to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const recordDoneStatusAutomation = () => {
    setAutomationRules(previousRules =>
      previousRules.map(rule =>
        rule.id === 'auto-1' && rule.enabled
          ? { ...rule, lastExecuted: new Date().toLocaleTimeString() }
          : rule
      )
    );
  };

  const moveIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    const issue = issues.find(item => item.id === issueId);
    if (!issue || issue.status === newStatus) return;

    const now = new Date().toISOString();
    setIssues(prev =>
      prev.map(item =>
        item.id === issueId
          ? {
              ...item,
              status: newStatus,
              history: [
                ...item.history,
                {
                  id: `h_${Date.now()}`,
                  authorId: currentUser.id,
                  action: `Status changed to ${newStatus.toUpperCase()}`,
                  timestamp: now
                }
              ],
              updatedAt: now
            }
          : item
      )
    );

    if (newStatus === 'done') recordDoneStatusAutomation();
  };

  const createIssue = (issueData: Partial<Issue>) => {
    const maxNum = issues.reduce((max, i) => Math.max(max, parseInt(i.key.split('-')[1]) || 0), 100);
    const key = `${currentProject.key}-${maxNum + 1}`;
    const now = new Date().toISOString();

    const newIssue: Issue = {
      id: 'issue_' + Date.now(),
      key,
      summary: issueData.summary ?? 'New Issue',
      description: issueData.description ?? '',
      type: issueData.type ?? 'feature',
      status: issueData.status ?? 'todo',
      priority: issueData.priority ?? 'medium',
      assigneeId: issueData.assigneeId === undefined ? currentUser.id : issueData.assigneeId,
      reporterId: currentUser.id,
      epicId: issueData.epicId ?? null,
      sprintId: issueData.sprintId === undefined
        ? sprints.find(s => s.status === 'active')?.id ?? null
        : issueData.sprintId,
      storyPoints: issueData.storyPoints ?? 3,
      subtasks: [],
      comments: [],
      history: [{ id: 'h_1', authorId: currentUser.id, action: 'Created issue', timestamp: now }],
      labels: issueData.labels ?? ['agile'],
      component: issueData.component ?? 'Core Engine',
      dueDate: issueData.dueDate ?? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      originalEstimate: issueData.originalEstimate ?? 8,
      timeLogged: issueData.timeLogged ?? 0,
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
      prev.map(sprint => {
        if (sprint.id === sprintId) return { ...sprint, status: 'active' };
        if (sprint.status === 'active') return { ...sprint, status: 'future' };
        return sprint;
      })
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

  const addAutomationRule = (name: string, trigger: string, action: string) => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name,
      trigger,
      action,
      enabled: true,
      executionCount: 0
    };
    setAutomationRules(prev => [newRule, ...prev]);
  };

  const runAutomationRule = (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    // Execute rule simulation on issues
    const targetIssue = issues[0] || { key: 'CLOUD-101' };
    const nowStr = new Date().toLocaleString();

    const newLog: AutomationAuditLog = {
      id: `log-${Date.now()}`,
      ruleName: rule.name,
      triggeredAt: nowStr,
      targetIssueKey: targetIssue.key,
      actionTaken: rule.action,
      status: 'SUCCESS'
    };

    setAutomationAuditLogs(prev => [newLog, ...prev]);

    // Increment execution count and timestamp
    setAutomationRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? {
              ...r,
              lastExecuted: 'Just now',
              executionCount: (r.executionCount || 0) + 1
            }
          : r
      )
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
    setAutomationAuditLogs(initialAutomationAuditLogs);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREVIOUS_STORAGE_KEY);
  };

  const exportDataJSON = () => {
    return JSON.stringify({ issues, sprints, epics, automationRules, retrospectiveItems }, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;

      const data = parsed as Record<string, unknown>;
      let importedSectionCount = 0;

      if (Array.isArray(data.issues)) {
        setIssues(data.issues as Issue[]);
        importedSectionCount += 1;
      }
      if (Array.isArray(data.sprints)) {
        setSprints(data.sprints as Sprint[]);
        importedSectionCount += 1;
      }
      if (Array.isArray(data.epics)) {
        setEpics(data.epics as Epic[]);
        importedSectionCount += 1;
      }
      if (Array.isArray(data.retrospectiveItems)) {
        setRetrospectiveItems(data.retrospectiveItems as RetrospectiveItem[]);
        importedSectionCount += 1;
      }
      if (Array.isArray(data.automationRules)) {
        setAutomationRules(data.automationRules as AutomationRule[]);
        importedSectionCount += 1;
      }
      if (Array.isArray(data.automationAuditLogs)) {
        setAutomationAuditLogs(data.automationAuditLogs as AutomationAuditLog[]);
        importedSectionCount += 1;
      }

      return importedSectionCount > 0;
    } catch (error) {
      console.error('Import error:', error);
      return false;
    }
  };

  return (
    <AetherContext.Provider
      value={{
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
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
        automationAuditLogs,
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
        selectedLabel,
        setSelectedLabel,
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
        addAutomationRule,
        runAutomationRule,
        resetDemoData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </AetherContext.Provider>
  );
};
