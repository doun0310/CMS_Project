import type { ProjectRole, User } from '../types/Aether';

export type WorkspacePermission = 'issue:write' | 'issue:delete' | 'project:manage' | 'team:manage';

/** Converts legacy values before every access decision. Never use job titles for authorization. */
export const getProjectRole = (user: User): ProjectRole => {
  if ((user.projectRole as string | undefined) === 'Project Admin') return 'Project Manager';
  return user.projectRole || 'Project Member';
};

export const can = (user: User, permission: WorkspacePermission): boolean => {
  const role = getProjectRole(user);
  if (role === 'Project Owner') return true;
  if (role === 'Project Manager') return permission !== 'team:manage';
  if (role === 'Project Member') return permission === 'issue:write';
  return false;
};

export const canWrite = (user: User) => can(user, 'issue:write');
