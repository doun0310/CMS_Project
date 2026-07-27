import React, { useState } from 'react';
import { useJira } from '../../context/AetherContext';
import type { Epic, Issue, IssueStatus, IssueType, Priority, Sprint, User } from '../../types/Aether';
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
  IconMessage,
  IconUser,
  IconCheck
} from '../common/Icons';

export const KanbanBoard: React.FC = () => {
  const {
    issues,
    sprints,
    epics,
    users,
    currentUser,
    moveIssueStatus,
    setSelectedIssueId,
    createIssue,
    searchQuery,
    onlyMyIssues,
    selectedEpicId,
    selectedType,
    selectedPriority,
    t
  } = useJira();

  const [swimlaneBy, setSwimlaneBy] = useState<'none' | 'assignee' | 'epic' | 'priority'>('none');
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<IssueStatus | null>(null);
  const [quickSummary, setQuickSummary] = useState<string>('');

  const activeSprint = sprints.find((s: Sprint) => s.status === 'active');

  // Filter issues for active sprint (or all issues if no active sprint)
  const filteredIssues = issues.filter((issue: Issue) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKey = issue.key.toLowerCase().includes(q);
      const matchSummary = issue.summary.toLowerCase().includes(q);
      const matchDesc = issue.description.toLowerCase().includes(q);
      const matchLabel = issue.labels.some((l: string) => l.toLowerCase().includes(q));
      if (!matchKey && !matchSummary && !matchDesc && !matchLabel) return false;
    }
    // Only my issues
    if (onlyMyIssues && issue.assigneeId !== currentUser.id) return false;
    // Epic filter
    if (selectedEpicId && issue.epicId !== selectedEpicId) return false;
    // Type filter
    if (selectedType !== 'all' && issue.type !== selectedType) return false;
    // Priority filter
    if (selectedPriority !== 'all' && issue.priority !== selectedPriority) return false;

    // Show active sprint issues or unassigned sprint issues if sprint view
    if (activeSprint) {
      return issue.sprintId === activeSprint.id || !issue.sprintId;
    }
    return true;
  });

  const columns: { status: IssueStatus; title: string; color: string }[] = [
    { status: 'todo', title: t('todo'), color: 'var(--color-todo)' },
    { status: 'in_progress', title: t('in_progress'), color: 'var(--color-in-progress)' },
    { status: 'in_review', title: t('in_review'), color: 'var(--color-in-review)' },
    { status: 'done', title: t('done'), color: 'var(--color-done)' }
  ];

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
      case 'highest': return <PriorityHighest size={16} />;
      case 'high': return <PriorityHigh size={16} />;
      case 'medium': return <PriorityMedium size={16} />;
      case 'low': return <PriorityLow size={16} />;
      case 'lowest': return <PriorityLowest size={16} />;
    }
  };

  const handleQuickAdd = (status: IssueStatus) => {
    if (!quickSummary.trim()) return;
    createIssue({
      summary: quickSummary.trim(),
      status,
      type: 'story',
      priority: 'medium',
      sprintId: activeSprint?.id || null
    });
    setQuickSummary('');
    setAddingToStatus(null);
  };

  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    if (issueId) {
      moveIssueStatus(issueId, status);
    }
    setDraggedIssueId(null);
  };

  const renderCard = (issue: Issue) => {
    const epic = epics.find((e: Epic) => e.id === issue.epicId);
    const assignee = users.find((u: User) => u.id === issue.assigneeId);
    const completedSubtasks = issue.subtasks.filter(s => s.completed).length;

    return (
      <div
        key={issue.id}
        className={`kanban-card ${draggedIssueId === issue.id ? 'dragging' : ''}`}
        draggable
        onDragStart={e => handleDragStart(e, issue.id)}
        onClick={() => setSelectedIssueId(issue.id)}
      >
        {/* Epic Badge */}
        {epic && (
          <div className="card-epic-tag" style={{ backgroundColor: epic.color + '25', color: epic.color }}>
            {epic.summary}
          </div>
        )}

        <div className="card-summary">{issue.summary}</div>

        {/* Labels */}
        {issue.labels.length > 0 && (
          <div className="card-labels">
            {issue.labels.slice(0, 2).map((lbl, idx) => (
              <span key={idx} className="label-badge">#{lbl}</span>
            ))}
          </div>
        )}

        {/* Card Footer: Type, Key, Priority, Points, Assignee */}
        <div className="card-footer">
          <div className="footer-left">
            <span className="card-type" title={issue.type}>{renderTypeIcon(issue.type)}</span>
            <span className="card-key">{issue.key}</span>
            <span className="card-priority" title={issue.priority}>{renderPriorityIcon(issue.priority)}</span>
            {issue.storyPoints > 0 && (
              <span className="points-badge">{issue.storyPoints}</span>
            )}
            {issue.subtasks.length > 0 && (
              <span className="subtasks-badge" title={`${completedSubtasks}/${issue.subtasks.length} subtasks done`}>
                <IconCheck size={12} /> {completedSubtasks}/{issue.subtasks.length}
              </span>
            )}
            {issue.comments.length > 0 && (
              <span className="comments-badge">
                <IconMessage size={12} /> {issue.comments.length}
              </span>
            )}
          </div>

          <div className="footer-right">
            {assignee ? (
              <img src={assignee.avatar} alt={assignee.name} className="assignee-avatar" title={`Assignee: ${assignee.name}`} />
            ) : (
              <div className="unassigned-avatar" title="Unassigned"><IconUser size={14} /></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="kanban-view">
      {/* Board Header Bar */}
      <div className="board-header">
        <div>
          <h1 className="view-title">
            {activeSprint ? activeSprint.name : 'Kanban Board'}
          </h1>
          <p className="view-subtitle">
            {activeSprint ? `Goal: ${activeSprint.goal}` : 'All active tasks and backlog items'}
          </p>
        </div>

        {/* Swimlane controls */}
        <div className="board-controls">
          <span className="control-label">Group Swimlanes:</span>
          <select
            className="control-select"
            value={swimlaneBy}
            onChange={e => setSwimlaneBy(e.target.value as any)}
          >
            <option value="none">None</option>
            <option value="assignee">By Assignee</option>
            <option value="epic">By Epic</option>
            <option value="priority">By Priority</option>
          </select>
        </div>
      </div>

      {/* Board Columns Grid */}
      {swimlaneBy === 'none' ? (
        <div className="kanban-grid">
          {columns.map(col => {
            const colIssues = filteredIssues.filter((i: Issue) => i.status === col.status);
            const totalPoints = colIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);

            return (
              <div
                key={col.status}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, col.status)}
              >
                <div className="column-header">
                  <div className="header-title-group">
                    <span className="status-indicator" style={{ backgroundColor: col.color }}></span>
                    <span className="column-title">{col.title}</span>
                    <span className="column-count">{colIssues.length}</span>
                  </div>
                  <span className="column-points">{totalPoints} pts</span>
                </div>

                <div className="column-cards-list">
                  {colIssues.map(renderCard)}

                  {/* Inline quick add */}
                  {addingToStatus === col.status ? (
                    <div className="quick-add-box animate-fade-in">
                      <textarea
                        autoFocus
                        placeholder="What needs to be done?"
                        value={quickSummary}
                        onChange={e => setQuickSummary(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleQuickAdd(col.status);
                          }
                        }}
                      />
                      <div className="quick-add-actions">
                        <button className="btn-primary-sm" onClick={() => handleQuickAdd(col.status)}>
                          Add Card
                        </button>
                        <button className="btn-ghost-sm" onClick={() => setAddingToStatus(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-add-card" onClick={() => setAddingToStatus(col.status)}>
                      <IconPlus size={14} /> Add item
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Swimlanes view */
        <div className="swimlane-container">
          {/* Render swimlanes based on swimlaneBy */}
          {(swimlaneBy === 'assignee' ? users : swimlaneBy === 'epic' ? epics : ['highest', 'high', 'medium', 'low', 'lowest']).map((group: any) => {
            const groupId = typeof group === 'string' ? group : group.id;
            const groupName = typeof group === 'string' ? group.toUpperCase() : group.name || group.summary;

            const groupIssues = filteredIssues.filter((i: Issue) => {
              if (swimlaneBy === 'assignee') return i.assigneeId === groupId;
              if (swimlaneBy === 'epic') return i.epicId === groupId;
              return i.priority === groupId;
            });

            return (
              <div key={groupId} className="swimlane-group">
                <div className="swimlane-header">
                  <span>{groupName}</span>
                  <span className="swimlane-count">({groupIssues.length} issues)</span>
                </div>
                <div className="kanban-grid">
                  {columns.map(col => {
                    const colIssues = groupIssues.filter((i: Issue) => i.status === col.status);
                    return (
                      <div
                        key={col.status}
                        className="kanban-column swimlane-col"
                        onDragOver={handleDragOver}
                        onDrop={e => handleDrop(e, col.status)}
                      >
                        <div className="column-cards-list">
                          {colIssues.map(renderCard)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
