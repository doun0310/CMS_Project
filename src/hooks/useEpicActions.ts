import type { Epic, Issue, Project } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';

interface UseEpicActionsParams {
  epics: Epic[];
  setEpics: Dispatch<SetStateAction<Epic[]>>;
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
}

export function useEpicActions({
  epics,
  setEpics,
  setIssues,
  currentProject,
}: UseEpicActionsParams) {
  const filteredEpics = epics.filter(epic => epic.projectId === currentProject.id);

  const createEpic = (summary: string) => {
    const nextNumber = filteredEpics.reduce((max, epic) => Math.max(max, Number(epic.key.split('E')[1]) || 0), 0) + 1;
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

  return {
    createEpic,
    updateEpic,
    deleteEpic,
  };
}
