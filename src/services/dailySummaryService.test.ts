import { describe, it, expect } from 'vitest';
import {
  collectEventsForDate,
  generateRuleBasedSummary,
  formatExportText,
} from './dailySummaryService';
import type { Issue } from '../types/Aether';
import type { DailySummary } from '../types/dailySummary';

describe('dailySummaryService Unit Tests', () => {
  const createMockIssue = (overrides: Partial<Issue>): Issue => ({
    id: 'issue-default',
    key: 'TEST-0',
    summary: 'Default Summary',
    description: 'Default Description',
    type: 'task',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'user-1',
    reporterId: 'reporter-1',
    epicId: null,
    sprintId: null,
    storyPoints: 3,
    subtasks: [],
    comments: [],
    history: [],
    labels: [],
    component: 'Core',
    dueDate: '2026-08-10',
    originalEstimate: 4,
    timeLogged: 0,
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-06T09:00:00Z',
    ...overrides,
  });

  const mockIssues: Issue[] = [
    createMockIssue({
      id: 'issue-1',
      key: 'TEST-1',
      summary: 'Fix authentication token refresh bug',
      status: 'done',
      priority: 'high',
      type: 'bug',
      updatedAt: '2026-08-06T09:00:00Z',
    }),
    createMockIssue({
      id: 'issue-2',
      key: 'TEST-2',
      summary: 'Implement daily summary view UI component',
      status: 'in_progress',
      priority: 'medium',
      type: 'feature',
      updatedAt: '2026-08-06T11:00:00Z',
    }),
    createMockIssue({
      id: 'issue-3',
      key: 'TEST-3',
      summary: 'Database connection timeout issue',
      status: 'todo',
      priority: 'highest',
      blockedBy: ['TEST-1'],
      type: 'bug',
      updatedAt: '2026-08-06T14:00:00Z',
    }),
  ];

  it('should collect correct events for a specific date', () => {
    const events = collectEventsForDate('2026-08-06', mockIssues, 'user-1');
    expect(events.length).toBeGreaterThan(0);
    const doneEvent = events.find((e) => e.statusTo === 'done');
    expect(doneEvent).toBeDefined();
    expect(doneEvent?.issueKey).toBe('TEST-1');
  });

  it('should generate rule-based summary with 3 categories', () => {
    const events = collectEventsForDate('2026-08-06', mockIssues, 'user-1');
    const summary = generateRuleBasedSummary('2026-08-06', events, mockIssues, 'user-1');

    expect(summary.summaryDate).toBe('2026-08-06');
    expect(summary.engineUsed).toBe('TEMPLATE');
    expect(summary.doneToday.length).toBeGreaterThan(0);
    expect(summary.planTomorrow.length).toBeGreaterThan(0);
    expect(summary.blockers.length).toBeGreaterThan(0);
  });

  it('should format export text correctly for Slack and Notion', () => {
    const summary: DailySummary = {
      id: 'sum-1',
      userId: 'user-1',
      summaryDate: '2026-08-06',
      doneToday: [{ id: '1', issueKey: 'TEST-1', title: 'Task completed' }],
      planTomorrow: [{ id: '2', issueKey: 'TEST-2', title: 'Next feature development' }],
      blockers: [{ id: '3', title: 'API rate limit error' }],
      aiInsights: 'All tasks on track.',
      engineUsed: 'AI',
      createdAt: '2026-08-06T18:00:00Z',
    };

    const slackText = formatExportText(summary, 'slack');
    expect(slackText).toContain('일일 개발 요약');
    expect(slackText).toContain('`TEST-1` Task completed');

    const notionText = formatExportText(summary, 'notion');
    expect(notionText).toContain('# 📅 오늘의 개발 요약');
    expect(notionText).toContain('**[TEST-1]** Task completed');
  });
});
