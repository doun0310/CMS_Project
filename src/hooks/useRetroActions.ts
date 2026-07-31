import type { RetrospectiveItem, Sprint, User, Project } from '../types/Aether';
import { syncRetroToSupabase } from '../services/supabaseSync';
import type { Dispatch, SetStateAction } from 'react';
import { can } from '../utils/permissions';

interface UseRetroActionsParams {
  setRetrospectiveItems: Dispatch<SetStateAction<RetrospectiveItem[]>>;
  currentUser: User;
  currentProject: Project;
  sprints: Sprint[];
}

export function useRetroActions({
  setRetrospectiveItems,
  currentUser,
  currentProject,
  sprints,
}: UseRetroActionsParams) {
  const getActiveSprint = () => sprints.find(s => s.status === 'active') || sprints[0];

  const addRetroItem = (type: 'went_well' | 'to_improve' | 'action_item', content: string, assigneeId: string | null = null) => {
    if (!can(currentUser, 'issue:write')) return;
    const activeSprint = getActiveSprint();
    const newItem: RetrospectiveItem = {
      id: `retro-${Date.now()}`,
      projectId: currentProject.id,
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
    syncRetroToSupabase(newItem, currentProject.remoteId ?? currentProject.id, activeSprint?.id || 'sprint-1');
  };

  const voteRetroItem = (id: string) => {
    if (!can(currentUser, 'issue:write')) return;
    const activeSprint = getActiveSprint();
    setRetrospectiveItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          if ((item.voterIds || []).includes(currentUser.id)) return item;
          const updated = { ...item, votes: item.votes + 1, voterIds: [...(item.voterIds || []), currentUser.id] };
          syncRetroToSupabase(updated, currentProject.remoteId ?? currentProject.id, activeSprint?.id || 'sprint-1');
          return updated;
        }
        return item;
      })
    );
  };

  const updateRetroItem = (id: string, updates: Partial<Omit<RetrospectiveItem, 'id' | 'authorId' | 'createdAt'>>) => {
    if (!can(currentUser, 'issue:write')) return;
    const activeSprint = getActiveSprint();
    setRetrospectiveItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, ...updates };
      syncRetroToSupabase(updated, currentProject.remoteId ?? currentProject.id, activeSprint?.id || 'sprint-1');
      return updated;
    }));
  };

  const addRetroComment = (id: string, text: string) => {
    if (!can(currentUser, 'issue:write')) return;
    const cleanText = text.trim();
    if (!cleanText) return;
    const activeSprint = getActiveSprint();
    setRetrospectiveItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated: RetrospectiveItem = {
        ...item,
        comments: [
          ...(item.comments || []),
          { id: `retro-comment-${Date.now()}`, authorId: currentUser.id, text: cleanText, createdAt: new Date().toISOString() }
        ]
      };
      syncRetroToSupabase(updated, currentProject.remoteId ?? currentProject.id, activeSprint?.id || 'sprint-1');
      return updated;
    }));
  };

  const deleteRetroItem = (id: string) => {
    if (!can(currentUser, 'project:manage')) return;
    setRetrospectiveItems(prev => prev.filter(item => item.id !== id));
  };

  return {
    addRetroItem,
    voteRetroItem,
    updateRetroItem,
    addRetroComment,
    deleteRetroItem,
  };
}
