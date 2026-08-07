import React from 'react';
import type { Sprint, Issue, User } from '../../types/Aether';
import { IconCheck, IconX } from '../common/Icons';

interface SprintCelebrationModalProps {
  sprint: Sprint | null;
  sprintIssues: Issue[];
  users: User[];
  onClose: () => void;
}

export const SprintCelebrationModal: React.FC<SprintCelebrationModalProps> = ({
  sprint,
  sprintIssues,
  users,
  onClose
}) => {
  if (!sprint) return null;

  const totalPoints = sprintIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
  const donePoints = sprintIssues
    .filter(i => i.status === 'done')
    .reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
  const pct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 100;

  // Find Sprint MVP (User with most story points completed)
  const userPointsMap: Record<string, number> = {};
  sprintIssues.forEach(issue => {
    if (issue.assigneeId && issue.status === 'done') {
      userPointsMap[issue.assigneeId] = (userPointsMap[issue.assigneeId] || 0) + (issue.storyPoints || 0);
    }
  });

  let mvpUser: User | undefined = undefined;
  let maxPts = -1;
  Object.entries(userPointsMap).forEach(([uId, pts]) => {
    if (pts > maxPts) {
      maxPts = pts;
      mvpUser = users.find(u => u.id === uId);
    }
  });

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="celebration-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="celebration-close-btn" onClick={onClose}>
          <IconX size={20} />
        </button>

        <div className="celebration-icon-wrap">
          <span className="trophy-emoji">🏆</span>
        </div>

        <h2 className="celebration-title">Sprint Completed!</h2>

        <div className="celebration-goal-card">
          <span className="goal-label">Sprint Goal Achieved:</span>
          <span className="goal-value">"{sprint.goal || 'Complete scheduled features & security audit'}"</span>
        </div>

        <div className="celebration-metrics-grid">
          <div className="celebration-metric-box">
            <div className="metric-val">{donePoints} / {totalPoints}</div>
            <div className="metric-lbl">Story Points Done ({pct}%)</div>
          </div>

          <div className="celebration-metric-box">
            <div className="metric-val">{sprintIssues.filter(i => i.status === 'done').length}</div>
            <div className="metric-lbl">Tasks Completed</div>
          </div>
        </div>

        {mvpUser && (
          <div className="sprint-mvp-card">
            <div className="mvp-badge">🌟 SPRINT MVP</div>
            <div className="mvp-user-row">
              <img src={(mvpUser as User).avatar} alt={(mvpUser as User).name} className="mvp-avatar" />
              <div>
                <div className="mvp-name">{(mvpUser as User).name}</div>
                <div className="mvp-pts">{maxPts} Story Points Completed</div>
              </div>
            </div>
          </div>
        )}

        <div className="celebration-actions">
          <button className="btn-primary" onClick={onClose}>
            <IconCheck size={16} /> Close & Start Next Sprint
          </button>
        </div>
      </div>
    </div>
  );
};
