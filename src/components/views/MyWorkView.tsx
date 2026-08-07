import React from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Issue } from '../../types/Aether';
import { IconPlus } from '../common/Icons';

export const MyWorkView: React.FC = () => {
  const { currentUser, issues, sprints, setSelectedIssueId, setIsCreateModalOpen, setViewMode, t } = useAether();
  const activeSprint = sprints.find(sprint => sprint.status === 'active');
  const myIssues = issues.filter(issue => issue.assigneeId === currentUser.id && issue.status !== 'done');
  const inProgress = myIssues.filter(issue => issue.status === 'in_progress');
  const readyNext = myIssues.filter(issue => issue.status === 'todo');
  const blocked = myIssues.filter(issue => (issue.blockedBy?.length ?? 0) > 0);
  const priorityLabels = {
    highest: t('priorityHighest'),
    high: t('priorityHigh'),
    medium: t('priorityMedium'),
    low: t('priorityLow'),
    lowest: t('priorityLowest')
  };

  const renderIssue = (issue: Issue) => (
    <button key={issue.id} className="my-work-issue" onClick={() => setSelectedIssueId(issue.id)}>
      <span className={`my-work-status ${issue.status}`}></span>
      <span className="my-work-issue-content">
        <strong>{issue.summary}</strong>
        <span>{issue.key} · {issue.storyPoints} {t('storyPoints')}</span>
      </span>
      <span className="my-work-priority">{priorityLabels[issue.priority]}</span>
    </button>
  );

  const renderSection = (title: string, items: Issue[], empty: string) => (
    <section className="my-work-section">
      <div className="my-work-section-heading">
        <div>
          <h2>{title}</h2>
        </div>
        <span>{items.length}</span>
      </div>
      {items.length ? <div className="my-work-list">{items.map(renderIssue)}</div> : <p className="my-work-empty">{empty}</p>}
    </section>
  );

  return (
    <div className="my-work-view animate-fade-in">
      <header className="my-work-header">
        <div>
          <p className="eyebrow">{activeSprint ? activeSprint.name : t('backlogLabel')}</p>
          <h1>{t('myWorkGreeting')}, {currentUser.name.split(' ')[0]}</h1>
        </div>
        <div className="my-work-actions">
          <button className="btn-ghost-sm" onClick={() => setViewMode('board')}>{t('openBoard')}</button>
          <button className="btn-primary-sm" onClick={() => setIsCreateModalOpen(true)}>
            <IconPlus size={14} /> {t('createIssue')}
          </button>
        </div>
      </header>

      <div className="my-work-summary">
        <div><span>{t('in_progress')}</span><strong>{inProgress.length}</strong></div>
        <div><span>{t('todo')}</span><strong>{readyNext.length}</strong></div>
        <div className={blocked.length ? 'needs-attention' : ''}><span>{t('blocked')}</span><strong>{blocked.length}</strong></div>
      </div>

      <div className="my-work-grid">
        {renderSection(t('workingNow'), inProgress, t('workingNowEmpty'))}
        {renderSection(t('upNext'), readyNext, t('upNextEmpty'))}
      </div>
      {blocked.length > 0 && renderSection(t('needsAttention'), blocked, t('needsAttentionEmpty'))}
    </div>
  );
};
