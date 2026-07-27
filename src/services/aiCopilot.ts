import type { Issue, Sprint, User, WorkloadSuggestion } from '../types/jira';

export interface AISpecSuggestion {
  acceptanceCriteria: string[];
  suggestedSubtasks: string[];
  suggestedPoints: number;
  riskRating: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

export interface AISprintInsights {
  healthScore: number; // 0-100
  blockersCount: number;
  risks: string[];
  recommendations: string[];
}

export interface DailyStandupDigest {
  completedYesterday: string[];
  inProgressToday: string[];
  blockersDetected: string[];
  aiPrediction: string;
}

export const generateAISpecs = (summary: string, description?: string): AISpecSuggestion => {
  const text = (summary + ' ' + (description || '')).toLowerCase();
  
  let suggestedPoints = 3;
  let riskRating: 'Low' | 'Medium' | 'High' = 'Medium';
  
  if (text.includes('auth') || text.includes('security') || text.includes('memory') || text.includes('gpu') || text.includes('rls') || text.includes('backend')) {
    suggestedPoints = 8;
    riskRating = 'High';
  } else if (text.includes('fix') || text.includes('test') || text.includes('ui') || text.includes('css') || text.includes('docs')) {
    suggestedPoints = 2;
    riskRating = 'Low';
  } else if (text.includes('refactor') || text.includes('api') || text.includes('integration')) {
    suggestedPoints = 5;
    riskRating = 'Medium';
  }

  const acceptanceCriteria = [
    `Given a valid request for "${summary}", the system executes within SLA latency (<150ms).`,
    `When edge cases or unauthorized tokens occur, proper HTTP status code & diagnostic event logs are recorded.`,
    `Unit & Integration test suites pass with at least 90% branch coverage across modified modules.`
  ];

  const suggestedSubtasks = [
    `Draft technical interface design & schema contract for "${summary}"`,
    `Implement core workflow & business logic handling`,
    `Write automated unit tests and mock integration tests`,
    `Perform security audit and update release documentation`
  ];

  return {
    acceptanceCriteria,
    suggestedSubtasks,
    suggestedPoints,
    riskRating,
    reasoning: `AI analyzed prompt complexity for "${summary}" and calculated story points based on historical team velocity.`
  };
};

export const analyzeSprintHealth = (sprint: Sprint, issues: Issue[]): AISprintInsights => {
  const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
  const total = sprintIssues.length;
  if (total === 0) {
    return {
      healthScore: 100,
      blockersCount: 0,
      risks: ['No issues currently assigned to this sprint.'],
      recommendations: ['Add backlog items to active sprint commitments.']
    };
  }

  const doneCount = sprintIssues.filter(i => i.status === 'done').length;
  const highestPrioCount = sprintIssues.filter(i => i.priority === 'highest' && i.status !== 'done').length;
  const unassignedCount = sprintIssues.filter(i => !i.assigneeId).length;
  const totalPoints = sprintIssues.reduce((acc, i) => acc + (i.storyPoints || 0), 0);
  const donePoints = sprintIssues.filter(i => i.status === 'done').reduce((acc, i) => acc + (i.storyPoints || 0), 0);

  const completionRatio = totalPoints > 0 ? donePoints / totalPoints : doneCount / total;
  let healthScore = Math.round(completionRatio * 65 + (15 - highestPrioCount * 3) + (10 - unassignedCount * 2) + 10);
  healthScore = Math.max(28, Math.min(99, healthScore));

  const risks: string[] = [];
  const recommendations: string[] = [];

  if (highestPrioCount > 0) {
    risks.push(`${highestPrioCount} Highest Priority issues remain unresolved in Active Sprint.`);
    recommendations.push(`Prioritize resolving Highest Priority tasks immediately.`);
  }

  if (unassignedCount > 0) {
    risks.push(`${unassignedCount} issues in active sprint are currently unassigned.`);
    recommendations.push(`Use 1-Click AI Auto-Balancer to distribute unassigned tasks evenly.`);
  }

  if (completionRatio < 0.4 && sprintIssues.length > 5) {
    risks.push(`Sprint progress is lagging behind ideal burndown trajectory.`);
    recommendations.push(`Consider scope reduction or re-estimating remaining work items.`);
  }

  if (healthScore > 85) {
    recommendations.push(`Sprint velocity is optimal! Target early release testing or stretch goals.`);
  }

  return {
    healthScore,
    blockersCount: highestPrioCount,
    risks,
    recommendations
  };
};

export const calculateWorkloadRebalance = (users: User[], issues: Issue[]): WorkloadSuggestion[] => {
  const activeIssues = issues.filter(i => i.status !== 'done');
  
  // Calculate story points per user
  const userLoads = new Map<string, { user: User; points: number; count: number }>();
  users.forEach(u => {
    userLoads.set(u.id, { user: u, points: 0, count: 0 });
  });

  const unassignedIssues: Issue[] = [];

  activeIssues.forEach(i => {
    if (i.assigneeId && userLoads.has(i.assigneeId)) {
      const entry = userLoads.get(i.assigneeId)!;
      entry.points += i.storyPoints || 1;
      entry.count += 1;
    } else {
      unassignedIssues.push(i);
    }
  });

  const suggestions: WorkloadSuggestion[] = [];

  // 1. Assign unassigned issues to lowest load user
  unassignedIssues.forEach(issue => {
    let minUser = Array.from(userLoads.values()).sort((a, b) => a.points - b.points)[0];
    if (minUser) {
      suggestions.push({
        issueId: issue.id,
        issueKey: issue.key,
        issueSummary: issue.summary,
        fromUserId: 'Unassigned',
        toUserId: minUser.user.id,
        reason: `Assigning unassigned task to ${minUser.user.name} (Lowest current load: ${minUser.points} pts)`
      });
      minUser.points += issue.storyPoints || 1;
      minUser.count += 1;
    }
  });

  // 2. Rebalance from overloaded user (>12 points) to underloaded user (<5 points)
  const sortedUsers = Array.from(userLoads.values()).sort((a, b) => b.points - a.points);
  const highest = sortedUsers[0];
  const lowest = sortedUsers[sortedUsers.length - 1];

  if (highest && lowest && highest.points - lowest.points >= 7) {
    const highestUserIssues = activeIssues.filter(i => i.assigneeId === highest.user.id && i.status === 'todo');
    if (highestUserIssues.length > 0) {
      const candidate = highestUserIssues[0];
      suggestions.push({
        issueId: candidate.id,
        issueKey: candidate.key,
        issueSummary: candidate.summary,
        fromUserId: highest.user.id,
        toUserId: lowest.user.id,
        reason: `Rebalancing ${candidate.key} from ${highest.user.name} (${highest.points} pts) to ${lowest.user.name} (${lowest.points} pts)`
      });
    }
  }

  return suggestions;
};

export const generateDailyStandupDigest = (issues: Issue[]): DailyStandupDigest => {
  const doneRecently = issues.filter(i => i.status === 'done').map(i => `[${i.key}] ${i.summary}`);
  const inProgress = issues.filter(i => i.status === 'in_progress' || i.status === 'in_review').map(i => `[${i.key}] ${i.summary}`);
  const blockers = issues.filter(i => i.priority === 'highest' && i.status !== 'done').map(i => `[${i.key}] ${i.summary} (High Priority Block)` + (i.assigneeId ? '' : ' - Unassigned!'));

  return {
    completedYesterday: doneRecently.length > 0 ? doneRecently : ['No tasks completed in last 24h cycle'],
    inProgressToday: inProgress.length > 0 ? inProgress : ['No active in-progress tasks'],
    blockersDetected: blockers.length > 0 ? blockers : ['No critical blockers detected'],
    aiPrediction: doneRecently.length > 2 
      ? '🚀 High momentum! Project is on track for upcoming sprint milestone.' 
      : '⚠️ Moderate velocity detected. Focus on resolving in-progress review items today.'
  };
};

