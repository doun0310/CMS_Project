import type { Sprint, Issue, Project, User } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';
import type { AppNotification } from '../types/Aether';
import { can } from '../utils/permissions';

interface UseSprintActionsParams {
  setSprints: Dispatch<SetStateAction<Sprint[]>>;
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
  sprints: Sprint[];
  currentUser: User;
  notify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

export function useSprintActions({
  setSprints,
  setIssues,
  currentProject,
  sprints,
  currentUser,
  notify,
}: UseSprintActionsParams) {
  const deny = () => notify({ kind: 'system', title: '권한 없음', text: '스프린트는 Project Manager 이상만 변경할 수 있습니다.' });
  const startSprint = (sprintId: string) => {
    if (!can(currentUser, 'project:manage')) return deny();
    const sprint = sprints.find(item => item.id === sprintId);
    const targetProjectId = sprint?.projectId || currentProject.id;
    setSprints(prev =>
      prev.map(item => {
        if (item.id === sprintId) return { ...item, status: 'active' };
        if ((item.projectId || currentProject.id) === targetProjectId && item.status === 'active') {
          return { ...item, status: 'future' };
        }
        return item;
      })
    );
    if (sprint) notify({ kind: 'sprint', title: '스프린트 시작', text: `${sprint.name} 스프린트가 시작되었습니다.` });
  };

  const completeSprint = (sprintId: string) => {
    if (!can(currentUser, 'project:manage')) return deny();
    const sprint = sprints.find(item => item.id === sprintId);
    setSprints(prev =>
      prev.map(s => (s.id === sprintId ? { ...s, status: 'completed' } : s))
    );
    // Move remaining non-done issues in sprint to Backlog (sprintId = null)
    setIssues(prev =>
      prev.map(item =>
        item.sprintId === sprintId && item.status !== 'done' ? { ...item, sprintId: null } : item
      )
    );
    if (sprint) notify({ kind: 'sprint', title: '스프린트 완료', text: `${sprint.name} 스프린트가 완료되어 남은 작업이 백로그로 이동했습니다.` });
  };

  const createSprint = (name: string, goal: string) => {
    if (!can(currentUser, 'project:manage')) return deny();
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
    notify({ kind: 'sprint', title: '새 스프린트 생성', text: `${newSprint.name} 스프린트가 생성되었습니다.` });
  };

  const updateSprint = (sprintId: string, updates: Partial<Omit<Sprint, 'id' | 'projectId'>>) => {
    if (!can(currentUser, 'project:manage')) return deny();
    const sprint = sprints.find(item => item.id === sprintId);
    setSprints(previousSprints => previousSprints.map(sprint => (
      sprint.id === sprintId ? { ...sprint, ...updates } : sprint
    )));
    if (sprint) notify({ kind: 'sprint', title: '스프린트 변경', text: `${updates.name || sprint.name} 스프린트의 계획이 변경되었습니다.` });
  };

  const deleteSprint = (sprintId: string) => {
    if (!can(currentUser, 'project:manage')) return deny();
    const sprint = sprints.find(item => item.id === sprintId);
    setSprints(previousSprints => previousSprints.filter(sprint => sprint.id !== sprintId));
    setIssues(previousIssues => previousIssues.map(issue => (
      issue.sprintId === sprintId ? { ...issue, sprintId: null } : issue
    )));
    if (sprint) notify({ kind: 'sprint', title: '스프린트 삭제', text: `${sprint.name} 스프린트가 삭제되고 연결된 작업이 백로그로 이동했습니다.` });
  };

  return {
    startSprint,
    completeSprint,
    createSprint,
    updateSprint,
    deleteSprint,
  };
}
