import type { Issue, Sprint } from '../types/jira';

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

export const generateAISpecs = (summary: string, description?: string): AISpecSuggestion => {
  const text = (summary + ' ' + (description || '')).toLowerCase();
  
  let suggestedPoints = 3;
  let riskRating: 'Low' | 'Medium' | 'High' = 'Medium';
  
  if (text.includes('auth') || text.includes('security') || text.includes('memory') || text.includes('gpu') || text.includes('rls')) {
    suggestedPoints = 8;
    riskRating = 'High';
  } else if (text.includes('fix') || text.includes('test') || text.includes('ui') || text.includes('css')) {
    suggestedPoints = 2;
    riskRating = 'Low';
  }

  const acceptanceCriteria = [
    `Given a valid request for "${summary}", the API/UI responds within expected latency SLA (<100ms).`,
    `When invalid payload or unauthorized credentials are provided, return clear error code & diagnostic audit log.`,
    `Ensure 100% test coverage with automated unit & integration test suites.`
  ];

  const suggestedSubtasks = [
    `Setup technical specification and API request/response schema`,
    `Implement core business logic & error handling pipeline`,
    `Write unit tests with edge-case mock fixtures`,
    `Verify performance impact and update user documentation`
  ];

  return {
    acceptanceCriteria,
    suggestedSubtasks,
    suggestedPoints,
    riskRating,
    reasoning: `AI analyzed "${summary}" and identified high security/performance scope.`
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

  let healthScore = Math.round((doneCount / total) * 60 + (10 - highestPrioCount * 2) + (10 - unassignedCount * 2));
  healthScore = Math.max(25, Math.min(98, healthScore));

  const risks: string[] = [];
  const recommendations: string[] = [];

  if (highestPrioCount > 0) {
    risks.push(`${highestPrioCount} Highest Priority issues remain unresolved in Active Sprint.`);
    recommendations.push(`Prioritize resolving Highest Priority tasks before end of sprint.`);
  }

  if (unassignedCount > 0) {
    risks.push(`${unassignedCount} issues in active sprint are currently unassigned.`);
    recommendations.push(`Auto-assign unassigned tasks to engineers based on workload.`);
  }

  if (healthScore > 80) {
    recommendations.push(`Sprint velocity is optimal! Target early release or stretch goals.`);
  }

  return {
    healthScore,
    blockersCount: highestPrioCount,
    risks,
    recommendations
  };
};
