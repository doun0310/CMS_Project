import React, { useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  Epic,
  Sprint,
  Issue,
  AutomationRule,
  AutomationAuditLog,
  AppNotification,
  Priority,
  ProjectRole,
  Project,
  RetrospectiveItem,
  User
} from '../types/Aether';
import {
  initialUsers,
  initialProjects,
  initialSprints,
  initialEpics,
  initialIssues,
  initialAutomationRules,
  initialRetrospectiveItems,
  initialAutomationAuditLogs
} from '../mock/AetherData';
import type { Language } from '../i18n/translations';
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
import { can } from '../utils/permissions';
import { UIProvider } from './UIContext';
import { useUIState } from '../hooks/useUIState';

// ─── Persistence Helpers ──────────────────────────────────────────────

const STORAGE_KEY = 'AETHER_PULSE_APP_DATA_V1';
// Read the previous product key once so existing users keep their local workspace data.
const PREVIOUS_STORAGE_KEY = 'JIRA_VERSE_APP_DATA_V1';

import type { IssueStatus } from '../types/Aether';

interface PersistedState {
  users?: User[];
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

const isProjectRole = (value: unknown): value is ProjectRole =>
  value === 'Project Owner' || value === 'Project Manager' || value === 'Project Member' || value === 'Viewer';

const fromDatabaseProjectRole = (role: unknown): ProjectRole => {
  if (role === 'project_owner') return 'Project Owner';
  if (role === 'project_manager') return 'Project Manager';
  if (role === 'project_member') return 'Project Member';
  return 'Viewer';
};

const toDatabaseProjectRole = (role: ProjectRole): 'viewer' | 'project_member' | 'project_manager' | 'project_owner' => {
  if (role === 'Project Owner') return 'project_owner';
  if (role === 'Project Manager') return 'project_manager';
  if (role === 'Project Member') return 'project_member';
  return 'viewer';
};

const toWorkspaceUser = (user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User => ({
  id: user.id,
  name: typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : user.email?.split('@')[0] || 'User',
  email: user.email || '',
  avatar: typeof user.user_metadata?.avatar_url === 'string'
    ? user.user_metadata.avatar_url
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  projectRole: isProjectRole(user.user_metadata?.project_role)
    ? user.user_metadata.project_role
    : 'Viewer',
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
      users: Array.isArray(data.users) ? data.users as User[] : undefined,
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

const AetherProviderContent: React.FC<{ children: ReactNode; persistedState: PersistedState }> = ({ children, persistedState }) => {
  const ui = useUIState();
  const { theme, toggleTheme, accentColor, setAccentColor, language, setLanguage, t, viewMode, setViewMode, searchQuery, setSearchQuery, onlyMyIssues, setOnlyMyIssues, selectedEpicId, setSelectedEpicId, selectedType, setSelectedType, selectedPriority, setSelectedPriority, selectedLabel, setSelectedLabel, selectedLabels, setSelectedLabels, toggleSelectedLabel, clearSelectedLabels, selectedIssueId, setSelectedIssueId, isCreateModalOpen, setIsCreateModalOpen } = ui;

  useEffect(() => {
    document.documentElement.style.setProperty('--color-in-progress', accentColor);
    document.documentElement.style.setProperty('--border-focus', accentColor);
  }, [accentColor]);

  const initialProjectList = (persistedState.projects ?? initialProjects).map(project => ({
    ...project,
    remoteId: project.remoteId ?? initialProjects.find(initial => initial.key === project.key)?.remoteId,
  }));
  const initialIssueList = (persistedState.issues ?? initialIssues).map(issue => ({
    ...issue,
    projectId: issue.projectId || initialProjectList[0].id,
    epicId: issue.epicId ?? null,
    initiativeId: issue.initiativeId ?? null,
  }));

  const [projects, setProjects] = useState<Project[]>(initialProjectList);
  const [currentProject, setCurrentProject] = useState<Project>(
    initialProjectList.find(project => project.id === persistedState.currentProjectId) ?? initialProjectList[0]
  );
  const [users, setUsers] = useState<User[]>(() => {
    const raw: User[] = persistedState.users ?? initialUsers;
    return raw.map(u => u.id === 'u1' ? { ...u, projectRole: 'Project Owner', role: 'Project Owner' } : u);
  });

  const [signedInAccounts, setSignedInAccounts] = useState<User[]>(() => {
    let list: User[] = [];
    try {
      const saved = localStorage.getItem('aether_signed_in_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch {}
    if (list.length === 0) {
      const baseUsers = persistedState.users ?? initialUsers;
      list = [baseUsers[0], baseUsers[2], baseUsers[3]];
    }
    if (!list.some(a => a.id === 'u1')) {
      list = [initialUsers[0], ...list];
    }
    return list.map(u => u.id === 'u1' ? { ...u, projectRole: 'Project Owner', role: 'Project Owner' } : u);
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const baseUsers = persistedState.users ?? initialUsers;
    try {
      const savedId = localStorage.getItem('aether_active_account_id');
      if (savedId) {
        const found = baseUsers.find(u => u.id === savedId);
        if (found) return found;
      }
    } catch {}
    return baseUsers[0];
  });

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(isSupabaseConfigured);
  const authenticatedUserId = authUser?.id;

  const switchAccount = (user: User) => {
    const latest = users.find(u => u.id === user.id) || user;
    setCurrentUser(latest);
    try {
      localStorage.setItem('aether_active_account_id', user.id);
    } catch {}
    addNotification({
      kind: 'system',
      title: '계정 전환',
      text: `계정이 전환되었습니다: ${latest.name} (${latest.email})`
    });
  };

  const addSignedInAccount = (account: User) => {
    setSignedInAccounts(prev => {
      const exists = prev.some(a => a.id === account.id || a.email === account.email);
      const updated = exists
        ? prev.map(a => (a.id === account.id || a.email === account.email ? account : a))
        : [...prev, account];
      try {
        localStorage.setItem('aether_signed_in_accounts', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setUsers(prev => {
      if (prev.some(u => u.id === account.id)) return prev;
      return [...prev, account];
    });

    switchAccount(account);
  };

  const updateAccountProjectRole = async (accountId: string, projectRole: User['projectRole']): Promise<boolean> => {
    if (!projectRole || !isProjectRole(projectRole)) return false;
    if (!can(currentUser, 'team:manage')) {
      addNotification({ kind: 'system', title: '권한 없음', text: '프로젝트 권한은 Project Owner만 변경할 수 있습니다.' });
      return false;
    }
    const applyRole = (account: User) => account.id === accountId ? { ...account, projectRole, role: projectRole } : account;

    // Server-side membership sync when Supabase is configured
    if (isSupabaseConfigured && currentProject.remoteId && /^[0-9a-f]{8}-/i.test(accountId)) {
      try {
        const { error } = await supabase.functions.invoke('manage-project-member', {
          body: { projectId: currentProject.remoteId, userId: accountId, role: toDatabaseProjectRole(projectRole) }
        });
        if (error) {
          console.warn('Supabase Edge Function invoke warning:', error.message);
          addNotification({
            kind: 'system',
            title: '클라우드 동기화 대기',
            text: `서버 연동 대기 중 - 로컬 세션 권한이 ${projectRole}(으)로 정상 변경되었습니다.`
          });
        }
      } catch (err) {
        console.warn('Supabase Edge Function invocation failed:', err);
      }
    }

    setSignedInAccounts(prev => {
      const updated = prev.map(applyRole);
      try {
        localStorage.setItem('aether_signed_in_accounts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setUsers(prev => prev.map(applyRole));
    setCurrentUser(prev => applyRole(prev));
    setAuthUser(prev => prev ? applyRole(prev) : null);

    addNotification({ kind: 'system', title: '프로젝트 권한 변경', text: `프로젝트 권한이 ${projectRole}(으)로 변경되었습니다.` });
    return true;
  };

  const removeAccount = (accountId: string) => {
    setSignedInAccounts(prev => {
      const updated = prev.filter(a => a.id !== accountId);
      try {
        localStorage.setItem('aether_signed_in_accounts', JSON.stringify(updated));
      } catch {}
      if (currentUser.id === accountId && updated.length > 0) {
        setCurrentUser(updated[0]);
      }
      return updated;
    });
  };

  const signOutAllAccounts = () => {
    setSignedInAccounts([]);
    try {
      localStorage.removeItem('aether_signed_in_accounts');
      localStorage.removeItem('aether_active_account_id');
    } catch {}
    setCurrentUser(initialUsers[0]);
  };

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
      if (nextAuthUser) {
        setUsers(prev => {
          const exists = prev.some(u => u.id === nextAuthUser.id || u.email === nextAuthUser.email);
          if (exists) {
            return prev.map(u => (u.id === nextAuthUser.id || u.email === nextAuthUser.email ? nextAuthUser : u));
          }
          return [...prev, nextAuthUser];
        });
      }
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

  // Auth metadata is not trusted for authorization. Load the current user's
  // project role from the RLS-protected membership table instead.
  useEffect(() => {
    if (!isSupabaseConfigured || !authenticatedUserId || !currentProject.remoteId) return;
    let cancelled = false;

    supabase
      .from('project_members')
      .select('role')
      .eq('project_id', currentProject.remoteId)
      .eq('user_id', authenticatedUserId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const projectRole = fromDatabaseProjectRole(data.role);
        const applyRole = (user: User) => user.id === authenticatedUserId ? { ...user, projectRole } : user;
        setAuthUser(previous => previous ? applyRole(previous) : null);
        setCurrentUser(previous => applyRole(previous));
        setUsers(previous => previous.map(applyRole));
        setSignedInAccounts(previous => previous.map(applyRole));
      });

    return () => { cancelled = true; };
  }, [authenticatedUserId, currentProject.remoteId]);

  const [allEpics, setEpics] = useState<Epic[]>(() => {
    const raw: Epic[] = persistedState.epics ?? initialEpics;
    return raw.map((epic: Epic) => {
      const defaultProject = epic.id.includes('mobile') ? 'p2' : epic.id.includes('ops') ? 'p3' : 'p1';
      return { ...epic, projectId: epic.projectId || defaultProject };
    });
  });
  const [allSprints, setSprints] = useState<Sprint[]>(() => {
    const raw: Sprint[] = persistedState.sprints ?? initialSprints;
    return raw.map((sprint: Sprint) => {
      const defaultProject = sprint.id.includes('mobile') ? 'p2' : sprint.id.includes('ops') ? 'p3' : 'p1';
      return { ...sprint, projectId: sprint.projectId || defaultProject };
    });
  });
  const epics = useMemo(() => allEpics.filter(epic => !epic.projectId || epic.projectId === currentProject.id), [allEpics, currentProject.id]);
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
  const [allRetrospectiveItems, setRetrospectiveItems] = useState<RetrospectiveItem[]>(() => {
    const raw = (persistedState.retrospectiveItems ?? initialRetrospectiveItems) as RetrospectiveItem[];
    return raw.map(item => ({
      ...item,
      projectId: item.projectId || initialProjectList[0].id,
    }));
  });

  const retrospectiveItems = useMemo(
    () => allRetrospectiveItems.filter(item => item.projectId === currentProject.id),
    [allRetrospectiveItems, currentProject.id]
  );

  // UI State is now delegated to UIProvider via useUIState()

  // ── Domain Hooks ──────────────────────────────────────────────────

  const automationActions = useAutomationActions({
    automationRules,
    setAutomationRules,
    setAutomationAuditLogs,
    issues,
    currentUser,
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
    currentUser,
    notify: addNotification,
  });

  const epicActions = useEpicActions({
    epics: allEpics,
    setEpics,
    setIssues,
    currentProject,
    currentUser,
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
    currentUser,
    authUserId: authenticatedUserId,
  });

  // ── Persistence ───────────────────────────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stateToSave = {
          users,
          projects,
          currentProjectId: currentProject.id,
          issues: allIssues,
          sprints: allSprints,
          epics: allEpics,
          automationRules,
          retrospectiveItems: allRetrospectiveItems,
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
    }, 300);

    return () => clearTimeout(timer);
  }, [users, projects, currentProject.id, allIssues, allSprints, allEpics, automationRules, allRetrospectiveItems, automationAuditLogs, notifications, theme, language, accentColor]);

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

    // Parallel data fetch (Promise.all) for optimized initial payload loading speed
    Promise.all([
      fetchIssuesFromSupabase(),
      fetchRetroFromSupabase()
    ]).then(([dbIssues, dbRetro]) => {
      if (dbIssues.length > 0) {
        setIssues(dbIssues.map(issue => ({ ...issue, projectId: issue.projectId || currentProject.id })));
      } else {
        // If DB is empty, seed initial issues to Supabase
        initialIssues
          .filter(issue => issue.projectId === currentProject.id)
          .forEach((issue) => syncIssueToSupabase(issue, currentProject.remoteId ?? currentProject.id));
      }

      if (dbRetro.length > 0) {
        setRetrospectiveItems(dbRetro);
      }
    }).catch(err => {
      console.warn('Parallel Supabase fetch error:', err);
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

    const unsubscribeSprints = subscribeToTable('sprints', (payload) => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const row = payload.new as Record<string, unknown>;
        const sprint: Sprint = {
          id: row.id as string,
          projectId: row.project_id as string,
          name: (row.name as string) || 'Sprint',
          goal: (row.goal as string) || '',
          startDate: (row.start_date as string) || '',
          endDate: (row.end_date as string) || '',
          status: (row.status === 'active' ? 'active' : row.status === 'completed' ? 'completed' : 'future') as Sprint['status'],
        };
        setSprints(prev => {
          const idx = prev.findIndex(s => s.id === sprint.id);
          if (idx >= 0) { const next = [...prev]; next[idx] = sprint; return next; }
          return [sprint, ...prev];
        });
      } else if (payload.eventType === 'DELETE') {
        const deletedId = payload.old?.id;
        if (deletedId) setSprints(prev => prev.filter(s => s.id !== deletedId));
      }
    });

    return () => {
      unsubscribeIssues();
      unsubscribeRetro();
      unsubscribeSprints();
    };
  }, [currentProject.id, currentProject.remoteId]);

  // ── Misc Actions ──────────────────────────────────────────────────

  const resetDemoData = () => {
    if (!can(currentUser, 'team:manage')) {
      addNotification({ kind: 'system', title: '권한 없음', text: '프로젝트 데이터 초기화는 Project Owner만 실행할 수 있습니다.' });
      return;
    }
    setIssues(initialIssues);
    setProjects(initialProjects);
    setSprints(initialSprints);
    setEpics([]);
    setAutomationRules(initialAutomationRules);
    setRetrospectiveItems(initialRetrospectiveItems);
    setAutomationAuditLogs(initialAutomationAuditLogs);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREVIOUS_STORAGE_KEY);
  };

  const exportDataJSON = () => {
    return JSON.stringify({ projects, issues: allIssues, sprints: allSprints, epics: allEpics, automationRules, retrospectiveItems: allRetrospectiveItems }, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    if (!can(currentUser, 'team:manage')) {
      addNotification({ kind: 'system', title: '권한 없음', text: '프로젝트 데이터 복원은 Project Owner만 실행할 수 있습니다.' });
      return false;
    }
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
        setRetrospectiveItems((data.retrospectiveItems as RetrospectiveItem[]).map(item => ({ ...item, projectId: item.projectId || initialProjectList[0].id })));
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

  const contextValue = useMemo(() => ({
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
    selectedLabels,
    setSelectedLabels,
    toggleSelectedLabel,
    clearSelectedLabels,
    currentUser,
    setCurrentUser,
    signedInAccounts,
    switchAccount,
    addSignedInAccount,
    updateAccountProjectRole,
    removeAccount,
    signOutAllAccounts,
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
  }), [
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
    projectActions,
    users,
    authUser,
    isAuthLoading,
    epics,
    epicActions,
    sprints,
    issues,
    allIssues,
    automationRules,
    automationAuditLogs,
    notifications,
    retrospectiveItems,
    viewMode,
    setViewMode,
    retroActions,
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
    selectedLabels,
    setSelectedLabels,
    toggleSelectedLabel,
    clearSelectedLabels,
    currentUser,
    setCurrentUser,
    signedInAccounts,
    selectedIssueId,
    setSelectedIssueId,
    isCreateModalOpen,
    setIsCreateModalOpen,
    issueActions,
    sprintActions,
    automationActions
  ]);

  return (
    <AetherContext.Provider value={contextValue}>
      {children}
    </AetherContext.Provider>
  );
};

export const AetherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [persistedState] = useState(readPersistedState);
  return (
    <UIProvider
      initialTheme={persistedState.theme}
      initialLanguage={persistedState.language}
      initialAccentColor={persistedState.accentColor}
    >
      <AetherProviderContent persistedState={persistedState}>{children}</AetherProviderContent>
    </UIProvider>
  );
};
