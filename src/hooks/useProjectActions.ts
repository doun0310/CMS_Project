import type { Project, User } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';
import { can } from '../utils/permissions';
import { syncProjectToSupabase, addProjectMember, deleteProjectFromSupabase } from '../services/dbService';
import { isSupabaseConfigured } from '../services/supabase';
import { generateUUID, registerMapping } from '../utils/idUtils';

interface UseProjectActionsParams {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setCurrentProject: Dispatch<SetStateAction<Project>>;
  currentUser: User;
  authUserId?: string;
}

export function useProjectActions({
  projects,
  setProjects,
  setCurrentProject,
  currentUser,
  authUserId,
}: UseProjectActionsParams) {
  const createProject = (projectData: Omit<Project, 'id'>): Project | null => {
    if (!can(currentUser, 'team:manage')) return null;
    const createdProject: Project = {
      ...projectData,
      id: generateUUID(),
      boardTitle: projectData.boardTitle?.trim() || `${projectData.name} (Active)`
    };

    setProjects(prev => [createdProject, ...prev]);
    setCurrentProject(createdProject);
    
    if (isSupabaseConfigured && authUserId) {
      syncProjectToSupabase(createdProject, authUserId).then(remoteId => {
        if (remoteId) {
          registerMapping(createdProject.id, remoteId);
          setProjects(prev => prev.map(p => p.id === createdProject.id ? { ...p, remoteId } : p));
          setCurrentProject(prev => prev.id === createdProject.id ? { ...prev, remoteId } : prev);
          addProjectMember(remoteId, authUserId, 'project_owner');
        }
      }).catch(err => {
        console.error('Failed to sync project:', err);
      });
    }

    return createdProject;
  };

  const updateProject = (projectId: string, updates: Partial<Omit<Project, 'id'>>) => {
    if (!can(currentUser, 'team:manage')) return;
    setProjects(previousProjects => previousProjects.map(project => (
      project.id === projectId ? { ...project, ...updates } : project
    )));
    setCurrentProject(previousProject => (
      previousProject.id === projectId ? { ...previousProject, ...updates } : previousProject
    ));
  };

  const deleteProject = (projectId: string): boolean => {
    if (!can(currentUser, 'team:manage')) return false;
    if (projects.length <= 1) return false;

    const projectToDelete = projects.find(p => p.id === projectId);
    const remainingProjects = projects.filter(project => project.id !== projectId);
    setProjects(remainingProjects);
    setCurrentProject(prev => prev.id === projectId ? remainingProjects[0] : prev);

    if (isSupabaseConfigured && projectToDelete?.remoteId) {
      try {
        deleteProjectFromSupabase(projectToDelete.remoteId);
      } catch (err) {
        console.error('Failed to delete project from DB:', err);
      }
    }

    return true;
  };

  return {
    createProject,
    updateProject,
    deleteProject,
  };
}
