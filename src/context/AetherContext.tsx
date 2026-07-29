import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  Epic,
  Sprint,
  Issue,
  AutomationRule,
  AutomationAuditLog,
  IssueStatus,
  IssueType,
  Priority,
  Project,
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
import { isSupabaseConfigured, subscribeToTable } from '../services/supabase';
import {
  fetchIssuesFromSupabase,
  syncIssueToSupabase,
  deleteIssueFromSupabase,
  fetchRetroFromSupabase,
  syncRetroToSupabase,
  mapDbToIssue,
  mapDbToRetroItem
} from '../services/supabaseSync';

const STORAGE_KEY = 'AETHER_PULSE_APP_DATA_V1';
// Read the previous product key once so existing users keep their local workspace data.
const PREVIOUS_STORAGE_KEY = 'JIRA_VERSE_APP_DATA_V1';

interface PersistedState {
  projects?: Project[];
  currentProjectId?: string;
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

const isIssueStatus = (value: unknown): value is IssueStatus =>
  value === 'todo' || value === 'in_progress' || value === 'in_review' || value === 'done';

const isPriority = (value: unknown): value is Priority =>
  value === 'highest' || value === 'high' || value === 'medium' || value === 'low' || value === 'lowest';

const isLanguage = (value: unknown): value is Language =>
  value === 'ko' || value === 'en' || value === 'ja' || value === 'zh';

const normalizeIssueType = (value: unknown): IssueType => {
  if (value === 'story') return 'feature';
  if (value === 'task') return 'workitem';
  if (value === 'epic') return 'initiative';
  return value === 'initiative' || value === 'feature' || value === 'workitem' || value === 'bug' || value === 'subtask'
    ? value
    : 'feature';
};

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const normalizeIssue = (value: unknown, fallback: Issue): Issue | null => {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<Issue> & Record<string, unknown>;
  if (typeof candidate.id !== 'string' || typeof candidate.key !== 'string' || typeof candidate.summary !== 'string') {
    return null;
  }

  return {
    ...fallback,
    ...candidate,
    id: candidate.id,
    projectId: typeof candidate.projectId === 'string' ? candidate.projectId : 'p1',
    key: candidate.key,
    summary: candidate.summary,
    description: typeof candidate.description === 'string' ? candidate.description : fallback.description,
    type: normalizeIssueType(candidate.type),
    status: isIssueStatus(candidate.status) ? candidate.status : fallback.status,
    priority: isPriority(candidate.priority) ? candidate.priority : fallback.priority,
    assigneeId: typeof candidate.assigneeId === 'string' || candidate.assigneeId === null ? candidate.assigneeId : fallback.assigneeId,
    reporterId: typeof candidate.reporterId === 'string' ? candidate.reporterId : fallback.reporterId,
    epicId: typeof candidate.epicId === 'string' || candidate.epicId === null ? candidate.epicId : fallback.epicId,
    sprintId: typeof candidate.sprintId === 'string' || candidate.sprintId === null ? candidate.sprintId : fallback.sprintId,
    storyPoints: typeof candidate.storyPoints === 'number' ? candidate.storyPoints : fallback.storyPoints,
    subtasks: Array.isArray(candidate.subtasks) ? candidate.subtasks as SubTask[] : fallback.subtasks,
    comments: Array.isArray(candidate.comments) ? candidate.comments as Issue['comments'] : fallback.comments,
    history: Array.isArray(candidate.history) ? candidate.history as Issue['history'] : fallback.history,
    labels: toStringArray(candidate.labels),
    component: typeof candidate.component === 'string' ? candidate.component : fallback.component,
    dueDate: typeof candidate.dueDate === 'string' ? candidate.dueDate : fallback.dueDate,
    originalEstimate: typeof candidate.originalEstimate === 'number' ? candidate.originalEstimate : fallback.originalEstimate,
    timeLogged: typeof candidate.timeLogged === 'number' ? candidate.timeLogged : fallback.timeLogged,
    createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : fallback.createdAt,
    updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : fallback.updatedAt,
    blockedBy: toStringArray(candidate.blockedBy),
    blocks: toStringArray(candidate.blocks),
    acceptanceCriteria: toStringArray(candidate.acceptanceCriteria),
    testScenarios: Array.isArray(candidate.testScenarios) ? candidate.testScenarios as Issue['testScenarios'] : fallback.testScenarios
  };
};

const normalizeIssueCollection = (value: unknown, fallbackIssues: Issue[]): Issue[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  const fallbackById = new Map(fallbackIssues.map(issue => [issue.id, issue]));
  return value
    .map((entry, index) => {
      const entryRecord = entry as Partial<Issue> | undefined;
      const fallback = (entryRecord?.id && fallbackById.get(entryRecord.id)) ?? fallbackIssues[index] ?? fallbackIssues[0];
      return fallback ? normalizeIssue(entry, fallback) : null;
    })
    .filter((issue): issue is Issue => issue !== null);
};

const normalizeProjectCollection = (value: unknown): Project[] | undefined => {
  if (!Array.isArray(value)) return undefined;

  return value
    .filter((entry): entry is Project => {
      if (!entry || typeof entry !== 'object') return false;
      const candidate = entry as Partial<Project>;
      return (
        typeof candidate.id === 'string' &&
        typeof candidate.key === 'string' &&
        typeof candidate.name === 'string' &&
        typeof candidate.category === 'string' &&
        typeof candidate.avatar === 'string' &&
        typeof candidate.description === 'string'
      );
    })
    .map(project => ({
      ...project,
      key: project.key.toUpperCase(),
      // Project badges are local symbols, never remote image URLs.
      avatar: project.avatar.startsWith('http') || project.avatar.startsWith('data:image') ? '✦' : project.avatar,
    }));
};

const readPersistedState = (): PersistedState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(PREVIOUS_STORAGE_KEY);
    if (!saved) return {};

    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== 'object') return {};

    const data = parsed as Record<string, unknown>;
    return {
      projects: normalizeProjectCollection(data.projects),
      currentProjectId: typeof data.currentProjectId === 'string' ? data.currentProjectId : undefined,
      issues: normalizeIssueCollection(data.issues, initialIssues),
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
  const initialProjectList = persistedState.projects ?? initialProjects;
  const initialIssueList = (persistedState.issues ?? initialIssues).map(issue => ({
    ...issue,
    projectId: issue.projectId || initialProjectList[0].id,
  }));
  const [projects, setProjects] = useState<Project[]>(initialProjectList);
  const [currentProject, setCurrentProject] = useState<Project>(
    initialProjectList.find(project => project.id === persistedState.currentProjectId) ?? initialProjectList[0]
  );
  const [users] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[2]);
  const [allEpics, setEpics] = useState<Epic[]>((persistedState.epics ?? initialEpics).map(epic => ({ ...epic, projectId: epic.projectId || initialProjectList[0].id })));
  const [allSprints, setSprints] = useState<Sprint[]>((persistedState.sprints ?? initialSprints).map(sprint => ({ ...sprint, projectId: sprint.projectId || initialProjectList[0].id })));
  const epics = useMemo(() => allEpics.filter(epic => epic.projectId === currentProject.id), [allEpics, currentProject.id]);
  const sprints = useMemo(() => allSprints.filter(sprint => sprint.projectId === currentProject.id), [allSprints, currentProject.id]);
  const [allIssues, setIssues] = useState<Issue[]>(initialIssueList);
  const issues = useMemo(
    () => allIssues.filter(issue => issue.projectId === currentProject.id),
    [allIssues, currentProject.id],
  );
  const [automationRules, setAutomationRules] = useState(
    persistedState.automationRules ?? initialAutomationRules
  );
  const [automationAuditLogs, setAutomationAuditLogs] = useState(
    persistedState.automationAuditLogs ?? initialAutomationAuditLogs
  );
  const [retrospectiveItems, setRetrospectiveItems] = useState<RetrospectiveItem[]>(
    persistedState.retrospectiveItems ?? initialRetrospectiveItems
  );

  const [viewMode, setViewMode] = useState<ViewMode>('my-work');
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
        projects,
        currentProjectId: currentProject.id,
        issues: allIssues,
        sprints: allSprints,
        epics: allEpics,
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
  }, [projects, currentProject.id, allIssues, allSprints, allEpics, automationRules, retrospectiveItems, automationAuditLogs, theme, language, accentColor]);

  useEffect(() => {
    if (projects.some(project => project.id === currentProject.id)) return;
    setCurrentProject(projects[0] ?? initialProjects[0]);
  }, [projects, currentProject.id]);

  // Apply Theme attribute to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // -- Supabase Integration: Initial Data Fetch & Real-time WebSockets Subscription --
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Fetch initial issues & retro items from Supabase
    fetchIssuesFromSupabase().then((dbIssues) => {
      if (dbIssues.length > 0) {
        setIssues(dbIssues.map(issue => ({ ...issue, projectId: issue.projectId || currentProject.id })));
      } else {
        // If DB is empty, seed initial issues to Supabase
        initialIssues.forEach((issue) => syncIssueToSupabase(issue, currentProject.id));
      }
    });

    fetchRetroFromSupabase().then((dbRetro) => {
      if (dbRetro.length > 0) {
        setRetrospectiveItems(dbRetro);
      }
    });

    // Real-time WebSockets Subscriptions
    const unsubscribeIssues = subscribeToTable('issues', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const updatedIssue = mapDbToIssue(payload.new);
        setIssues((prev) => {
          const index = prev.findIndex((i) => i.id === updatedIssue.id);
          if (index >= 0) {
            const next = [...prev];
            next[index] = { ...next[index], ...updatedIssue };
            return next;
          }
          return [updatedIssue, ...prev];
        });
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) {
          setIssues((prev) => prev.filter((i) => i.id !== deletedId));
        }
      }
    });

    const unsubscribeRetro = subscribeToTable('retrospective_items', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const updatedItem = mapDbToRetroItem(payload.new);
        setRetrospectiveItems(previous => {
          const index = previous.findIndex(item => item.id === updatedItem.id);
          if (index < 0) return [updatedItem, ...previous];
          const next = [...previous];
          next[index] = updatedItem;
          return next;
        });
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) setRetrospectiveItems(previous => previous.filter(item => item.id !== deletedId));
      }
    });

    return () => {
      unsubscribeIssues();
      unsubscribeRetro();
    };
  }, [currentProject.id]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const createProject = (projectData: Omit<Project, 'id'>): Project => {
    const createdProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      boardTitle: projectData.boardTitle?.trim() || `${projectData.name} (Active)`
    };

    setProjects(prev => [createdProject, ...prev]);
    setCurrentProject(createdProject);
    return createdProject;
  };

  const updateProject = (projectId: string, updates: Partial<Omit<Project, 'id'>>) => {
    setProjects(previousProjects => previousProjects.map(project => (
      project.id === projectId ? { ...project, ...updates } : project
    )));
    setCurrentProject(previousProject => (
      previousProject.id === projectId ? { ...previousProject, ...updates } : previousProject
    ));
  };

  const deleteProject = (projectId: string): boolean => {
    if (projects.length <= 1) return false;

    const remainingProjects = projects.filter(project => project.id !== projectId);
    setProjects(remainingProjects);
    if (currentProject.id === projectId) {
      setCurrentProject(remainingProjects[0]);
    }
    return true;
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
    const updatedIssue = {
      ...issue,
      status: newStatus,
      updatedAt: now
    };

    setIssues(prev =>
      prev.map(item =>
        item.id === issueId ? updatedIssue : item
      )
    );

    syncIssueToSupabase(updatedIssue, currentProject.id);

    if (newStatus === 'done') recordDoneStatusAutomation();
  };

  const createIssue = (issueData: Partial<Issue>) => {
    const maxNum = issues.reduce((max, i) => Math.max(max, parseInt(i.key.split('-')[1]) || 0), 100);
    const key = `${currentProject.key}-${maxNum + 1}`;
    const now = new Date().toISOString();

    const newIssue: Issue = {
      id: 'issue_' + Date.now(),
      projectId: currentProject.id,
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
    syncIssueToSupabase(newIssue, currentProject.id);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates, updatedAt: new Date().toISOString() };
          syncIssueToSupabase(updated, currentProject.id);
          return updated;
        }
        return item;
      })
    );
  };

  const deleteIssue = (id: string) => {
    setIssues(prev => prev.filter(item => item.id !== id));
    deleteIssueFromSupabase(id);
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
      projectId: currentProject.id,
      name,
      goal,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'future'
    };
    setSprints(prev => [...prev, newSprint]);
  };

  const updateSprint = (sprintId: string, updates: Partial<Omit<Sprint, 'id' | 'projectId'>>) => {
    setSprints(previousSprints => previousSprints.map(sprint => (
      sprint.id === sprintId ? { ...sprint, ...updates } : sprint
    )));
  };

  const deleteSprint = (sprintId: string) => {
    setSprints(previousSprints => previousSprints.filter(sprint => sprint.id !== sprintId));
    setIssues(previousIssues => previousIssues.map(issue => (
      issue.sprintId === sprintId ? { ...issue, sprintId: null } : issue
    )));
  };

  const createEpic = (summary: string) => {
    const nextNumber = epics.reduce((max, epic) => Math.max(max, Number(epic.key.split('E')[1]) || 0), 0) + 1;
    const newEpic: Epic = {
      id: `epic_${Date.now()}`,
      projectId: currentProject.id,
      key: `${currentProject.key}-E${nextNumber}`,
      summary,
      color: '#6366f1',
    };
    setEpics(previousEpics => [...previousEpics, newEpic]);
    return newEpic;
  };

  const updateEpic = (epicId: string, updates: Partial<Omit<Epic, 'id' | 'projectId'>>) => {
    setEpics(previousEpics => previousEpics.map(epic => epic.id === epicId ? { ...epic, ...updates } : epic));
  };

  const deleteEpic = (epicId: string) => {
    setEpics(previousEpics => previousEpics.filter(epic => epic.id !== epicId));
    setIssues(previousIssues => previousIssues.map(issue => issue.epicId === epicId ? { ...issue, epicId: null } : issue));
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

  const deleteAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
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

  const addRetroItem = (type: 'went_well' | 'to_improve' | 'action_item', content: string, assigneeId: string | null = null) => {
    const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
    const newItem: RetrospectiveItem = {
      id: `retro-${Date.now()}`,
      type,
      content,
      votes: 1,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: type === 'action_item' ? 'planned' : undefined,
      assigneeId,
      comments: [],
      voterIds: [currentUser.id]
    };
    setRetrospectiveItems(prev => [newItem, ...prev]);
    syncRetroToSupabase(newItem, currentProject.id, activeSprint?.id || 'sprint-1');
  };

  const voteRetroItem = (id: string) => {
    const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
    setRetrospectiveItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          if ((item.voterIds || []).includes(currentUser.id)) return item;
          const updated = { ...item, votes: item.votes + 1, voterIds: [...(item.voterIds || []), currentUser.id] };
          syncRetroToSupabase(updated, currentProject.id, activeSprint?.id || 'sprint-1');
          return updated;
        }
        return item;
      })
    );
  };

  const updateRetroItem = (id: string, updates: Partial<Omit<RetrospectiveItem, 'id' | 'authorId' | 'createdAt'>>) => {
    const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
    setRetrospectiveItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      syncRetroToSupabase(updated, currentProject.id, activeSprint?.id || 'sprint-1');
      return updated;
    }));
  };

  const addRetroComment = (id: string, text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
    setRetrospectiveItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated: RetrospectiveItem = {
        ...item,
        comments: [
          ...(item.comments || []),
          { id: `retro-comment-${Date.now()}`, authorId: currentUser.id, text: cleanText, createdAt: new Date().toISOString() }
        ]
      };
      syncRetroToSupabase(updated, currentProject.id, activeSprint?.id || 'sprint-1');
      return updated;
    }));
  };

  const deleteRetroItem = (id: string) => {
    setRetrospectiveItems(prev => prev.filter(item => item.id !== id));
  };

  const resetDemoData = () => {
    setIssues(initialIssues.map(issue => ({ ...issue, projectId: initialProjects[0].id })));
    setProjects(initialProjects);
    setSprints(initialSprints.map(sprint => ({ ...sprint, projectId: initialProjects[0].id })));
    setEpics(initialEpics.map(epic => ({ ...epic, projectId: initialProjects[0].id })));
    setAutomationRules(initialAutomationRules);
    setRetrospectiveItems(initialRetrospectiveItems);
    setAutomationAuditLogs(initialAutomationAuditLogs);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREVIOUS_STORAGE_KEY);
  };

  const exportDataJSON = () => {
    return JSON.stringify({ projects, issues: allIssues, sprints: allSprints, epics: allEpics, automationRules, retrospectiveItems }, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      const parsed: unknown = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;

      const data = parsed as Record<string, unknown>;
      let importedSectionCount = 0;

      const normalizedProjects = normalizeProjectCollection(data.projects);
      if (normalizedProjects && normalizedProjects.length > 0) {
        setProjects(normalizedProjects);
        setCurrentProject(normalizedProjects[0]);
        importedSectionCount += 1;
      }

      const normalizedIssues = normalizeIssueCollection(data.issues, initialIssues);
      if (normalizedIssues && normalizedIssues.length > 0) {
        setIssues(normalizedIssues);
        importedSectionCount += 1;
      }
      if (Array.isArray(data.sprints)) {
        setSprints((data.sprints as Sprint[]).map(sprint => ({ ...sprint, projectId: sprint.projectId || initialProjectList[0].id })));
        importedSectionCount += 1;
      }
      if (Array.isArray(data.epics)) {
        setEpics((data.epics as Epic[]).map(epic => ({ ...epic, projectId: epic.projectId || initialProjectList[0].id })));
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
        createProject,
        updateProject,
        deleteProject,
        users,
        epics,
        createEpic,
        updateEpic,
        deleteEpic,
        sprints,
        issues,
        portfolioIssues: allIssues,
        automationRules,
        automationAuditLogs,
        retrospectiveItems,
        viewMode,
        setViewMode,
        addRetroItem,
        voteRetroItem,
        updateRetroItem,
        addRetroComment,
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
        updateSprint,
        deleteSprint,
        toggleAutomationRule,
        addAutomationRule,
        deleteAutomationRule,
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
