import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Epic, Issue, IssueType, Priority, Sprint, User } from '../../types/Aether';
import { SprintCelebrationModal } from '../modals/SprintCelebrationModal';
import {
  IconFeature,
  IconWorkItem,
  IconBug,
  IconInitiative,
  IconSubtask,
  PriorityHighest,
  PriorityHigh,
  PriorityMedium,
  PriorityLow,
  PriorityLowest,
  IconPlus,
  IconPlay,
  IconCheck,
  IconUser,
  IconCalendar,
  IconSettings,
  IconTrash
} from '../common/Icons';

import { isIssueTypeMatch } from '../../utils/typeMatcher';
import { SprintGoalBanner } from '../common/SprintGoalBanner';

export const BacklogView: React.FC = () => {
  const {
    issues,
    sprints,
    epics,
    users,
    currentUser,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    createIssue,
    updateIssue,
    setSelectedIssueId,
    searchQuery,
    onlyMyIssues,
    selectedType,
    t
  } = useAether();

  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');

  const [addingToSprintId, setAddingToSprintId] = useState<string | null | 'backlog'>(null);
  const [quickSummary, setQuickSummary] = useState('');
  const [celebratingSprint, setCelebratingSprint] = useState<Sprint | null>(null);
  const [selectedBacklogIssueIds, setSelectedBacklogIssueIds] = useState<string[]>([]);
  const [planningSprintId, setPlanningSprintId] = useState<string>(
    sprints.find(sprint => sprint.status === 'active')?.id || sprints.find(sprint => sprint.status === 'future')?.id || ''
  );

  const handleCompleteSprint = (sprint: Sprint) => {
    completeSprint(sprint.id);
    setCelebratingSprint(sprint);
  };

  const handleEditSprint = (sprint: Sprint) => {
    const name = window.prompt('Sprint name', sprint.name);
    if (!name?.trim()) return;
    const goal = window.prompt('Sprint goal', sprint.goal);
    if (goal === null) return;
    updateSprint(sprint.id, { name: name.trim(), goal: goal.trim() });
  };

  const handleDeleteSprint = (sprint: Sprint) => {
    if (window.confirm(`Delete ${sprint.name}? Assigned issues will move to the backlog.`)) deleteSprint(sprint.id);
  };

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!issue.key.toLowerCase().includes(q) && !issue.summary.toLowerCase().includes(q)) return false;
    }
    if (onlyMyIssues && issue.assigneeId !== currentUser.id) return false;
    if (selectedType !== 'all' && !isIssueTypeMatch(issue.type, selectedType)) return false;
    return true;
  });

  const renderTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'feature':
      case 'story':
        return <IconFeature size={16} />;
      case 'workitem':
      case 'task':
        return <IconWorkItem size={16} />;
      case 'bug':
        return <IconBug size={16} />;
      case 'initiative':
      case 'epic':
        return <IconInitiative size={16} />;
      default:
        return <IconSubtask size={16} />;
    }
  };

  const renderPriorityIcon = (prio: Priority) => {
    switch (prio) {
      case 'highest': return <PriorityHighest size={14} />;
      case 'high': return <PriorityHigh size={14} />;
      case 'medium': return <PriorityMedium size={14} />;
      case 'low': return <PriorityLow size={14} />;
      case 'lowest': return <PriorityLowest size={14} />;
    }
  };

  const handleCreateSprintSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    createSprint(newSprintName.trim(), newSprintGoal.trim());
    setNewSprintName('');
    setNewSprintGoal('');
    setIsCreatingSprint(false);
  };

  const handleQuickAdd = (sprintIdTarget: string | null) => {
    if (!quickSummary.trim()) return;
    createIssue({
      summary: quickSummary.trim(),
      sprintId: sprintIdTarget,
      status: 'todo',
      type: 'story'
    });
    setQuickSummary('');
    setAddingToSprintId(null);
  };

  const renderIssueRow = (issue: Issue, isBacklog = false) => {
    const epic = epics.find((e: Epic) => e.id === issue.epicId);
    const assignee = users.find((u: User) => u.id === issue.assigneeId);

    return (
      <div
        key={issue.id}
        className="backlog-issue-row"
        onClick={() => setSelectedIssueId(issue.id)}
      >
        <div className="row-left">
          {isBacklog && (
            <input
              className="backlog-row-check"
              type="checkbox"
              checked={selectedBacklogIssueIds.includes(issue.id)}
              onClick={event => event.stopPropagation()}
              onChange={() => setSelectedBacklogIssueIds(current =>
                current.includes(issue.id) ? current.filter(id => id !== issue.id) : [...current, issue.id]
              )}
              aria-label={`${t('selectIssue')} ${issue.key}`}
            />
          )}
          <span className="row-type" title={issue.type}>{renderTypeIcon(issue.type)}</span>
          <span className="row-key">{issue.key}</span>
          <span className="row-summary">{issue.summary}</span>
        </div>

        <div className="row-right">
          {epic && (
            <span className="row-epic-tag" style={{ backgroundColor: epic.color + '20', color: epic.color }}>
              {epic.summary}
            </span>
          )}

          <span className={`status-badge status-${issue.status}`}>
            {t(issue.status)}
          </span>

          <span className="row-priority" title={issue.priority}>
            {renderPriorityIcon(issue.priority)}
          </span>

          {assignee ? (
            <img src={assignee.avatar} alt={assignee.name} className="assignee-avatar" title={assignee.name} />
          ) : (
            <div className="unassigned-avatar"><IconUser size={14} /></div>
          )}

          <span className="points-badge">{issue.storyPoints || '-'}</span>

          {/* Move to Sprint / Backlog Selector */}
          <select
            className="row-sprint-select"
            value={issue.sprintId || 'backlog'}
            onClick={e => e.stopPropagation()}
            onChange={e => {
              const val = e.target.value;
              updateIssue(issue.id, { sprintId: val === 'backlog' ? null : val });
            }}
          >
            <option value="backlog">{t('backlogLabel')}</option>
            {sprints.map((s: Sprint) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderSprintSection = (sprint: Sprint) => {
    const sprintIssues = filteredIssues.filter((i: Issue) => i.sprintId === sprint.id);
    const totalPoints = sprintIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
    const donePoints = sprintIssues
      .filter((i: Issue) => i.status === 'done')
      .reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
    const completionPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

    return (
      <div key={sprint.id} className={`sprint-block ${sprint.status}`}>
        <div className="sprint-header">
          <div className="sprint-title-group">
            <span className="sprint-name-text">{sprint.name}</span>
            <span className="sprint-status-tag">{sprint.status.toUpperCase()}</span>
            <span className="sprint-date-info">
              <IconCalendar size={14} /> {sprint.startDate} ~ {sprint.endDate}
            </span>
            <span className="sprint-points-summary">{donePoints} / {totalPoints} {t('storyPointsDone')}</span>
          </div>

          <div className="sprint-actions">
            <button className="btn-ghost-sm" onClick={() => handleEditSprint(sprint)} title="Edit sprint"><IconSettings size={14} /></button>
            <button className="btn-ghost-sm text-danger" onClick={() => handleDeleteSprint(sprint)} title="Delete sprint"><IconTrash size={14} /></button>
            {sprint.status === 'future' && (
              <button className="btn-success-sm" onClick={() => startSprint(sprint.id)}>
                <IconPlay size={14} /> {t('startSprint')}
              </button>
            )}
            {sprint.status === 'active' && (
              <button className="btn-primary-sm" onClick={() => handleCompleteSprint(sprint)}>
                <IconCheck size={14} /> {t('completeSprint')}
              </button>
            )}
          </div>
        </div>

        {sprint.goal && <div className="sprint-goal-text">{t('goalPrefix')}: {sprint.goal}</div>}

        <div className="sprint-progress-overview" aria-label={`${sprint.name} ${completionPct}% ${t('completed')}`}>
          <div className="sprint-progress-copy"><span>{t('completion')}</span><strong>{completionPct}%</strong></div>
          <div className="sprint-progress-track"><span style={{ width: `${completionPct}%` }} /></div>
        </div>

        <div className="sprint-issues-list">
          {sprintIssues.length === 0 ? (
            <div className="empty-sprint-msg">{t('sprintEmpty')}</div>
          ) : (
            sprintIssues.map(issue => renderIssueRow(issue))
          )}

          {/* Quick inline issue add */}
          {addingToSprintId === sprint.id ? (
            <div className="quick-add-inline">
              <input
                type="text"
                autoFocus
                placeholder={t('summary')}
                value={quickSummary}
                onChange={e => setQuickSummary(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd(sprint.id)}
              />
              <button className="btn-primary-sm" onClick={() => handleQuickAdd(sprint.id)}>{t('add')}</button>
              <button className="btn-ghost-sm" onClick={() => setAddingToSprintId(null)}>{t('cancel')}</button>
            </div>
          ) : (
            <button className="btn-add-issue-row" onClick={() => setAddingToSprintId(sprint.id)}>
              <IconPlus size={14} /> {t('createIssueIn')} {sprint.name}
            </button>
          )}
        </div>
      </div>
    );
  };

  const backlogIssues = filteredIssues.filter((i: Issue) => !i.sprintId);
  const backlogPoints = backlogIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
  const activeSprint = sprints.find(sprint => sprint.status === 'active');
  const activeSprintIssues = activeSprint ? filteredIssues.filter(issue => issue.sprintId === activeSprint.id) : [];
  const activeSprintDone = activeSprintIssues.filter(issue => issue.status === 'done').length;
  const futureSprintCount = sprints.filter(sprint => sprint.status === 'future').length;

  const handleBulkPlan = () => {
    if (!planningSprintId || selectedBacklogIssueIds.length === 0) return;
    selectedBacklogIssueIds.forEach(issueId => updateIssue(issueId, { sprintId: planningSprintId }));
    setSelectedBacklogIssueIds([]);
  };

  return (
    <div className="backlog-view">
      {/* Realtime Sprint Goal & Progress Banner */}
      <SprintGoalBanner />

      <div className="view-header-bar">
        <div>
          <h1 className="view-title">{t('backlogViewTitle')}</h1>
        </div>

        <button className="btn-primary" onClick={() => setIsCreatingSprint(true)}>
          <IconPlus size={16} /> {t('createSprint')}
        </button>
      </div>

      <section className="backlog-overview" aria-label={t('backlogViewTitle')}>
        <div className="backlog-overview-card active">
          <span>{t('activeSprint')}</span>
          <strong>{activeSprint?.name || t('notStarted')}</strong>
          <small>{activeSprint ? `${activeSprintDone}/${activeSprintIssues.length} ${t('completed')}` : t('createSprint')}</small>
        </div>
        <div className="backlog-overview-card">
          <span>{t('backlogLabel')}</span>
          <strong>{backlogIssues.length} {t('issues')}</strong>
          <small>{backlogPoints} {t('pointsShort')}</small>
        </div>
        <div className="backlog-overview-card">
          <span>{t('sprints')}</span>
          <strong>{futureSprintCount}</strong>
          <small>{t('notStarted')}</small>
        </div>
      </section>

      {/* Create Sprint Modal */}
      {isCreatingSprint && (
        <div className="modal-backdrop-center animate-fade-in">
          <div className="modal-box">
            <h2>{t('createSprintTitle')}</h2>
            <form onSubmit={handleCreateSprintSubmit}>
              <div className="form-group">
                <label>{t('sprintName')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('sprintNamePlaceholder')}
                  value={newSprintName}
                  onChange={e => setNewSprintName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>{t('sprintGoal')}</label>
                <textarea
                  placeholder={t('sprintGoalPlaceholder')}
                  value={newSprintGoal}
                  onChange={e => setNewSprintGoal(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsCreatingSprint(false)}>{t('cancel')}</button>
                <button type="submit" className="btn-primary">{t('createSprint')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sprints Sections */}
      <div className="sprints-container">
        {[...sprints]
          .sort((a, b) => ({ active: 0, future: 1, completed: 2 }[a.status] - { active: 0, future: 1, completed: 2 }[b.status]))
          .map(renderSprintSection)}
      </div>

      {/* Backlog Section */}
      <div className="sprint-block backlog-block">
        <div className="sprint-header">
          <div className="sprint-title-group">
            <span className="sprint-name-text">{t('backlogLabel')}</span>
            <span className="sprint-points-summary">({backlogIssues.length} {t('issues')} • {backlogPoints} SP)</span>
          </div>
          {backlogIssues.length > 0 && (
            <div className="backlog-plan-controls">
              <span>{selectedBacklogIssueIds.length ? `${selectedBacklogIssueIds.length} ${t('selected')}` : t('selectToPlan')}</span>
              <select value={planningSprintId} onChange={event => setPlanningSprintId(event.target.value)}>
                <option value="">{t('chooseSprint')}</option>
                {sprints.filter(sprint => sprint.status !== 'completed').map(sprint => (
                  <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
                ))}
              </select>
              <button className="btn-primary-sm" onClick={handleBulkPlan} disabled={!planningSprintId || selectedBacklogIssueIds.length === 0}>
                {t('planSelected')}
              </button>
            </div>
          )}
        </div>

        <div className="sprint-issues-list">
          {backlogIssues.length === 0 ? (
            <div className="empty-sprint-msg">{t('backlogEmpty')}</div>
          ) : (
            backlogIssues.map(issue => renderIssueRow(issue, true))
          )}

          {addingToSprintId === 'backlog' ? (
            <div className="quick-add-inline">
              <input
                type="text"
                autoFocus
                placeholder={t('quickAddPlaceholder')}
                value={quickSummary}
                onChange={e => setQuickSummary(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd(null)}
              />
              <button className="btn-primary-sm" onClick={() => handleQuickAdd(null)}>{t('add')}</button>
              <button className="btn-ghost-sm" onClick={() => setAddingToSprintId(null)}>{t('cancel')}</button>
            </div>
          ) : (
            <button className="btn-add-issue-row" onClick={() => setAddingToSprintId('backlog')}>
              <IconPlus size={14} /> {t('createIssueIn')} {t('backlogLabel')}
            </button>
          )}
        </div>
      </div>

      <SprintCelebrationModal
        sprint={celebratingSprint}
        sprintIssues={celebratingSprint ? issues.filter(i => i.sprintId === celebratingSprint.id) : []}
        users={users}
        onClose={() => setCelebratingSprint(null)}
      />
    </div>
  );
};
