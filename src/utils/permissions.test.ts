import { describe, it, expect } from 'vitest';
import { getProjectRole, can, canWrite } from './permissions';
import type { User } from '../types/Aether';

describe('permissions utility', () => {
  const baseUser: User = {
    id: 'user-1',
    name: 'Alice',
    email: 'alice@example.com',
    avatar: 'https://example.com/avatar.png',
    role: 'Engineer',
    projectRole: 'Project Owner',
  };

  describe('getProjectRole', () => {
    it('normalizes legacy "Project Admin" to "Project Manager"', () => {
      const user = { ...baseUser, projectRole: 'Project Admin' as unknown as any };
      expect(getProjectRole(user)).toBe('Project Manager');
    });

    it('defaults undefined projectRole to "Project Member"', () => {
      const user = { ...baseUser, projectRole: undefined };
      expect(getProjectRole(user)).toBe('Project Member');
    });

    it('returns exact role if valid', () => {
      expect(getProjectRole(baseUser)).toBe('Project Owner');
    });
  });

  describe('can permission checker', () => {
    it('grants all permissions to Project Owner', () => {
      expect(can(baseUser, 'issue:write')).toBe(true);
      expect(can(baseUser, 'issue:delete')).toBe(true);
      expect(can(baseUser, 'project:manage')).toBe(true);
      expect(can(baseUser, 'team:manage')).toBe(true);
    });

    it('grants all except team:manage to Project Manager', () => {
      const manager: User = { ...baseUser, projectRole: 'Project Manager' };
      expect(can(manager, 'issue:write')).toBe(true);
      expect(can(manager, 'issue:delete')).toBe(true);
      expect(can(manager, 'project:manage')).toBe(true);
      expect(can(manager, 'team:manage')).toBe(false);
    });

    it('grants only issue:write to Project Member', () => {
      const member: User = { ...baseUser, projectRole: 'Project Member' };
      expect(can(member, 'issue:write')).toBe(true);
      expect(can(member, 'issue:delete')).toBe(false);
      expect(can(member, 'project:manage')).toBe(false);
      expect(can(member, 'team:manage')).toBe(false);
    });

    it('denies all permissions to Viewer', () => {
      const viewer: User = { ...baseUser, projectRole: 'Viewer' };
      expect(can(viewer, 'issue:write')).toBe(false);
      expect(can(viewer, 'issue:delete')).toBe(false);
      expect(can(viewer, 'project:manage')).toBe(false);
      expect(can(viewer, 'team:manage')).toBe(false);
    });
  });

  describe('canWrite helper', () => {
    it('correctly delegates to can(user, "issue:write")', () => {
      expect(canWrite(baseUser)).toBe(true);
      const viewer: User = { ...baseUser, projectRole: 'Viewer' };
      expect(canWrite(viewer)).toBe(false);
    });
  });
});
