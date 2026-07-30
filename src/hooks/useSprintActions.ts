import type { Sprint, Issue, Project } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';
import type { AppNotification } from '../types/Aether';

interface UseSprintActionsParams {
  setSprints: Dispatch<SetStateAction<Sprint[]>>;
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
  sprints: Sprint[];
  notify: (notification: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void;
}

export function useSprintActions({
  setSprints,
  setIssues,
  currentProject,
  sprints,
  notify,
}: UseSprintActionsParams) {
  const startSprint = (sprintId: string) => {
    const sprint = sprints.find(item => item.id === sprintId);
    setSprints(prev =>
      prev.map(sprint => {
        if (sprint.id === sprintId) return { ...sprint, status: 'active' };
        if (sprint.status === 'active') return { ...sprint, status: 'future' };
        return sprint;
      })
    );
    if (sprint) notify({ kind: 'sprint', title: '스프린트 시작', text: `${sprint.name} 스프린트가 시작되었습니다.` });
  };

  const completeSprint = (sprintId: string) => {
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
    const sprint = sprints.find(item => item.id === sprintId);
    setSprints(previousSprints => previousSprints.map(sprint => (
      sprint.id === sprintId ? { ...sprint, ...updates } : sprint
    )));
    if (sprint) notify({ kind: 'sprint', title: '스프린트 변경', text: `${updates.name || sprint.name} 스프린트의 계획이 변경되었습니다.` });
  };

  const deleteSprint = (sprintId: string) => {
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
