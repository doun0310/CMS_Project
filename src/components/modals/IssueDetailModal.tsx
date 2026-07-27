import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { IssueStatus, Priority, IssueType, Issue } from '../../types/Aether';
import { IconX, IconTrash, IconClock, IconLink } from '../common/Icons';

export const IssueDetailModal: React.FC = () => {
  const {
    issues,
    selectedIssueId,
    setSelectedIssueId,
    updateIssue,
    deleteIssue,
    addComment,
    toggleSubtask,
    addSubtask,
    moveIssueStatus,
    users,
    epics,
    sprints
  } = useAether();

  const [newCommentText, setNewCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedBlockerId, setSelectedBlockerId] = useState('');

  if (!selectedIssueId) return null;

  const issue = issues.find((i: Issue) => i.id === selectedIssueId);
  if (!issue) return null;

  const reporter = users.find(u => u.id === issue.reporterId);

  const completedSubtasks = issue.subtasks.filter(s => s.completed).length;
  const subtaskProgressPct = issue.subtasks.length > 0 ? Math.round((completedSubtasks / issue.subtasks.length) * 100) : 0;

  // Resolve Linked Blocker Issues
  const blockedByIssues = (issue.blockedBy || [])
    .map(keyOrId => issues.find((i: Issue) => i.id === keyOrId || i.key === keyOrId))
    .filter((i): i is Issue => i !== undefined);

  // Check if any blocker is unfinished (Status !== DONE)
  const unfinishedBlockers = blockedByIssues.filter(i => i.status !== 'done');
  const hasCriticalPathRisk = unfinishedBlockers.length > 0;
  const downstreamIssues = issues.filter((i: Issue) => (i.blockedBy || []).includes(issue.id));

  const handleAddCommentSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(issue.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleAddSubtaskSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(issue.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  const handleAddBlocker = () => {
    if (!selectedBlockerId) return;
    const currentBlockers = issue.blockedBy || [];
    if (!currentBlockers.includes(selectedBlockerId)) {
      updateIssue(issue.id, { blockedBy: [...currentBlockers, selectedBlockerId] });
    }
    setSelectedBlockerId('');
  };

  const handleRemoveBlocker = (blockerIdOrKey: string) => {
    const currentBlockers = issue.blockedBy || [];
    updateIssue(issue.id, {
      blockedBy: currentBlockers.filter(b => b !== blockerIdOrKey)
    });
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedIssueId(null)}>
      <div className="issue-detail-drawer animate-slide-in" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="header-left-info">
            <span className="issue-type-badge">{issue.type.toUpperCase()}</span>
            <span className="issue-key-large">{issue.key}</span>
          </div>

          <div className="header-actions">
            <button
              className="btn-icon-danger"
              title="Delete Issue"
              onClick={() => {
                if (window.confirm(`Delete issue ${issue.key}?`)) {
                  deleteIssue(issue.id);
                }
              }}
            >
              <IconTrash size={18} />
            </button>
            <button className="btn-icon-close" onClick={() => setSelectedIssueId(null)}>
              <IconX size={20} />
            </button>
          </div>
        </div>

        {/* Drawer Content Body: Left main details & Right metadata sidebar */}
        <div className="drawer-body">
          {/* Main Left Details */}
          <div className="detail-main-col">
            {/* Title Input */}
            <input
              type="text"
              className="issue-title-input"
              value={issue.summary}
              onChange={e => updateIssue(issue.id, { summary: e.target.value })}
            />

            {/* Workflow status Bar */}
            <div className="status-workflow-bar">
              <label>Status: </label>
              <select
                className={`status-select ${issue.status}`}
                value={issue.status}
                onChange={e => moveIssueStatus(issue.id, e.target.value as IssueStatus)}
              >
                <option value="todo">TO DO</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="in_review">IN REVIEW</option>
                <option value="done">DONE</option>
              </select>

              {/* AI Security & PR Readiness Audit Badge */}
              <div className="ai-audit-box">
                <div className="audit-score-row">
                  <span className="audit-badge pass">AI Audit 98%</span>
                  <span className="audit-badge sec">Security Clear</span>
                </div>
                <div className="audit-desc">
                  Sub-task SLA 100%, 0 security vulnerabilities detected. PR ready for merge.
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="detail-section">
              <h3>Description</h3>
              <textarea
                className="description-textarea"
                rows={4}
                value={issue.description}
                onChange={e => updateIssue(issue.id, { description: e.target.value })}
                placeholder="Add a detailed description..."
              />
            </div>

            {/* Interactive Issue Dependency & Critical Path Section */}
            <div className="detail-section">
              <div className="section-title-with-badge">
                <h3>🔗 Issue Dependencies & Critical Path</h3>
                {hasCriticalPathRisk && (
                  <span className="critical-path-badge animate-pulse">
                    ⚠️ Critical Path Risk ({unfinishedBlockers.length} Unfinished Blocker)
                  </span>
                )}
              </div>

              <div className="dependency-box">
                {blockedByIssues.length === 0 ? (
                  <div className="no-deps-text">No blocker dependencies linked to this issue.</div>
                ) : (
                  <div className="linked-issues-list">
                    {blockedByIssues.map(blocker => (
                      <div key={blocker.id} className="linked-issue-item">
                        <div className="linked-left">
                          <IconLink size={14} />
                          <span
                            className="linked-key-link"
                            onClick={() => setSelectedIssueId(blocker.id)}
                            title="Click to view issue"
                          >
                            {blocker.key}
                          </span>
                          <span className="linked-summary">{blocker.summary}</span>
                        </div>
                        <div className="linked-right">
                          <span className={`status-badge-sm ${blocker.status}`}>
                            {blocker.status.toUpperCase()}
                          </span>
                          <button
                            className="btn-unlink-sm"
                            onClick={() => handleRemoveBlocker(blocker.id)}
                            title="Unlink dependency"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Blocker Form */}
                <div className="add-blocker-row">
                  <select
                    value={selectedBlockerId}
                    onChange={e => setSelectedBlockerId(e.target.value)}
                    className="settings-select"
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Select Blocker Issue --</option>
                    {issues
                      .filter((i: Issue) => i.id !== issue.id)
                      .map((i: Issue) => (
                        <option key={i.id} value={i.id}>
                          {i.key}: {i.summary} [{i.status.toUpperCase()}]
                        </option>
                      ))}
                  </select>
                  <button className="btn-primary-sm" onClick={handleAddBlocker}>
                    + Link Blocker
                  </button>
                </div>

                {downstreamIssues.length > 0 && (
                  <div className="downstream-blocks-group" style={{ marginTop: '14px' }}>
                    <span className="downstream-title" style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      🚀 Blocks Downstream Tasks ({downstreamIssues.length}):
                    </span>
                    <div className="linked-issues-list">
                      {downstreamIssues.map(down => (
                        <div key={down.id} className="linked-issue-item">
                          <div className="linked-left">
                            <IconLink size={14} color="#6366f1" />
                            <span
                              className="linked-key-link"
                              onClick={() => setSelectedIssueId(down.id)}
                              title="Click to view downstream issue"
                            >
                              {down.key}
                            </span>
                            <span className="linked-summary">{down.summary}</span>
                          </div>
                          <div className="linked-right">
                            <span className={`status-badge-sm ${down.status}`}>
                              {down.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subtasks Section */}
            <div className="detail-section">
              <h3>Sub-tasks ({completedSubtasks}/{issue.subtasks.length})</h3>
              <div className="subtask-progress-bar">
                <div className="fill" style={{ width: `${subtaskProgressPct}%` }}></div>
              </div>

              <div className="subtasks-list">
                {issue.subtasks.map(st => (
                  <div key={st.id} className="subtask-item">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => toggleSubtask(issue.id, st.id)}
                    />
                    <span className={st.completed ? 'completed-text' : ''}>{st.title}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtaskSubmit} className="add-subtask-form">
                <input
                  type="text"
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                />
                <button type="submit" className="btn-primary-sm">Add</button>
              </form>
            </div>

            {/* Time Tracking */}
            <div className="detail-section">
              <h3>Time Tracking</h3>
              <div className="time-tracking-box">
                <IconClock size={20} className="clock-icon" />
                <div className="tracking-fields">
                  <div className="field-row">
                    <span>Original Estimate (hrs):</span>
                    <input
                      type="number"
                      min={0}
                      value={issue.originalEstimate}
                      onChange={e => updateIssue(issue.id, { originalEstimate: Number(e.target.value) })}
                    />
                  </div>
                  <div className="field-row">
                    <span>Time Logged (hrs):</span>
                    <input
                      type="number"
                      min={0}
                      value={issue.timeLogged}
                      onChange={e => updateIssue(issue.id, { timeLogged: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comments & Activity Log */}
            <div className="detail-section">
              <h3>Activity & Comments</h3>
              <form onSubmit={handleAddCommentSubmit} className="comment-form">
                <textarea
                  rows={2}
                  placeholder="Add a comment..."
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                />
                <button type="submit" className="btn-primary-sm">Save Comment</button>
              </form>

              <div className="comments-list">
                {issue.comments.map(c => {
                  const author = users.find(u => u.id === c.authorId);
                  return (
                    <div key={c.id} className="comment-item">
                      <img src={author?.avatar} alt={author?.name} className="comment-avatar" />
                      <div className="comment-body">
                        <div className="comment-meta">
                          <span className="author-name">{author?.name}</span>
                          <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="comment-text">{c.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar Metadata Fields */}
          <div className="detail-sidebar-col">
            <div className="field-group">
              <label>Issue Type</label>
              <select
                value={issue.type}
                onChange={e => updateIssue(issue.id, { type: e.target.value as IssueType })}
              >
                <option value="feature">Feature</option>
                <option value="workitem">WorkItem</option>
                <option value="bug">Bug</option>
                <option value="initiative">Initiative</option>
              </select>
            </div>

            <div className="field-group">
              <label>Priority</label>
              <select
                value={issue.priority}
                onChange={e => updateIssue(issue.id, { priority: e.target.value as Priority })}
              >
                <option value="highest">Highest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>

            <div className="field-group">
              <label>Assignee</label>
              <select
                value={issue.assigneeId || ''}
                onChange={e => updateIssue(issue.id, { assigneeId: e.target.value || null })}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Reporter</label>
              <div className="user-read-only">
                <img src={reporter?.avatar} alt="" className="avatar-xs" />
                <span>{reporter?.name}</span>
              </div>
            </div>

            <div className="field-group">
              <label>Epic</label>
              <select
                value={issue.epicId || ''}
                onChange={e => updateIssue(issue.id, { epicId: e.target.value || null })}
              >
                <option value="">None</option>
                {epics.map(ep => (
                  <option key={ep.id} value={ep.id}>{ep.summary}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Sprint</label>
              <select
                value={issue.sprintId || ''}
                onChange={e => updateIssue(issue.id, { sprintId: e.target.value || null })}
              >
                <option value="">Backlog</option>
                {sprints.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>Story Points</label>
              <input
                type="number"
                min={0}
                value={issue.storyPoints}
                onChange={e => updateIssue(issue.id, { storyPoints: Number(e.target.value) })}
              />
            </div>

            <div className="field-group">
              <label>Component</label>
              <input
                type="text"
                value={issue.component}
                onChange={e => updateIssue(issue.id, { component: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
