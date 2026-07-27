import type { IssueType } from '../types/Aether';

/**
 * Checks if an issue type matches the selected filter type, supporting
 * both modern (initiative, feature, workitem) and legacy (epic, story, task) terms.
 */
export const isIssueTypeMatch = (issueType: string, selectedType: IssueType | 'all'): boolean => {
  if (selectedType === 'all') return true;
  if (issueType === selectedType) return true;

  // Feature <-> Story equivalence
  if (selectedType === 'feature' && issueType === 'story') return true;
  if (selectedType === 'story' && issueType === 'feature') return true;

  // WorkItem <-> Task equivalence
  if (selectedType === 'workitem' && issueType === 'task') return true;
  if (selectedType === 'task' && issueType === 'workitem') return true;

  // Initiative <-> Epic equivalence
  if (selectedType === 'initiative' && issueType === 'epic') return true;
  if (selectedType === 'epic' && issueType === 'initiative') return true;

  return false;
};
