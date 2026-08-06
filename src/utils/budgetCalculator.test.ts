import { describe, it, expect } from 'vitest';
import { calculateBudgetSummary, formatCurrency } from './budgetCalculator';
import type { ProjectBudget, MemberHourlyRate, ProjectExpense, Issue } from '../types/Aether';

describe('budgetCalculator Utility', () => {
  const mockBudget: ProjectBudget = {
    id: 'bgt-1',
    projectId: 'proj-1',
    totalBudget: 100000000, // 100M KRW
    currency: 'KRW',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    alertThresholdPercent: 10
  };

  const mockRates: MemberHourlyRate[] = [
    { id: 'r-1', projectId: 'proj-1', userId: 'user-1', hourlyRate: 50000, currency: 'KRW' },
    { id: 'r-2', projectId: 'proj-1', userId: 'user-2', hourlyRate: 40000, currency: 'KRW' }
  ];

  const mockExpenses: ProjectExpense[] = [
    {
      id: 'exp-1',
      projectId: 'proj-1',
      title: 'AWS Server',
      category: 'infrastructure',
      amount: 2000000,
      recurringType: 'one_time',
      expenseDate: '2026-06-01'
    }
  ];

  const mockIssues: Issue[] = [
    {
      id: 'iss-1',
      key: 'TEST-1',
      summary: 'Task 1',
      description: '',
      type: 'feature',
      status: 'done',
      priority: 'high',
      assigneeId: 'user-1',
      reporterId: 'user-1',
      epicId: null,
      sprintId: null,
      storyPoints: 3,
      subtasks: [],
      comments: [],
      history: [],
      labels: [],
      component: '',
      dueDate: '',
      originalEstimate: 10,
      timeLogged: 10,
      createdAt: '',
      updatedAt: ''
    }
  ];

  it('correctly calculates labor and total spend', () => {
    const summary = calculateBudgetSummary(mockBudget, mockRates, mockExpenses, mockIssues);

    // Labor spend = 10 hrs * 50,000 KRW = 500,000 KRW
    expect(summary.laborSpend).toBe(500000);
    // Operational spend = 2,000,000 KRW
    expect(summary.operationalSpend).toBe(2000000);
    // Total spend = 2,500,000 KRW
    expect(summary.totalSpend).toBe(2500000);
    // Remaining budget = 97,500,000 KRW
    expect(summary.remainingBudget).toBe(97500000);
    // Burn rate % = 2.5%
    expect(summary.burnRatePercent).toBe(2.5);
    expect(summary.riskLevel).toBe('safe');
  });

  it('formats currency strings correctly for KRW and USD', () => {
    expect(formatCurrency(1500000, 'KRW')).toContain('1,500,000');
    expect(formatCurrency(5000, 'USD')).toContain('5,000');
  });
});
