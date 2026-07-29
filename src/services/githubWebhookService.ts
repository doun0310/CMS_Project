import type { Issue, LinkedPR, LinkedCommit, IssueStatus } from '../types/Aether';

export interface GithubCommitPayload {
  hash: string;
  message: string;
  url: string;
  author: string;
  timestamp: string;
}

export interface GithubPRPayload {
  id: string;
  number: number;
  title: string;
  url: string;
  action: 'opened' | 'closed' | 'merged';
  author: string;
  branch: string;
}

/**
 * Extracts issue keys (e.g., AP-101, PROJ-123) from text
 */
export function extractIssueKeys(text: string): string[] {
  if (!text) return [];
  const regex = /([A-Z]{2,10}-\d+)/g;
  const matches = text.match(regex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Handles incoming GitHub Push Webhook (commits)
 */
export function processGithubPush(
  commit: GithubCommitPayload,
  issues: Issue[],
  updateIssue: (issueId: string, updates: Partial<Issue>) => void
): { matchedIssueKeys: string[]; actionLogs: string[] } {
  const keys = extractIssueKeys(commit.message);
  const actionLogs: string[] = [];

  keys.forEach((key) => {
    const targetIssue = issues.find((i) => i.key.toUpperCase() === key.toUpperCase());
    if (targetIssue) {
      const existingCommits = targetIssue.linkedCommits || [];
      // Avoid duplicate commits
      if (!existingCommits.some((c) => c.hash === commit.hash)) {
        const updatedCommits: LinkedCommit[] = [
          ...existingCommits,
          {
            hash: commit.hash.substring(0, 7),
            message: commit.message,
            url: commit.url,
            author: commit.author,
            timestamp: commit.timestamp,
          },
        ];

        // Auto move to 'in_progress' if currently in 'todo'
        let newStatus: IssueStatus = targetIssue.status;
        if (targetIssue.status === 'todo') {
          newStatus = 'in_progress';
        }

        updateIssue(targetIssue.id, {
          linkedCommits: updatedCommits,
          status: newStatus,
          history: [
            ...(targetIssue.history || []),
            {
              id: `hist_${Date.now()}`,
              authorId: 'system_github',
              action: `Linked GitHub Commit [${commit.hash.substring(0, 7)}] by ${commit.author}`,
              timestamp: new Date().toISOString(),
            },
          ],
        });

        actionLogs.push(`Linked commit ${commit.hash.substring(0, 7)} to issue ${key} (Status: ${newStatus})`);
      }
    }
  });

  return { matchedIssueKeys: keys, actionLogs };
}

/**
 * Handles incoming GitHub Pull Request Webhook
 */
export function processGithubPR(
  pr: GithubPRPayload,
  issues: Issue[],
  updateIssue: (issueId: string, updates: Partial<Issue>) => void
): { matchedIssueKeys: string[]; actionLogs: string[] } {
  const keys = extractIssueKeys(pr.title + ' ' + pr.branch);
  const actionLogs: string[] = [];

  keys.forEach((key) => {
    const targetIssue = issues.find((i) => i.key.toUpperCase() === key.toUpperCase());
    if (targetIssue) {
      const existingPRs = targetIssue.linkedPRs || [];
      const prIndex = existingPRs.findIndex((p) => p.number === pr.number);

      const prItem: LinkedPR = {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        url: pr.url,
        status: pr.action === 'merged' ? 'merged' : pr.action === 'closed' ? 'closed' : 'open',
        author: pr.author,
        createdAt: new Date().toISOString(),
      };

      let updatedPRs: LinkedPR[];
      if (prIndex >= 0) {
        updatedPRs = [...existingPRs];
        updatedPRs[prIndex] = prItem;
      } else {
        updatedPRs = [...existingPRs, prItem];
      }

      // Auto update status based on PR action
      let newStatus: IssueStatus = targetIssue.status;
      if (pr.action === 'opened') {
        newStatus = 'in_review';
      } else if (pr.action === 'merged') {
        newStatus = 'done';
      }

      updateIssue(targetIssue.id, {
        githubBranch: pr.branch,
        linkedPRs: updatedPRs,
        status: newStatus,
        history: [
          ...(targetIssue.history || []),
          {
            id: `hist_${Date.now()}`,
            authorId: 'system_github',
            action: `GitHub PR #${pr.number} (${pr.action}) by ${pr.author} -> Status: ${newStatus}`,
            timestamp: new Date().toISOString(),
          },
        ],
      });

      actionLogs.push(`PR #${pr.number} ${pr.action} on ${key} -> Moved to ${newStatus}`);
    }
  });

  return { matchedIssueKeys: keys, actionLogs };
}
