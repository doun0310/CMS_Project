import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  Epic,
  Sprint,
  Issue,
  AutomationRule,
  AutomationAuditLog,
  AppNotification,
  IssueType,
  Priority,
  Project,
  RetrospectiveItem,
  User,
  ViewMode
} from '../types/Aether';
import {
  initialUsers,
  initialProjects,
  initialSprints,
  initialIssues,
  initialAutomationRules,
  initialRetrospectiveItems,
  initialAutomationAuditLogs
} from '../mock/AetherData';
import { translations, type Language } from '../i18n/translations';
import { AetherContext } from './AetherContextValue';
import { isSupabaseConfigured, subscribeToTable, supabase } from '../services/supabase';
import {
  fetchIssuesFromSupabase,
  syncIssueToSupabase,
  fetchRetroFromSupabase,
  mapDbToIssue,
  mapDbToRetroItem
} from '../services/supabaseSync';

// Domain-specific hooks — keep provider lean
import { useIssueActions } from '../hooks/useIssueActions';
import { useSprintActions } from '../hooks/useSprintActions';
import { useEpicActions } from '../hooks/useEpicActions';
import { useRetroActions } from '../hooks/useRetroActions';
import { useAutomationActions } from '../hooks/useAutomationActions';
import { useProjectActions } from '../hooks/useProjectActions';

// ─── Persistence Helpers ──────────────────────────────────────────────

const STORAGE_KEY = 'AETHER_PULSE_APP_DATA_V1';
// Read the previous product key once so existing users keep their local workspace data.
const PREVIOUS_STORAGE_KEY = 'JIRA_VERSE_APP_DATA_V1';

import type { IssueStatus } from '../types/Aether';

interface PersistedState {
  projects?: Project[];
  currentProjectId?: string;
  issues?: Issue[];
  sprints?: Sprint[];
  epics?: Epic[];
  automationRules?: AutomationRule[];
  retrospectiveItems?: RetrospectiveItem[];
  automationAuditLogs?: AutomationAuditLog[];
  notifications?: AppNotification[];
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

const toWorkspaceUser = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User => ({
  id: user.id,
  name: typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : user.email?.split('@')[0] || 'User',
  email: user.email || '',
  avatar: typeof user.user_metadata?.avatar_url === 'string'
    ? user.user_metadata.avatar_url
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : 'Team Member',
});

import type { IssueType as IssueTypeAlias, SubTask } from '../types/Aether';

const normalizeIssueType = (value: unknown): IssueTypeAlias => {
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

// ─── Provider ─────────────────────────────────────────────────────────

export const AetherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ── Core State ────────────────────────────────────────────────────
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
    epicId: null,
    initiativeId: issue.initiativeId ?? null,
  }));

  const [projects, setProjects] = useState<Project[]>(initialProjectList);
  const [currentProject, setCurrentProject] = useState<Project>(
    initialProjectList.find(project => project.id === persistedState.currentProjectId) ?? initialProjectList[0]
  );
  const [users] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[2]);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthUser(null);
      setIsAuthLoading(false);
      return;
    }

    let isMounted = true;
    const applySession = (session: { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } } | null) => {
      if (!isMounted) return;
      const nextAuthUser = session ? toWorkspaceUser(session.user) : null;
      setAuthUser(nextAuthUser);
      setCurrentUser(nextAuthUser ?? initialUsers[2]);
      setIsAuthLoading(false);
    };

    supabase.auth.getSession()
      .then(({ data: { session } }) => applySession(session))
      .catch(() => applySession(null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => applySession(session));
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const [allEpics, setEpics] = useState<Epic[]>([]);
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
  const [notifications, setNotifications] = useState<AppNotification[]>(persistedState.notifications ?? []);

  const addNotification = (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const entry: AppNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(previous => [entry, ...previous].slice(0, 50));
  };

  const markNotificationsRead = () => {
    setNotifications(previous => previous.map(notification => ({ ...notification, read: true })));
  };

  const clearNotifications = () => setNotifications([]);
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

  // ── Domain Hooks ──────────────────────────────────────────────────

  const automationActions = useAutomationActions({
    automationRules,
    setAutomationRules,
    setAutomationAuditLogs,
    issues,
  });

  const issueActions = useIssueActions({
    allIssues,
    setIssues,
    currentProject,
    currentUser,
    sprints,
    selectedIssueId,
    setSelectedIssueId,
    onDoneStatusAutomation: automationActions.recordDoneStatusAutomation,
    notify: addNotification,
  });

  const sprintActions = useSprintActions({
    setSprints,
    setIssues,
    currentProject,
    sprints,
    notify: addNotification,
  });

  const epicActions = useEpicActions({
    epics: allEpics,
    setEpics,
    setIssues,
    currentProject,
  });

  const retroActions = useRetroActions({
    setRetrospectiveItems,
    currentUser,
    currentProject,
    sprints,
  });

  const projectActions = useProjectActions({
    projects,
    setProjects,
    setCurrentProject,
  });

  // ── Persistence ───────────────────────────────────────────────────

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
        notifications,
        theme,
        language,
        accentColor
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      localStorage.removeItem(PREVIOUS_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }, [projects, currentProject.id, allIssues, allSprints, allEpics, automationRules, retrospectiveItems, automationAuditLogs, notifications, theme, language, accentColor]);

  useEffect(() => {
    if (projects.some(project => project.id === currentProject.id)) return;
    setCurrentProject(projects[0] ?? initialProjects[0]);
  }, [projects, currentProject.id]);

  // Apply Theme attribute to body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Supabase Realtime ─────────────────────────────────────────────

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

  // ── Misc Actions ──────────────────────────────────────────────────

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const resetDemoData = () => {
    setIssues(initialIssues.map(issue => ({ ...issue, projectId: initialProjects[0].id })));
    setProjects(initialProjects);
    setSprints(initialSprints.map(sprint => ({ ...sprint, projectId: initialProjects[0].id })));
    setEpics([]);
    setAutomationRules(initialAutomationRules);
    setRetrospectiveItems(initialRetrospectiveItems);
    setAutomationAuditLogs(initialAutomationAuditLogs);
    setNotifications([]);
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

  // ── Context Value ─────────────────────────────────────────────────

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
        ...projectActions,
        users,
        authUser,
        isAuthLoading,
        epics,
        ...epicActions,
        sprints,
        issues,
        portfolioIssues: allIssues,
        automationRules,
        automationAuditLogs,
        notifications,
        addNotification,
        markNotificationsRead,
        clearNotifications,
        retrospectiveItems,
        viewMode,
        setViewMode,
        ...retroActions,
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
        ...issueActions,
        ...sprintActions,
        toggleAutomationRule: automationActions.toggleAutomationRule,
        addAutomationRule: automationActions.addAutomationRule,
        deleteAutomationRule: automationActions.deleteAutomationRule,
        runAutomationRule: automationActions.runAutomationRule,
        resetDemoData,
        exportDataJSON,
        importDataJSON
      }}
    >
      {children}
    </AetherContext.Provider>
  );
};
