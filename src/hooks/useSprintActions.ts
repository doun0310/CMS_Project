import type { Sprint, Issue, Project } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';

interface UseSprintActionsParams {
  setSprints: Dispatch<SetStateAction<Sprint[]>>;
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
}

export function useSprintActions({
  setSprints,
  setIssues,
  currentProject,
}: UseSprintActionsParams) {
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

  return {
    startSprint,
    completeSprint,
    createSprint,
    updateSprint,
    deleteSprint,
  };
}
