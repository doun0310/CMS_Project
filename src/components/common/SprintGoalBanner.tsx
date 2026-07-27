import React from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconTarget, IconClock, IconCheckCircle, IconZap } from './Icons';

export const SprintGoalBanner: React.FC = () => {
  const { sprints, issues } = useAether();
  const activeSprint = sprints.find(s => s.status === 'active');

  if (!activeSprint) return null;

  // Filter issues belonging to the active sprint
  const sprintIssues = issues.filter(i => i.sprintId === activeSprint.id);
  const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const donePoints = sprintIssues
    .filter(i => i.status === 'done')
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const inProgressPoints = sprintIssues
    .filter(i => i.status === 'in_progress' || i.status === 'in_review')
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);
  const todoPoints = sprintIssues
    .filter(i => i.status === 'todo')
    .reduce((sum, i) => sum + (i.storyPoints || 0), 0);

  const completionPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  const doneWidth = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;
  const inProgressWidth = totalPoints > 0 ? (inProgressPoints / totalPoints) * 100 : 0;

  // Days remaining calculation
  const endDate = new Date(activeSprint.endDate);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const deadlineLabel = daysLeft === 0 ? 'Due today' : `${daysLeft}d left`;

  return (
    <section
      className="sprint-goal-banner animate-fade-in"
      aria-label={`${activeSprint.name} sprint goal and progress`}
      aria-live="polite"
    >
      <div className="goal-summary">
        <div className="goal-header-row">
          <span className="sprint-badge-label">
            <IconTarget size={13} /> {activeSprint.name}
          </span>
          <span className="days-left-chip" title={`${daysLeft} days remaining`}>
            <span className="status-dot-active" />
            <IconClock size={11} /> {deadlineLabel}
          </span>
        </div>
        <p className="goal-statement-text" title={activeSprint.goal}>
          <span className="goal-prefix">Goal</span>
          {activeSprint.goal}
        </p>
      </div>

      <div className="sprint-progress-summary">
        <div className="progress-header-meta">
          <span className="completion-label"><strong>{completionPct}%</strong> complete</span>
          <span className="meta-numbers">
            <strong>{donePoints}</strong> / {totalPoints} pts
          </span>
        </div>

        <div
          className="visual-progress-track"
          title={`Done ${donePoints} pts, in progress ${inProgressPoints} pts, to do ${todoPoints} pts`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={completionPct}
        >
          <span className="segment-done" style={{ width: `${doneWidth}%` }} />
          <span className="segment-in-progress" style={{ width: `${inProgressWidth}%` }} />
        </div>

        <div className="stat-pills-row">
          <span className="pill-item done-pill" title="Completed story points">
            <IconCheckCircle size={11} /> Done <strong>{donePoints}</strong>
          </span>
          <span className="pill-item progress-pill" title="Story points in progress or review">
            <IconZap size={11} /> Active <strong>{inProgressPoints}</strong>
          </span>
          <span className="pill-item todo-pill" title="Story points not started">
            <IconClock size={11} /> To do <strong>{todoPoints}</strong>
          </span>
        </div>
      </div>
    </section>
  );
};
