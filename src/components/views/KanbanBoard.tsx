import React, { useCallback, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { TagSearchFilter } from '../common/TagSearchFilter';
import type { Epic, Issue, IssueStatus, Priority, Sprint, User } from '../../types/Aether';
import {
  IconFeature,
  IconWorkItem,
  IconBug,
  IconInitiative,
  IconSubtask,
  IconBoard,
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
  IconChevronDown,
  IconSettings
} from '../common/Icons';
import { SprintGoalBanner } from '../common/SprintGoalBanner';
import { isIssueTypeMatch } from '../../utils/typeMatcher';
import { filterIssuesWithJQL } from '../../utils/jqlEngine';

type SwimlaneMode = 'none' | 'assignee' | 'epic' | 'initiative' | 'priority';
type CardDensity = 'compact' | 'standard';

interface SwimlaneGroup {
  id: string;
  name: string;
}

const UNASSIGNED_GROUP_ID = 'unassigned';
const NO_EPIC_GROUP_ID = 'no-epic';
const PRIORITY_GROUPS: Priority[] = ['highest', 'high', 'medium', 'low', 'lowest'];

interface KanbanCardProps {
  issue: Issue;
  assignee?: User;
  epic?: Epic;
  isDragging: boolean;
  cardDensity: CardDensity;
  subtasksDoneText: string;
  assigneeLabelText: string;
  unassignedText: string;
  onDragStart: (e: React.DragEvent, issueId: string) => void;
  onSelectIssue: (issueId: string) => void;
}

const KanbanCard = React.memo(({
  issue,
  assignee,
  epic,
  isDragging,
  cardDensity,
  subtasksDoneText,
  assigneeLabelText,
  unassignedText,
  onDragStart,
  onSelectIssue,
}: KanbanCardProps) => {
  const completedSubtasks = (issue.subtasks || []).filter(s => s.completed).length;
  const typeIcon = issue.type === 'feature' || issue.type === 'story'
    ? <IconFeature size={14} />
    : issue.type === 'workitem' || issue.type === 'task'
      ? <IconWorkItem size={14} />
      : issue.type === 'bug'
        ? <IconBug size={14} />
        : issue.type === 'initiative' || issue.type === 'epic'
          ? <IconInitiative size={14} />
          : <IconSubtask size={14} />;
  const priorityIcon = issue.priority === 'highest' ? <PriorityHighest size={14} />
    : issue.priority === 'high' ? <PriorityHigh size={14} />
      : issue.priority === 'medium' ? <PriorityMedium size={14} />
        : issue.priority === 'low' ? <PriorityLow size={14} />
          : <PriorityLowest size={14} />;

  return (
    <div className={`kanban-card ${cardDensity === 'compact' ? 'compact-card' : ''} ${isDragging ? 'dragging' : ''}`} draggable onDragStart={e => onDragStart(e, issue.id)} onClick={() => onSelectIssue(issue.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onSelectIssue(issue.id)}>
      {epic && <div className="card-epic-tag" style={{ color: epic.color, borderColor: epic.color }}>{epic.key}</div>}
      <div className="card-summary">{issue.summary}</div>
      {(issue.labels || []).length > 0 && <div className="card-labels">{issue.labels.slice(0, 2).map(label => <span key={label} className="label-badge">#{label}</span>)}</div>}
      <div className="card-footer">
        <div className="footer-left">
          <span className="card-type" title={issue.type}>{typeIcon}</span><span className="card-key">{issue.key}</span><span className="card-priority" title={issue.priority}>{priorityIcon}</span>
          {issue.storyPoints > 0 && <span className="points-badge">{issue.storyPoints}</span>}
          {(issue.subtasks || []).length > 0 && <span className="subtasks-badge" title={`${completedSubtasks}/${issue.subtasks.length} ${subtasksDoneText}`}><IconCheck size={12} /> {completedSubtasks}/{issue.subtasks.length}</span>}
          {(issue.comments || []).length > 0 && <span className="comments-badge"><IconMessage size={12} /> {issue.comments.length}</span>}
        </div>
        <div className="footer-right">{assignee ? <img src={assignee.avatar} alt={assignee.name} className="assignee-avatar" title={`${assigneeLabelText}: ${assignee.name}`} /> : <div className="unassigned-avatar" title={unassignedText}><IconUser size={14} /></div>}</div>
      </div>
    </div>
  );
});

export const KanbanBoard: React.FC = () => {
  const {
    issues,
    sprints,
    epics,
    users,
    currentUser,
    currentProject,
    moveIssueStatus,
    updateProject,
    setSelectedIssueId,
    createIssue,
    searchQuery,
    onlyMyIssues,
    selectedEpicId,
    selectedType,
    selectedPriority,
    selectedLabels,
    toggleSelectedLabel,
    clearSelectedLabels,
    t
  } = useAether();

  const [swimlaneBy, setSwimlaneBy] = useState<SwimlaneMode>('none');
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [addingToStatus, setAddingToStatus] = useState<string | null>(null);
  const [quickSummary, setQuickSummary] = useState<string>('');
  const [cardDensity, setCardDensity] = useState<CardDensity>('compact');
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [draftBoardTitle, setDraftBoardTitle] = useState('');

  // Column collapse state
  const [collapsedColumns, setCollapsedColumns] = useState<Record<string, boolean>>({
    todo: false,
    in_progress: false,
    in_review: false,
    done: false
  });

  // Swimlane collapse state
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Record<string, boolean>>({});

  const toggleSwimlaneCollapse = (groupId: string) => {
    setCollapsedSwimlanes(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleColumnCollapse = (status: string) => {
    setCollapsedColumns(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const activeSprint = sprints.find((s: Sprint) => s.status === 'active');
  const boardTitle = currentProject.boardTitle ?? activeSprint?.name ?? t('kanbanTitle');

  const handleEditBoardTitle = () => {
    setDraftBoardTitle(boardTitle);
    setIsEditingBoardTitle(true);
  };

  const handleSaveBoardTitle = () => {
    if (!draftBoardTitle.trim()) return;
    updateProject(currentProject.id, { boardTitle: draftBoardTitle.trim() });
    setIsEditingBoardTitle(false);
  };

  // Filter issues with JQL engine & active sprint filters (Memoized for High FPS Performance)
  const filteredIssues = React.useMemo(() => {
    const jqlFiltered = filterIssuesWithJQL(issues, searchQuery, currentUser.id, activeSprint?.id);
    return jqlFiltered.filter((issue: Issue) => {
      if (onlyMyIssues && issue.assigneeId !== currentUser.id) return false;
      if (selectedEpicId && issue.epicId !== selectedEpicId) return false;
      if (selectedType !== 'all' && !isIssueTypeMatch(issue.type, selectedType)) return false;
      if (selectedPriority !== 'all' && issue.priority !== selectedPriority) return false;
      if (selectedLabels.length > 0 && !(issue.labels || []).some(lbl => selectedLabels.includes(lbl))) return false;

      if (activeSprint) {
        return issue.sprintId === activeSprint.id || !issue.sprintId;
      }
      return true;
    });
  }, [issues, searchQuery, currentUser.id, activeSprint, onlyMyIssues, selectedEpicId, selectedType, selectedPriority, selectedLabels]);

  const allLabels = React.useMemo(() => {
    return Array.from(new Set(issues.flatMap(i => i.labels || [])));
  }, [issues]);

  const labelCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach(issue => {
      (issue.labels || []).forEach(lbl => {
        counts[lbl] = (counts[lbl] || 0) + 1;
      });
    });
    return counts;
  }, [issues]);

  const columns: { status: IssueStatus; title: string; color: string; wipLimit?: number }[] = [
    { status: 'todo', title: t('todo'), color: '#94a3b8' },
    { status: 'in_progress', title: t('in_progress'), color: '#6366f1', wipLimit: 4 },
    { status: 'in_review', title: t('in_review'), color: '#f59e0b', wipLimit: 3 },
    { status: 'done', title: t('done'), color: '#10b981' }
  ];

  // Build swimlane groups dynamically based on mode (Memoized)
  const swimlaneGroups: SwimlaneGroup[] = React.useMemo(() => {
    const groups: SwimlaneGroup[] = [];
    if (swimlaneBy === 'assignee') {
      users.forEach(u => groups.push({ id: u.id, name: u.name }));
      groups.push({ id: UNASSIGNED_GROUP_ID, name: t('unassigned') });
    } else if (swimlaneBy === 'epic' || swimlaneBy === 'initiative') {
      const projectEpics = epics.filter(e => !e.projectId || e.projectId === currentProject.id);
      projectEpics.forEach(e => groups.push({ id: e.id, name: `${e.key}: ${e.summary}` }));
      groups.push({ id: NO_EPIC_GROUP_ID, name: t('issuesWithoutEpic') });
    } else if (swimlaneBy === 'priority') {
      const priorityLabels: Record<Priority, string> = {
        highest: t('highestPriority'),
        high: t('highPriority'),
        medium: t('mediumPriority'),
        low: t('lowPriority'),
        lowest: t('lowestPriority')
      };
      PRIORITY_GROUPS.forEach(p => groups.push({ id: p, name: priorityLabels[p] }));
    }
    return groups;
  }, [swimlaneBy, users, epics, currentProject.id, t]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, issueId: string) => {
    e.dataTransfer.setData('text/plain', issueId);
    setDraggedIssueId(issueId);
  }, []);

  const handleSelectIssue = useCallback((issueId: string) => {
    setSelectedIssueId(issueId);
  }, [setSelectedIssueId]);

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

  const handleSwimlaneQuickAdd = (status: IssueStatus, group: SwimlaneGroup) => {
    if (!quickSummary.trim()) return;
    const issueData: Partial<Issue> = {
      summary: quickSummary.trim(),
      status,
      sprintId: activeSprint?.id || null
    };

    if (swimlaneBy === 'assignee' && group.id !== UNASSIGNED_GROUP_ID) {
      issueData.assigneeId = group.id;
    } else if ((swimlaneBy === 'epic' || swimlaneBy === 'initiative') && group.id !== NO_EPIC_GROUP_ID) {
      issueData.epicId = group.id;
    } else if (swimlaneBy === 'priority') {
      issueData.priority = group.id as Priority;
    }

    createIssue(issueData);
    setQuickSummary('');
    setAddingToStatus(null);
  };

  const renderGroupIcon = (groupMode: SwimlaneMode, groupId: string) => {
    if (groupMode === 'assignee') {
      return <IconUser size={16} />;
    }
    if (groupMode === 'epic' || groupMode === 'initiative') {
      return <IconInitiative size={16} />;
    }
    if (groupMode === 'priority') {
      switch (groupId as Priority) {
        case 'highest': return <PriorityHighest size={16} />;
        case 'high': return <PriorityHigh size={16} />;
        case 'medium': return <PriorityMedium size={16} />;
        case 'low': return <PriorityLow size={16} />;
        default: return <PriorityLowest size={16} />;
      }
    }
    return null;
  };

  const renderCard = (issue: Issue) => {
    const assignee = users.find(u => u.id === issue.assigneeId);
    const epic = epics.find(e => e.id === issue.epicId);

    return (
      <KanbanCard
        key={issue.id}
        issue={issue}
        assignee={assignee}
        epic={epic}
        isDragging={draggedIssueId === issue.id}
        cardDensity={cardDensity}
        subtasksDoneText={t('subtasksDone')}
        assigneeLabelText={t('assigneeLabel')}
        unassignedText={t('unassigned')}
        onDragStart={handleDragStart}
        onSelectIssue={handleSelectIssue}
      />
    );
  };

  return (
    <div className="kanban-view animate-fade-in">
      {/* Realtime Sprint Goal & Progress Banner */}
      <SprintGoalBanner />

      {/* Board Header Bar */}
      <div className="board-header">
        <div>
          <div className="board-title-row">
            {isEditingBoardTitle ? (
              <div className="board-title-editor">
                <input
                  autoFocus
                  value={draftBoardTitle}
                  onChange={event => setDraftBoardTitle(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') handleSaveBoardTitle();
                    if (event.key === 'Escape') setIsEditingBoardTitle(false);
                  }}
                  aria-label="Board title"
                />
                <button className="btn-primary-sm" onClick={handleSaveBoardTitle}>Save</button>
                <button className="btn-ghost-sm" onClick={() => setIsEditingBoardTitle(false)}>Cancel</button>
              </div>
            ) : (
              <>
                <h2 className="view-title-with-icon"><IconBoard size={20} color="var(--color-in-progress, #6366f1)" /> {boardTitle}</h2>
                <button className="board-title-edit" onClick={handleEditBoardTitle} title="Edit board title"><IconSettings size={15} /></button>
              </>
            )}
          </div>
        </div>

        {/* Swimlane controls */}
        <div className="board-controls">
          <span className="control-label">{t('groupBy')}</span>
          <select
            className="control-select"
            value={swimlaneBy}
            onChange={e => setSwimlaneBy(e.target.value as SwimlaneMode)}
          >
            <option value="none">{t('groupNone')}</option>
            <option value="assignee">{t('groupAssignee')}</option>
            <option value="initiative">{t('groupEpic')}</option>
            <option value="priority">{t('groupPriority')}</option>
          </select>
          <select
            className="control-select density-select"
            value={cardDensity}
            onChange={e => setCardDensity(e.target.value as CardDensity)}
            aria-label={t('cardDensity')}
          >
            <option value="compact">{t('compactView')}</option>
            <option value="standard">{t('standardView')}</option>
          </select>
        </div>
      </div>

      {/* Tag Filter Pills Bar */}
      <div className={`tag-filter-pills-bar ${selectedLabels.length > 0 ? 'has-selected-tag' : ''}`}>
        <span className="filter-label">{t('filterByTag')}</span>
        <div className="tag-filter-list">
          <button
            className={`tag-pill ${selectedLabels.length === 0 ? 'active' : ''}`}
            onClick={clearSelectedLabels}
            aria-pressed={selectedLabels.length === 0}
          >
            {t('groupNone')}
          </button>
          {allLabels.map(lbl => {
            const isSelected = selectedLabels.includes(lbl);
            const count = labelCounts[lbl] || 0;
            return (
              <button
                key={lbl}
                className={`tag-pill ${isSelected ? 'active' : ''}`}
                onClick={() => toggleSelectedLabel(lbl)}
                aria-pressed={isSelected}
              >
                #{lbl} <span className="tag-count-badge">({count})</span>
              </button>
            );
          })}
          {selectedLabels.length > 0 && (
            <button
              className="tag-pill clear-all-pill"
              onClick={clearSelectedLabels}
              title="Reset all tag filters"
            >
              ✕ {t('clearFilters')} ({selectedLabels.length})
            </button>
          )}
          <TagSearchFilter allLabels={allLabels} labelCounts={labelCounts} />
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
                  title={`${t('expandColumn')} ${col.title}`}
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
                      title={t('collapseColumn')}
                    >
                      <IconChevronDown size={14} />
                    </button>
                    <span className="status-indicator" style={{ backgroundColor: col.color }}></span>
                    <span className="column-title">{col.title}</span>
                    <span className="column-count">{colIssues.length}</span>
                    {isWipExceeded && (
                      <span className="wip-badge" title={`${t('wipLimitExceeded')} (${col.wipLimit} max)`}>
                        WIP limit
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
                        placeholder={t('quickAddPlaceholder')}
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
                          {t('add')}
                        </button>
                        <button className="btn-ghost-sm" onClick={() => setAddingToStatus(null)}>
                          {t('cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-add-card" onClick={() => setAddingToStatus(col.status)}>
                      <IconPlus size={14} /> {t('add')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Swimlanes view with Sticky Board Headers & Full UI Consistency */
        <div className="swimlane-container animate-fade-in">
          {/* Sticky Board Top Headers for Columns */}
          <div className="swimlane-board-headers">
            {columns.map(col => {
              const colIssues = filteredIssues.filter((i: Issue) => i.status === col.status);
              const totalPoints = colIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
              const isCollapsed = !!collapsedColumns[col.status];
              const isWipExceeded = col.wipLimit && colIssues.length > col.wipLimit;

              return (
                <div
                  key={col.status}
                  className={`swimlane-board-header-col ${isCollapsed ? 'collapsed-header-col' : ''}`}
                >
                  <div className="column-header" style={{ marginBottom: 0 }}>
                    <div className="header-title-group">
                      <button
                        className="btn-collapse-col"
                        onClick={() => toggleColumnCollapse(col.status)}
                        title={t('collapseColumn')}
                      >
                        {isCollapsed ? <IconChevronRight size={14} /> : <IconChevronDown size={14} />}
                      </button>
                      <span className="status-indicator" style={{ backgroundColor: col.color }}></span>
                      <span className="column-title">{col.title}</span>
                      <span className="column-count">{colIssues.length}</span>
                      {isWipExceeded && (
                        <span className="wip-badge" title={`${t('wipLimitExceeded')} (${col.wipLimit} max)`}>
                          WIP
                        </span>
                      )}
                    </div>
                    {!isCollapsed && <span className="column-points">{totalPoints} pts</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Swimlane Groups */}
          {swimlaneGroups.map(group => {
            const groupIssues = filteredIssues.filter((i: Issue) => {
              if (swimlaneBy === 'assignee') {
                return group.id === UNASSIGNED_GROUP_ID
                  ? i.assigneeId === null
                  : i.assigneeId === group.id;
              }
              if (swimlaneBy === 'epic' || swimlaneBy === 'initiative') {
                return group.id === NO_EPIC_GROUP_ID ? i.epicId === null : i.epicId === group.id;
              }
              return i.priority === group.id;
            });

            const groupPoints = groupIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
            const isGroupCollapsed = !!collapsedSwimlanes[group.id];

            return (
              <div key={group.id} className="swimlane-group animate-fade-in">
                <div
                  className="swimlane-header"
                  onClick={() => toggleSwimlaneCollapse(group.id)}
                >
                  <div className="swimlane-header-left">
                    <button className="btn-collapse-col">
                      {isGroupCollapsed ? <IconChevronRight size={15} /> : <IconChevronDown size={15} />}
                    </button>
                    {renderGroupIcon(swimlaneBy, group.id)}
                    <span className="swimlane-title-text">{group.name}</span>
                  </div>
                  <div className="swimlane-header-right">
                    <span className="swimlane-header-badge">
                      {groupIssues.length} {t('issues')} · {groupPoints} pts
                    </span>
                  </div>
                </div>

                {!isGroupCollapsed && (
                  <div className="kanban-grid">
                    {columns.map(col => {
                      const colIssues = groupIssues.filter((i: Issue) => i.status === col.status);
                      const isCollapsed = !!collapsedColumns[col.status];

                      if (isCollapsed) {
                        return (
                          <div
                            key={col.status}
                            className="kanban-column collapsed-column swimlane-col"
                            onClick={() => toggleColumnCollapse(col.status)}
                            title={`${t('expandColumn')} ${col.title}`}
                          >
                            <div className="collapsed-header">
                              <span className="status-indicator" style={{ backgroundColor: col.color }}></span>
                              <span className="collapsed-title">{col.title} ({colIssues.length})</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={col.status}
                          className="kanban-column swimlane-col"
                          onDragOver={handleDragOver}
                          onDrop={e => handleDrop(e, col.status)}
                        >
                          <div className="column-cards-list">
                            {colIssues.map(renderCard)}

                            {colIssues.length === 0 && (
                              <div className="swimlane-empty-drop-zone">
                                <span>{t('quickAddPlaceholder')}</span>
                              </div>
                            )}

                            {/* Inline Quick Add inside Swimlane Column */}
                            {addingToStatus === `${group.id}-${col.status}` ? (
                              <div className="quick-add-box animate-fade-in">
                                <textarea
                                  autoFocus
                                  placeholder={t('quickAddPlaceholder')}
                                  value={quickSummary}
                                  onChange={e => setQuickSummary(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSwimlaneQuickAdd(col.status, group);
                                    }
                                  }}
                                />
                                <div className="quick-add-actions">
                                  <button className="btn-primary-sm" onClick={() => handleSwimlaneQuickAdd(col.status, group)}>
                                    {t('add')}
                                  </button>
                                  <button className="btn-ghost-sm" onClick={() => setAddingToStatus(null)}>
                                    {t('cancel')}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="btn-add-card"
                                onClick={() => setAddingToStatus(`${group.id}-${col.status}`)}
                              >
                                <IconPlus size={14} /> {t('add')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
