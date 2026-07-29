import type { Issue, IssueStatus, SubTask, Sprint, User, Project } from '../types/Aether';
import { syncIssueToSupabase, deleteIssueFromSupabase } from '../services/supabaseSync';
import type { Dispatch, SetStateAction } from 'react';

interface UseIssueActionsParams {
  allIssues: Issue[];
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
  currentUser: User;
  sprints: Sprint[];
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  onDoneStatusAutomation: () => void;
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
}: UseIssueActionsParams) {
  const issues = allIssues.filter(issue => issue.projectId === currentProject.id);

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

    if (newStatus === 'done') onDoneStatusAutomation();
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

  return {
    createIssue,
    updateIssue,
    deleteIssue,
    moveIssueStatus,
    addComment,
    toggleSubtask,
    addSubtask,
  };
}
