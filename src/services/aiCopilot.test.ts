import { describe, it, expect } from 'vitest';
import {
  generateAISpecs,
  analyzeSprintHealth,
  calculateWorkloadRebalance,
  generateDailyStandupDigest
} from './aiCopilot';
import type { Issue, Sprint, User } from '../types/Aether';

const createMockIssue = (overrides: Partial<Issue>): Issue => ({
  id: 'issue-1',
  key: 'AETH-1',
  summary: 'Mock Issue Summary',
  description: 'Mock Issue Description',
  type: 'task',
  status: 'todo',
  priority: 'medium',
  assigneeId: null,
  reporterId: 'user-1',
  epicId: null,
  projectId: 'proj-1',
  sprintId: 'sprint-1',
  storyPoints: 3,
  subtasks: [],
  comments: [],
  history: [],
  labels: [],
  component: 'Core',
  createdAt: '2026-08-01',
  updatedAt: '2026-08-01',
  dueDate: '2026-08-30',
  originalEstimate: 4,
  timeLogged: 0,
  ...overrides,
});

describe('aiCopilot service', () => {
  describe('generateAISpecs', () => {
    it('rates high risk and 8 points for security/auth/rls keywords', () => {
      const res = generateAISpecs('Implement RLS policies for auth');
      expect(res.riskRating).toBe('High');
      expect(res.suggestedPoints).toBe(8);
      expect(res.acceptanceCriteria).toHaveLength(3);
      expect(res.suggestedSubtasks).toHaveLength(4);
    });

    it('rates low risk and 2 points for ui/css/fix keywords', () => {
      const res = generateAISpecs('Fix UI button styling in css');
      expect(res.riskRating).toBe('Low');
      expect(res.suggestedPoints).toBe(2);
    });

    it('defaults to medium risk and 3 points for generic keywords', () => {
      const res = generateAISpecs('Update user profile image avatar');
      expect(res.riskRating).toBe('Medium');
      expect(res.suggestedPoints).toBe(3);
    });
  });

  describe('analyzeSprintHealth', () => {
    const mockSprint: Sprint = {
      id: 'sprint-1',
      projectId: 'proj-1',
      name: 'Sprint 1',
      goal: 'Complete auth feature',
      status: 'active',
      startDate: '2026-08-01',
      endDate: '2026-08-15',
    };

    it('handles empty sprint issues gracefully', () => {
      const health = analyzeSprintHealth(mockSprint, []);
      expect(health.healthScore).toBe(100);
      expect(health.blockersCount).toBe(0);
      expect(health.risks).toContain('No issues currently assigned to this sprint.');
    });

    it('calculates blockers and risks for unassigned highest priority issues', () => {
      const issues: Issue[] = [
        createMockIssue({
          id: 'issue-1',
          key: 'AETH-1',
          summary: 'Critical auth bug',
          type: 'bug',
          status: 'todo',
          priority: 'highest',
          assigneeId: null,
          sprintId: 'sprint-1',
          storyPoints: 5,
        }),
      ];

      const health = analyzeSprintHealth(mockSprint, issues);
      expect(health.blockersCount).toBe(1);
      expect(health.risks.some(r => (typeof r === 'string' ? r : r.rawText).includes('Highest Priority'))).toBe(true);
      expect(health.risks.some(r => (typeof r === 'string' ? r : r.rawText).includes('unassigned'))).toBe(true);
    });
  });

  describe('calculateWorkloadRebalance', () => {
    const users: User[] = [
      { id: 'user-1', name: 'Alice', email: 'alice@test.com', avatar: '', role: 'Dev', projectRole: 'Project Member' },
      { id: 'user-2', name: 'Bob', email: 'bob@test.com', avatar: '', role: 'Dev', projectRole: 'Project Member' },
    ];

    it('reassigns unassigned issues to lowest loaded user', () => {
      const issues: Issue[] = [
        createMockIssue({
          id: 'issue-1',
          key: 'AETH-1',
          summary: 'Unassigned Task',
          type: 'task',
          status: 'todo',
          priority: 'medium',
          assigneeId: null,
          sprintId: null,
          storyPoints: 3,
        }),
      ];

      const suggestions = calculateWorkloadRebalance(users, issues);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].fromUserId).toBe('Unassigned');
      expect(['user-1', 'user-2']).toContain(suggestions[0].toUserId);
    });
  });

  describe('generateDailyStandupDigest', () => {
    it('formats completed, in-progress, and blockers into digest', () => {
      const issues: Issue[] = [
        createMockIssue({
          id: 'issue-1',
          key: 'AETH-1',
          summary: 'Done item',
          type: 'task',
          status: 'done',
          priority: 'low',
          assigneeId: 'user-1',
        }),
        createMockIssue({
          id: 'issue-2',
          key: 'AETH-2',
          summary: 'In Progress item',
          type: 'bug',
          status: 'in_progress',
          priority: 'highest',
          assigneeId: null,
        }),
      ];

      const digest = generateDailyStandupDigest(issues);
      expect(digest.completedYesterday).toContain('[AETH-1] Done item');
      expect(digest.inProgressToday).toContain('[AETH-2] In Progress item');
      expect(digest.blockersDetected.some(b => b.includes('AETH-2'))).toBe(true);
    });
  });
});
