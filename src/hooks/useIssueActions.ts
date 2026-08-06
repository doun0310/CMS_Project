import type { AppNotification, Issue, IssueStatus, SubTask, Sprint, User, Project } from '../types/Aether';
import { syncIssueToSupabase, deleteIssueFromSupabase } from '../services/supabaseSync';
import type { Dispatch, SetStateAction } from 'react';
import { can } from '../utils/permissions';

interface UseIssueActionsParams {
  allIssues: Issue[];
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
  currentUser: User;
  sprints: Sprint[];
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  onDoneStatusAutomation: (targetKey?: string) => void;
  notify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

export function useIssueActions({
  allIssues,
  setIssues,
  currentProject,
  currentUser,
  sprints,
  selectedIssueId,
  setSelectedIssueId,
  onDoneStatusAutomation,
  notify,
}: UseIssueActionsParams) {
  const issues = allIssues.filter(issue => issue.projectId === currentProject.id);
  const deny = () => notify({ kind: 'system', title: '권한 없음', text: '현재 프로젝트 역할로는 작업을 변경할 수 없습니다.' });

  const moveIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    if (!can(currentUser, 'issue:write')) return deny();
    const issue = issues.find(item => item.id === issueId);
    if (!issue || issue.status === newStatus) return;

    const previousIssue = { ...issue };
    const now = new Date().toISOString();
    const updatedIssue = {
      ...issue,
      status: newStatus,
      updatedAt: now
    };

    // Optimistic UI update: Immediate 0ms local state change
    setIssues(prev =>
      prev.map(item =>
        item.id === issueId ? updatedIssue : item
      )
    );

    // Sync to backend; rollback on network/server error
    syncIssueToSupabase(updatedIssue, currentProject.remoteId ?? currentProject.id, (_err) => {
      setIssues(prev =>
        prev.map(item =>
          item.id === issueId ? previousIssue : item
        )
      );
      notify({
        kind: 'system',
        title: '동기화 실패',
        text: `${issue.key} 상태 변경이 서버에 저장되지 않아 이전 상태로 복구되었습니다.`,
      });
    });

    notify({
      kind: 'issue',
      title: '작업 상태 변경',
      text: `${issue.key} · ${issue.summary} 작업의 상태가 변경되었습니다.`,
      issueId: issue.id,
    });

    if (newStatus === 'done') onDoneStatusAutomation(issue.key);
  };

  const createIssue = (issueData: Partial<Issue>) => {
    if (!can(currentUser, 'issue:write')) return deny();
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
    syncIssueToSupabase(newIssue, currentProject.remoteId ?? currentProject.id);
    notify({ kind: 'issue', title: '새 작업 생성', text: `${newIssue.key} · ${newIssue.summary} 작업이 생성되었습니다.`, issueId: newIssue.id });
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    if (!can(currentUser, 'issue:write')) return deny();
    const issue = issues.find(item => item.id === id);
    if (!issue) return;

    const previousIssue = { ...issue };
    const updated = { ...issue, ...updates, updatedAt: new Date().toISOString() };

    // Optimistic UI update
    setIssues(prev =>
      prev.map(item => (item.id === id ? updated : item))
    );

    syncIssueToSupabase(updated, currentProject.remoteId ?? currentProject.id, (_err) => {
      setIssues(prev =>
        prev.map(item => (item.id === id ? previousIssue : item))
      );
      notify({
        kind: 'system',
        title: '동기화 실패',
        text: `${issue.key} 변경사항이 서버에 저장되지 않아 이전 정보로 복구되었습니다.`,
      });
    });

    notify({ kind: 'issue', title: '작업 변경', text: `${issue.key} · ${issue.summary} 작업의 정보가 변경되었습니다.`, issueId: id });
  };

  const deleteIssue = (id: string) => {
    if (!can(currentUser, 'issue:delete')) return deny();
    setIssues(prev => prev.filter(item => item.id !== id));
    deleteIssueFromSupabase(id);
    if (selectedIssueId === id) setSelectedIssueId(null);
  };

  const addComment = (issueId: string, text: string) => {
    if (!can(currentUser, 'issue:write')) return deny();
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
    const issue = issues.find(item => item.id === issueId);
    if (issue) notify({ kind: 'comment', title: '새 댓글', text: `${issue.key} 작업에 새 댓글이 등록되었습니다.`, issueId });
  };

  const toggleSubtask = (issueId: string, subtaskId: string) => {
    if (!can(currentUser, 'issue:write')) return deny();
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
    if (!can(currentUser, 'issue:write')) return deny();
    if (!title.trim()) return;
    const newSub: SubTask = { id: 'st_' + Date.now(), title: title.trim(), completed: false };
    setIssues(prev =>
      prev.map(item => (item.id === issueId ? { ...item, subtasks: [...item.subtasks, newSub] } : item))
    );
  };

  const deleteSubtask = (issueId: string, subtaskId: string) => {
    if (!can(currentUser, 'issue:write')) return deny();
    setIssues(prev =>
      prev.map(item => {
        if (item.id === issueId) {
          const updatedSubtasks = item.subtasks.filter(st => st.id !== subtaskId);
          return { ...item, subtasks: updatedSubtasks };
        }
        return item;
      })
    );
  };

  return {
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssueStatus,
    addComment,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
  };
}
