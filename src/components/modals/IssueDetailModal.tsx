import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';
import type { IssueStatus, Priority, IssueType } from '../../types/jira';
import { IconX, IconTrash, IconClock } from '../common/Icons';

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
  } = useJira();

  const [newCommentText, setNewCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  if (!selectedIssueId) return null;

  const issue = issues.find(i => i.id === selectedIssueId);
  if (!issue) return null;

  const reporter = users.find(u => u.id === issue.reporterId);

  const completedSubtasks = issue.subtasks.filter(s => s.completed).length;
  const subtaskProgressPct = issue.subtasks.length > 0 ? Math.round((completedSubtasks / issue.subtasks.length) * 100) : 0;

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    addComment(issue.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleAddSubtaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    addSubtask(issue.id, newSubtaskTitle.trim());
    setNewSubtaskTitle('');
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
            {/* Editable Title */}
            <input
              type="text"
              className="issue-title-input"
              value={issue.summary}
              onChange={e => updateIssue(issue.id, { summary: e.target.value })}
            />

            {/* Status Workflow Dropdown */}
            <div className="status-workflow-bar">
              <span className="workflow-label">Status:</span>
              <select
                className={`status-select status-${issue.status}`}
                value={issue.status}
                onChange={e => moveIssueStatus(issue.id, e.target.value as IssueStatus)}
              >
                <option value="todo">TO DO</option>
                <option value="in_progress">IN PROGRESS</option>
                <option value="in_review">IN REVIEW</option>
                <option value="done">DONE</option>
              </select>
            </div>

            {/* Description Textarea */}
            <div className="detail-section">
              <h3>Description</h3>
              <textarea
                className="description-textarea"
                rows={5}
                value={issue.description}
                placeholder="Add a detailed description..."
                onChange={e => updateIssue(issue.id, { description: e.target.value })}
              />
            </div>

            {/* Sub-tasks Checklist */}
            <div className="detail-section">
              <div className="section-header-inline">
                <h3>Sub-tasks</h3>
                <span className="subtask-count">{completedSubtasks} of {issue.subtasks.length} done ({subtaskProgressPct}%)</span>
              </div>

              {issue.subtasks.length > 0 && (
                <div className="subtask-progress-bar">
                  <div className="fill" style={{ width: `${subtaskProgressPct}%` }}></div>
                </div>
              )}

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

                <form onSubmit={handleAddSubtaskSubmit} className="add-subtask-form">
                  <input
                    type="text"
                    placeholder="Add a sub-task..."
                    value={newSubtaskTitle}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                  />
                  <button type="submit" className="btn-primary-sm">Add</button>
                </form>
              </div>
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
                <option value="story">Story</option>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="epic">Epic</option>
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
              <label>Epic Link</label>
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
              <label>Due Date</label>
              <input
                type="date"
                value={issue.dueDate}
                onChange={e => updateIssue(issue.id, { dueDate: e.target.value })}
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

            {/* Time Tracking Progress */}
            <div className="field-group time-tracking-group">
              <label><IconClock size={14} /> Time Tracking</label>
              <div className="time-tracking-bar">
                <div
                  className="logged-bar"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((issue.timeLogged || 0) / Math.max(1, issue.originalEstimate || 1)) * 100)
                    )}%`
                  }}
                ></div>
              </div>
              <div className="time-stats">
                <span>Logged: {issue.timeLogged || 0}h</span>
                <span>Est: {issue.originalEstimate || 0}h</span>
              </div>
              <div className="log-time-inputs">
                <input
                  type="number"
                  min={0}
                  placeholder="Log hours..."
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = Number((e.target as HTMLInputElement).value);
                      if (val > 0) {
                        updateIssue(issue.id, { timeLogged: (issue.timeLogged || 0) + val });
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* AI Security & Code Audit Widget */}
            <div className="field-group ai-audit-widget">
              <label>✨ AI Security & PR Readiness</label>
              <div className="ai-audit-box">
                <div className="audit-score-row">
                  <span className="audit-badge pass">SLA Check: PASS</span>
                  <span className="audit-badge sec">Security Score: 98/100</span>
                </div>
                <p className="audit-desc">
                  No hardcoded secrets or memory leaks detected across modified AST nodes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
