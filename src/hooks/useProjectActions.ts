import type { Project, User } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';
import { can } from '../utils/permissions';

interface UseProjectActionsParams {
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setCurrentProject: Dispatch<SetStateAction<Project>>;
  currentUser: User;
}

export function useProjectActions({
  projects,
  setProjects,
  setCurrentProject,
  currentUser,
}: UseProjectActionsParams) {
  const createProject = (projectData: Omit<Project, 'id'>): Project | null => {
    if (!can(currentUser, 'team:manage')) return null;
    const createdProject: Project = {
      ...projectData,
      id: `proj_${Date.now()}`,
      boardTitle: projectData.boardTitle?.trim() || `${projectData.name} (Active)`
    };

    setProjects(prev => [createdProject, ...prev]);
    setCurrentProject(createdProject);
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

    const remainingProjects = projects.filter(project => project.id !== projectId);
    setProjects(remainingProjects);
    setCurrentProject(prev => prev.id === projectId ? remainingProjects[0] : prev);
    return true;
  };

  return {
    createProject,
    updateProject,
    deleteProject,
  };
}
