import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';
import type { Issue, IssueType, Priority, Sprint } from '../../types/jira';
import {
  IconStory,
  IconTask,
  IconBug,
  IconEpic,
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
  IconCalendar
} from '../common/Icons';

export const BacklogView: React.FC = () => {
  const {
    issues,
    sprints,
    epics,
    users,
    createSprint,
    startSprint,
    completeSprint,
    createIssue,
    updateIssue,
    setSelectedIssueId,
    searchQuery,
    onlyMyIssues,
    selectedType
  } = useJira();

  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');

  const [addingToSprintId, setAddingToSprintId] = useState<string | null | 'backlog'>(null);
  const [quickSummary, setQuickSummary] = useState('');

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!issue.key.toLowerCase().includes(q) && !issue.summary.toLowerCase().includes(q)) return false;
    }
    if (onlyMyIssues && issue.assigneeId !== users[2].id) return false;
    if (selectedType !== 'all' && issue.type !== selectedType) return false;
    return true;
  });

  const renderTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'story': return <IconStory size={16} />;
      case 'task': return <IconTask size={16} />;
      case 'bug': return <IconBug size={16} />;
      case 'epic': return <IconEpic size={16} />;
      default: return <IconSubtask size={16} />;
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

  const handleCreateSprintSubmit = (e: React.FormEvent) => {
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

  const renderIssueRow = (issue: Issue) => {
    const epic = epics.find(e => e.id === issue.epicId);
    const assignee = users.find(u => u.id === issue.assigneeId);

    return (
      <div
        key={issue.id}
        className="backlog-issue-row"
        onClick={() => setSelectedIssueId(issue.id)}
      >
        <div className="row-left">
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
            {issue.status.replace('_', ' ').toUpperCase()}
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
              const val = e.target.value === 'backlog' ? null : e.target.value;
              updateIssue(issue.id, { sprintId: val });
            }}
          >
            <option value="backlog">Backlog</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderSprintSection = (sprint: Sprint) => {
    const sprintIssues = filteredIssues.filter(i => i.sprintId === sprint.id);
    const totalPoints = sprintIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
    const donePoints = sprintIssues
      .filter(i => i.status === 'done')
      .reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);

    return (
      <div key={sprint.id} className={`sprint-block ${sprint.status}`}>
        <div className="sprint-header">
          <div className="sprint-title-group">
            <span className="sprint-name-text">{sprint.name}</span>
            <span className="sprint-status-tag">{sprint.status.toUpperCase()}</span>
            <span className="sprint-date-info">
              <IconCalendar size={14} /> {sprint.startDate} ~ {sprint.endDate}
            </span>
            <span className="sprint-points-summary">
              {donePoints} / {totalPoints} Story Points Done
            </span>
          </div>

          <div className="sprint-actions">
            {sprint.status === 'future' && (
              <button className="btn-success-sm" onClick={() => startSprint(sprint.id)}>
                <IconPlay size={14} /> Start Sprint
              </button>
            )}
            {sprint.status === 'active' && (
              <button className="btn-primary-sm" onClick={() => completeSprint(sprint.id)}>
                <IconCheck size={14} /> Complete Sprint
              </button>
            )}
          </div>
        </div>

        {sprint.goal && <div className="sprint-goal-text">Goal: {sprint.goal}</div>}

        <div className="sprint-issues-list">
          {sprintIssues.length === 0 ? (
            <div className="empty-sprint-msg">No issues assigned to this sprint yet. Drag or select items below.</div>
          ) : (
            sprintIssues.map(renderIssueRow)
          )}

          {/* Quick inline issue add */}
          {addingToSprintId === sprint.id ? (
            <div className="quick-add-inline">
              <input
                type="text"
                autoFocus
                placeholder="Issue summary..."
                value={quickSummary}
                onChange={e => setQuickSummary(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd(sprint.id)}
              />
              <button className="btn-primary-sm" onClick={() => handleQuickAdd(sprint.id)}>Add</button>
              <button className="btn-ghost-sm" onClick={() => setAddingToSprintId(null)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-add-issue-row" onClick={() => setAddingToSprintId(sprint.id)}>
              <IconPlus size={14} /> Create issue in {sprint.name}
            </button>
          )}
        </div>
      </div>
    );
  };

  const backlogIssues = filteredIssues.filter(i => !i.sprintId);
  const backlogPoints = backlogIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);

  return (
    <div className="backlog-view">
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Backlog & Sprint Management</h1>
          <p className="view-subtitle">Organize sprint commitments and refine long-term feature backlog</p>
        </div>

        <button className="btn-primary" onClick={() => setIsCreatingSprint(true)}>
          <IconPlus size={16} /> Create Sprint
        </button>
      </div>

      {/* Create Sprint Modal */}
      {isCreatingSprint && (
        <div className="modal-backdrop animate-fade-in">
          <div className="modal-box">
            <h2>Create New Sprint</h2>
            <form onSubmit={handleCreateSprintSubmit}>
              <div className="form-group">
                <label>Sprint Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CLOUD Sprint 26"
                  value={newSprintName}
                  onChange={e => setNewSprintName(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Sprint Goal</label>
                <textarea
                  placeholder="Describe sprint objective..."
                  value={newSprintGoal}
                  onChange={e => setNewSprintGoal(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setIsCreatingSprint(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Sprint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sprints Sections */}
      <div className="sprints-container">
        {sprints.map(renderSprintSection)}
      </div>

      {/* Backlog Section */}
      <div className="sprint-block backlog-block">
        <div className="sprint-header">
          <div className="sprint-title-group">
            <span className="sprint-name-text">Backlog</span>
            <span className="sprint-points-summary">({backlogIssues.length} issues • {backlogPoints} Story Points)</span>
          </div>
        </div>

        <div className="sprint-issues-list">
          {backlogIssues.length === 0 ? (
            <div className="empty-sprint-msg">Your backlog is clear! All items assigned to sprints.</div>
          ) : (
            backlogIssues.map(renderIssueRow)
          )}

          {addingToSprintId === 'backlog' ? (
            <div className="quick-add-inline">
              <input
                type="text"
                autoFocus
                placeholder="What needs to be done?"
                value={quickSummary}
                onChange={e => setQuickSummary(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickAdd(null)}
              />
              <button className="btn-primary-sm" onClick={() => handleQuickAdd(null)}>Add</button>
              <button className="btn-ghost-sm" onClick={() => setAddingToSprintId(null)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-add-issue-row" onClick={() => setAddingToSprintId('backlog')}>
              <IconPlus size={14} /> Create issue in Backlog
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
