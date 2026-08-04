import type { Epic, Issue, Project, User } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';
import { can } from '../utils/permissions';
import { syncEpicToSupabase, deleteEpicFromSupabase } from '../services/dbService';
import { isSupabaseConfigured } from '../services/supabase';

interface UseEpicActionsParams {
  epics: Epic[];
  setEpics: Dispatch<SetStateAction<Epic[]>>;
  setIssues: Dispatch<SetStateAction<Issue[]>>;
  currentProject: Project;
  currentUser: User;
}

export function useEpicActions({
  epics,
  setEpics,
  setIssues,
  currentProject,
  currentUser,
}: UseEpicActionsParams) {
  const filteredEpics = epics.filter(epic => epic.projectId === currentProject.id);

  const createEpic = (summary: string) => {
    if (!can(currentUser, 'project:manage')) return null;
    const nextNumber = filteredEpics.reduce((max, epic) => Math.max(max, Number(epic.key.split('E')[1]) || 0), 0) + 1;
    const newEpic: Epic = {
      id: `epic_${Date.now()}`,
      projectId: currentProject.id,
      key: `${currentProject.key}-E${nextNumber}`,
      summary,
      color: '#6366f1',
    };
    setEpics(previousEpics => [...previousEpics, newEpic]);
    
    if (isSupabaseConfigured && currentProject.remoteId) {
      try {
        syncEpicToSupabase(newEpic, currentProject.remoteId);
      } catch (err) {
        console.error('Failed to sync epic:', err);
      }
    }
    return newEpic;
  };

  const updateEpic = (epicId: string, updates: Partial<Omit<Epic, 'id' | 'projectId'>>) => {
    if (!can(currentUser, 'project:manage')) return;
    const targetEpic = epics.find(e => e.id === epicId);
    setEpics(previousEpics => previousEpics.map(epic => epic.id === epicId ? { ...epic, ...updates } : epic));
    
    if (targetEpic && isSupabaseConfigured && currentProject.remoteId) {
      try {
        syncEpicToSupabase({ ...targetEpic, ...updates }, currentProject.remoteId);
      } catch (err) {
        console.error('Failed to update epic:', err);
      }
    }
  };

  const deleteEpic = (epicId: string) => {
    if (!can(currentUser, 'project:manage')) return;
    setEpics(previousEpics => previousEpics.filter(epic => epic.id !== epicId));
    setIssues(previousIssues => previousIssues.map(issue => issue.epicId === epicId ? { ...issue, epicId: null } : issue));
    
    if (isSupabaseConfigured && currentProject.remoteId) {
      try {
        deleteEpicFromSupabase(epicId);
      } catch (err) {
        console.error('Failed to delete epic:', err);
      }
    }
  };

  return {
    createEpic,
    updateEpic,
    deleteEpic,
  };
}
