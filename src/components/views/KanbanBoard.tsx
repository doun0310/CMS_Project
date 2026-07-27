import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Issue, IssueStatus, IssueType, Priority, Sprint } from '../../types/Aether';
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
  IconCheck,
  IconChevronRight,
  IconChevronDown
} from '../common/Icons';

type SwimlaneMode = 'none' | 'assignee' | 'epic' | 'priority';

interface SwimlaneGroup {
  id: string;
  name: string;
}

const UNASSIGNED_GROUP_ID = 'unassigned';
const NO_EPIC_GROUP_ID = 'no-epic';
const PRIORITY_GROUPS: Priority[] = ['highest', 'high', 'medium', 'low', 'lowest'];

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
    selectedPriority
  } = useAether();

  const [swimlaneBy, setSwimlaneBy] = useState<SwimlaneMode>('none');
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<IssueStatus | null>(null);
  const [quickSummary, setQuickSummary] = useState<string>('');

  // Column collapse state
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({
    todo: false,
    in_progress: false,
    in_review: false,
    done: false
  });

  const toggleColumnCollapse = (status: string) => {
    setCollapsedColumns(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const activeSprint = sprints.find((s: Sprint) => s.status === 'active');

  // Filter issues for active sprint (or all issues if no active sprint)
  const filteredIssues = issues.filter((issue: Issue) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchKey = issue.key.toLowerCase().includes(q);
      const matchSummary = issue.summary.toLowerCase().includes(q);
      const matchDesc = (issue.description || '').toLowerCase().includes(q);
      const matchLabel = (issue.labels || []).some((l: string) => l.toLowerCase().includes(q));
      if (!matchKey && !matchSummary && !matchDesc && !matchLabel) return false;
    }
    if (onlyMyIssues && issue.assigneeId !== currentUser.id) return false;
    if (selectedEpicId && issue.epicId !== selectedEpicId) return false;
    if (selectedType !== 'all' && issue.type !== selectedType) return false;
    if (selectedPriority !== 'all' && issue.priority !== selectedPriority) return false;

    if (activeSprint) {
      return issue.sprintId === activeSprint.id || !issue.sprintId;
    }
    return true;
  });

  const columns: { status: IssueStatus; title: string; color: string; wipLimit?: number }[] = [
    { status: 'todo', title: 'TO DO', color: '#94a3b8' },
    { status: 'in_progress', title: 'IN PROGRESS', color: '#6366f1', wipLimit: 4 },
    { status: 'in_review', title: 'IN REVIEW', color: '#f59e0b', wipLimit: 3 },
    { status: 'done', title: 'DONE', color: '#10b981' }
  ];

  // Build swimlane groups dynamically based on mode
  const swimlaneGroups: SwimlaneGroup[] = [];
  if (swimlaneBy === 'assignee') {
    users.forEach(u => swimlaneGroups.push({ id: u.id, name: u.name }));
    swimlaneGroups.push({ id: UNASSIGNED_GROUP_ID, name: 'Unassigned' });
  } else if (swimlaneBy === 'epic') {
    epics.forEach(e => swimlaneGroups.push({ id: e.id, name: `${e.key}: ${e.summary}` }));
    swimlaneGroups.push({ id: NO_EPIC_GROUP_ID, name: 'Issues without Epic' });
  } else if (swimlaneBy === 'priority') {
    PRIORITY_GROUPS.forEach(p => swimlaneGroups.push({ id: p, name: `${p.toUpperCase()} Priority` }));
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
    setDraggedIssueId(issueId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      moveIssueStatus(issueId, targetStatus);
      setDraggedIssueId(null);
    }
  };

  const handleQuickAdd = (status: IssueStatus) => {
    if (!quickSummary.trim()) return;
    createIssue({
      summary: quickSummary.trim(),
      status,
      sprintId: activeSprint?.id || null
    });
    setQuickSummary('');
    setAddingToStatus(null);
  };

  const renderTypeIcon = (type: IssueType) => {
    switch (type) {
      case 'story': return <IconStory size={14} />;
      case 'task': return <IconTask size={14} />;
      case 'bug': return <IconBug size={14} />;
      case 'epic': return <IconEpic size={14} />;
      default: return <IconSubtask size={14} />;
    }
  };

  const renderPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'highest': return <PriorityHighest size={14} />;
      case 'high': return <PriorityHigh size={14} />;
      case 'medium': return <PriorityMedium size={14} />;
      case 'low': return <PriorityLow size={14} />;
      default: return <PriorityLowest size={14} />;
    }
  };

  const renderCard = (issue: Issue) => {
    const assignee = users.find(u => u.id === issue.assigneeId);
    const epic = epics.find(e => e.id === issue.epicId);
    const completedSubtasks = (issue.subtasks || []).filter(s => s.completed).length;

    return (
      <div
        key={issue.id}
        className={`kanban-card ${draggedIssueId === issue.id ? 'dragging' : ''}`}
        draggable
        onDragStart={e => handleDragStart(e, issue.id)}
        onClick={() => setSelectedIssueId(issue.id)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setSelectedIssueId(issue.id)}
      >
        {epic && (
          <div className="card-epic-tag" style={{ color: epic.color, borderColor: epic.color }}>
            {epic.key}
          </div>
        )}

        <div className="card-summary">{issue.summary}</div>

        {(issue.labels || []).length > 0 && (
          <div className="card-labels">
            {issue.labels.slice(0, 2).map((lbl, idx) => (
              <span key={idx} className="label-badge">#{lbl}</span>
            ))}
          </div>
        )}

        <div className="card-footer">
          <div className="footer-left">
            <span className="card-type" title={issue.type}>{renderTypeIcon(issue.type)}</span>
            <span className="card-key">{issue.key}</span>
            <span className="card-priority" title={issue.priority}>{renderPriorityIcon(issue.priority)}</span>
            {issue.storyPoints > 0 && (
              <span className="points-badge">{issue.storyPoints}</span>
            )}
            {(issue.subtasks || []).length > 0 && (
              <span className="subtasks-badge" title={`${completedSubtasks}/${issue.subtasks.length} subtasks done`}>
                <IconCheck size={12} /> {completedSubtasks}/{issue.subtasks.length}
              </span>
            )}
            {(issue.comments || []).length > 0 && (
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
    <div className="kanban-view animate-fade-in">
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
            onChange={e => setSwimlaneBy(e.target.value as SwimlaneMode)}
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
            const isCollapsed = !!collapsedColumns[col.status];
            const isWipExceeded = col.wipLimit && colIssues.length > col.wipLimit;

            if (isCollapsed) {
              return (
                <div
                  key={col.status}
                  className="kanban-column collapsed-column"
                  onClick={() => toggleColumnCollapse(col.status)}
                  title={`Expand ${col.title} column`}
                >
                  <div className="collapsed-header">
                    <span className="status-indicator" style={{ backgroundColor: col.color }}></span>
                    <span className="collapsed-title">{col.title} ({colIssues.length})</span>
                    <IconChevronRight size={14} />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={col.status}
                className={`kanban-column ${isWipExceeded ? 'wip-exceeded' : ''}`}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, col.status)}
              >
                <div className="column-header">
                  <div className="header-title-group">
                    <button
                      className="btn-collapse-col"
                      onClick={() => toggleColumnCollapse(col.status)}
                      title="Collapse column"
                    >
                      <IconChevronDown size={14} />
                    </button>
                    <span className="status-indicator" style={{ backgroundColor: col.color }}></span>
                    <span className="column-title">{col.title}</span>
                    <span className="column-count">{colIssues.length}</span>
                    {isWipExceeded && (
                      <span className="wip-badge" title={`WIP limit exceeded (${col.wipLimit} max)`}>
                        ⚠️ WIP Exceeded
                      </span>
                    )}
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
          {swimlaneGroups.map(group => {
            const groupIssues = filteredIssues.filter((i: Issue) => {
              if (swimlaneBy === 'assignee') {
                return group.id === UNASSIGNED_GROUP_ID
                  ? i.assigneeId === null
                  : i.assigneeId === group.id;
              }
              if (swimlaneBy === 'epic') {
                return group.id === NO_EPIC_GROUP_ID ? i.epicId === null : i.epicId === group.id;
              }
              return i.priority === group.id;
            });

            return (
              <div key={group.id} className="swimlane-group">
                <div className="swimlane-header">
                  <span>{group.name}</span>
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
