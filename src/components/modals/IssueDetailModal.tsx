import React, { useEffect, useRef, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { IssueStatus, Priority, IssueType, Issue } from '../../types/Aether';
import { uploadIssueAttachment, deleteIssueAttachment } from '../../services/storageService';
import {
  IconX,
  IconTrash,
  IconClock,
  IconLink,
  IconFeature,
  IconWorkItem,
  IconBug,
  IconInitiative,
  IconSubtask,
  PriorityHighest,
  PriorityHigh,
  PriorityMedium,
  PriorityLow,
  PriorityLowest
} from '../common/Icons';

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
    deleteSubtask,
    moveIssueStatus,
    users,
    sprints,
    t
  } = useAether();

  const [newCommentText, setNewCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedBlockerId, setSelectedBlockerId] = useState('');
  const [activityTab, setActivityTab] = useState<'comments' | 'history'>('comments');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const detailMainRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!selectedIssueId) return;
    detailMainRef.current?.scrollTo({ top: 0 });
  }, [selectedIssueId]);

  if (!selectedIssueId) return null;

  const issue = issues.find((i: Issue) => i.id === selectedIssueId);
  if (!issue) return null;

  const isInitiative = issue.type === 'initiative';
  const reporter = users.find(u => u.id === issue.reporterId);
  const linkedInitiativeIssues = isInitiative
    ? issues.filter(candidate => candidate.initiativeId === issue.id && candidate.id !== issue.id)
    : [];
  const completedInitiativeIssues = linkedInitiativeIssues.filter(candidate => candidate.status === 'done').length;
  const initiativeProgressPct = linkedInitiativeIssues.length > 0
    ? Math.round((completedInitiativeIssues / linkedInitiativeIssues.length) * 100)
    : issue.status === 'done' ? 100 : 0;

  const completedSubtasks = issue.subtasks.filter(s => s.completed).length;
  const subtaskProgressPct = issue.subtasks.length > 0 ? Math.round((completedSubtasks / issue.subtasks.length) * 100) : 0;
  const originalEstimate = Math.max(issue.originalEstimate || 0, 0);
  const timeLogged = Math.max(issue.timeLogged || 0, 0);
  const trackedTimePct = originalEstimate > 0 ? Math.min(100, Math.round((timeLogged / originalEstimate) * 100)) : 0;
  const remainingTime = Math.max(0, originalEstimate - timeLogged);

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileUpload(e.target.files[0]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const uploaderId = users[0]?.id || 'unknown';
      const attachment = await uploadIssueAttachment(issue.id, file, uploaderId);
      if (attachment) {
        const newAttachments = [...(issue.attachments || []), attachment];
        updateIssue(issue.id, { attachments: newAttachments });
      }
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteAttachment = async (attachmentId: string, url: string) => {
    if (window.confirm('Delete this attachment?')) {
      const success = await deleteIssueAttachment(url);
      if (success) {
        const newAttachments = (issue.attachments || []).filter(a => a.id !== attachmentId);
        updateIssue(issue.id, { attachments: newAttachments });
      }
    }
  };

  const getTypeIcon = (type: IssueType) => {
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

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'highest': return <PriorityHighest size={16} />;
      case 'high': return <PriorityHigh size={16} />;
      case 'medium': return <PriorityMedium size={16} />;
      case 'low': return <PriorityLow size={16} />;
      case 'lowest': return <PriorityLowest size={16} />;
    }
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={() => setSelectedIssueId(null)}>
      <div className="issue-detail-drawer glass-drawer animate-slide-in" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="drawer-header glass-drawer-header">
          <div className="header-left-info flex-center gap-2">
            <span className={`type-badge-chip type-${issue.type}`}>
              {getTypeIcon(issue.type)}
              <span>{isInitiative ? t('typeInitiative') : issue.type.toUpperCase()}</span>
            </span>
            <span className="issue-key-large">{issue.key}</span>
          </div>

          <div className="header-actions flex-center gap-2">
            <button
              className="btn-icon-danger"
              title={t('deleteIssue')}
              onClick={() => {
                if (window.confirm(`${t('deleteIssue')} ${issue.key}?`)) {
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
          <div className="detail-main-col" ref={detailMainRef}>
            {/* Title Input */}
            <input
              type="text"
              className="issue-title-input"
              value={issue.summary}
              onChange={e => updateIssue(issue.id, { summary: e.target.value })}
            />

            {/* Workflow status Bar */}
            <div className="status-workflow-bar">
              <label>{t('status')}: </label>
              <select
                className={`status-select ${issue.status}`}
                value={issue.status}
                onChange={e => moveIssueStatus(issue.id, e.target.value as IssueStatus)}
              >
                <option value="todo">{t('todo')}</option>
                <option value="in_progress">{t('in_progress')}</option>
                <option value="in_review">{t('in_review')}</option>
                <option value="done">{t('done')}</option>
              </select>

            </div>

            {!isInitiative && <div className="ai-audit-box issue-status-audit">
              <div className="audit-score-row">
                <span className="audit-badge pass">AI Audit 98%</span>
                <span className="audit-badge sec">Security Clear</span>
              </div>
              <div className="audit-desc">
                Sub-task SLA 100%, 0 security vulnerabilities detected. PR ready for merge.
              </div>
            </div>}

            {isInitiative && (
              <section className="initiative-detail-overview">
                <div className="initiative-overview-heading">
                  <div>
                    <span className="initiative-overview-kicker">{t('topLevelInitiative')}</span>
                    <strong>{initiativeProgressPct}% {t('completed')}</strong>
                  </div>
                  <span>{completedInitiativeIssues}/{linkedInitiativeIssues.length} {t('issues')}</span>
                </div>
                <div className="initiative-progress-track"><span style={{ width: `${initiativeProgressPct}%` }} /></div>
                <div className="initiative-overview-meta">
                  <span>{t('dueDate')}: {issue.dueDate}</span>
                  <span>{t('storyPoints')}: {issue.storyPoints || 0} {t('pointsShort')}</span>
                </div>
              </section>
            )}

            {/* AI Solution Recommendation & Auto-Resolver Card */}
            {!isInitiative && <div className="ai-solution-card animate-fade-in">
              <div className="ai-sol-header">
                <span> AI Auto-Resolver & Recommended Solution</span>
                <span className="sol-badge">Confidence: 96%</span>
              </div>
              <div className="ai-sol-body">
                <div className="sol-cause">
                  <strong>Hypothesis:</strong> Potential event listener leak or state synchronization mismatch in [{issue.component || 'Core Subsystem'}].
                </div>
                <pre className="sol-code-pre">
{`// Recommended Code Fix for ${issue.key}:
useEffect(() => {
  const handler = (evt) => handleEvent(evt);
  eventEmitter.on('${issue.key.toLowerCase()}_sync', handler);
  return () => eventEmitter.off('${issue.key.toLowerCase()}_sync', handler);
}, []);`}
                </pre>
              </div>
              <div className="ai-sol-footer">
                <button
                  className="btn-apply-solution"
                  onClick={() => {
                    addComment(
                      issue.id,
                      ` [AI Auto-Resolver Solution Applied]:\n\`\`\`typescript\n// Recommended Code Fix for ${issue.key}:\nuseEffect(() => {\n  const handler = (evt) => handleEvent(evt);\n  eventEmitter.on('${issue.key.toLowerCase()}_sync', handler);\n  return () => eventEmitter.off('${issue.key.toLowerCase()}_sync', handler);\n}, []);\n\`\`\``
                    );
                    moveIssueStatus(issue.id, 'in_review');
                  }}
                >
                  ⚡ Apply Fix Code to Comment & Move to IN REVIEW
                </button>
              </div>
            </div>}

            {/* Description Section */}
            <div className="detail-section">
              <h3>{t('description')}</h3>
              <textarea
                className="description-textarea"
                rows={4}
                value={issue.description}
                onChange={e => updateIssue(issue.id, { description: e.target.value })}
                placeholder={t('descriptionPlaceholder')}
              />
            </div>

            {/* Attachments Section */}
            <div className="detail-section">
              <h3>Attachments</h3>
              <div 
                className={`attachment-dropzone ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="uploading-spinner">Uploading...</div>
                ) : (
                  <div>Drag & drop files here, or click to browse</div>
                )}
                <input 
                  type="file" 
                  style={{ display: 'none' }} 
                  ref={fileInputRef} 
                  onChange={handleFileInput} 
                />
              </div>
              
              {issue.attachments && issue.attachments.length > 0 && (
                <div className="attachments-gallery">
                  {issue.attachments.map(att => {
                    const isImage = att.mimeType.startsWith('image/');
                    return (
                      <div key={att.id} className="attachment-card">
                        {isImage ? (
                          <div className="attachment-preview image">
                            <img src={att.url} alt={att.name} />
                          </div>
                        ) : (
                          <div className="attachment-preview file">
                            <span className="file-ext">{att.name.split('.').pop()?.toUpperCase()}</span>
                          </div>
                        )}
                        <div className="attachment-info">
                          <span className="attachment-name" title={att.name}>{att.name}</span>
                          <span className="attachment-size">{(att.size / 1024).toFixed(1)} KB</span>
                        </div>
                        <div className="attachment-actions">
                          <a href={att.url} download={att.name} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>⬇️</a>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteAttachment(att.id, att.url); }}>❌</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Interactive Issue Dependency & Critical Path Section */}
            {!isInitiative && <div className="detail-section">
              <div className="section-title-with-badge">
                <h3> Issue Dependencies & Critical Path</h3>
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
            </div>}

            {/* Subtasks Section */}
            {!isInitiative && <div className="detail-section">
              <h3>{t('subtasks')} ({completedSubtasks}/{issue.subtasks.length})</h3>
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
                    <button
                      type="button"
                      className="btn-subtask-delete"
                      onClick={() => deleteSubtask(issue.id, st.id)}
                      title="Subtask 삭제"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtaskSubmit} className="add-subtask-form">
                <input
                  type="text"
                  placeholder={t('addSubtask')}
                  value={newSubtaskTitle}
                  onChange={e => setNewSubtaskTitle(e.target.value)}
                />
                <button type="submit" className="btn-primary-sm">{t('add')}</button>
              </form>
            </div>}

            {/* Time Tracking */}
            {!isInitiative && <section className="detail-section time-tracking-section">
              <div className="time-tracking-heading">
                <h3><IconClock size={16} /> {t('timeTracking')}</h3>
                <span>{timeLogged}h {t('logged')}</span>
              </div>
              <div className="time-tracking-panel">
                <div className="time-progress-summary">
                  <div className="time-progress-labels"><span>{trackedTimePct}% {t('used')}</span><span>{remainingTime}h {t('remaining')}</span></div>
                  <div className="time-progress-track"><span style={{ width: `${trackedTimePct}%` }} /></div>
                </div>
                <div className="time-tracking-fields">
                  <label>
                    <span>{t('originalEstimate')}</span>
                    <div className="time-input-wrap"><input type="number" min={0} value={issue.originalEstimate} onChange={e => updateIssue(issue.id, { originalEstimate: Number(e.target.value) })} /><em>h</em></div>
                  </label>
                  <label>
                    <span>{t('timeLogged')}</span>
                    <div className="time-input-wrap"><input type="number" min={0} value={issue.timeLogged} onChange={e => updateIssue(issue.id, { timeLogged: Number(e.target.value) })} /><em>h</em></div>
                  </label>
                </div>
              </div>
            </section>}

            {/* Comments & Activity Audit History */}
            <div className="detail-section">
              <div className="activity-tabs-header">
                <button
                  className={`activity-tab-btn ${activityTab === 'comments' ? 'active' : ''}`}
                  onClick={() => setActivityTab('comments')}
                >
                  {t('comments')} ({issue.comments.length})
                </button>
                <button
                  className={`activity-tab-btn ${activityTab === 'history' ? 'active' : ''}`}
                  onClick={() => setActivityTab('history')}
                >
                  {t('auditHistory')} ({(issue.history || []).length})
                </button>
              </div>

              {activityTab === 'comments' ? (
                <>
                  <form onSubmit={handleAddCommentSubmit} className="comment-form">
                    <div className="comment-composer">
                      <textarea
                        rows={2}
                        placeholder={t('addComment')}
                        value={newCommentText}
                        onChange={e => setNewCommentText(e.target.value)}
                      />
                      {/* @Mention Quick Member Selection Bar */}
                      <div className="mention-quick-bar">
                        <span className="mention-label">{t('mention')}</span>
                        {users.map(u => (
                          <button
                            key={u.id}
                            type="button"
                            className="mention-member-chip"
                            onClick={() => {
                              setNewCommentText(prev => `${prev.trim()} @${u.name} `);
                            }}
                          >
                            <img src={u.avatar} alt="" />
                            @{u.name.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn-primary-sm">{t('save')}</button>
                  </form>

                  <div className="comments-list">
                    {issue.comments.map(c => {
                      const author = users.find(u => u.id === c.authorId);
                      const hasMention = c.text.includes('@');
                      return (
                        <div key={c.id} className="comment-item">
                          <img src={author?.avatar} alt={author?.name} className="comment-avatar" />
                          <div className="comment-body">
                            <div className="comment-meta">
                              <span className="author-name">{author?.name}</span>
                              <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                              {hasMention && (
                                <span className="status-badge-sm in_progress" style={{ fontSize: '0.65rem', padding: '1px 5px', marginLeft: '6px' }}>
                                  MENTION NOTIFIED
                                </span>
                              )}
                            </div>
                            <div className="comment-text">
                              {c.text.split(/(@[A-Za-z0-9_]+)/g).map((part, idx) => {
                                if (part.startsWith('@')) {
                                  return (
                                    <span key={idx} style={{ color: '#6366f1', fontWeight: 700, background: 'rgba(99,102,241,0.1)', padding: '1px 4px', borderRadius: '4px' }}>
                                      {part}
                                    </span>
                                  );
                                }
                                return part;
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="audit-timeline-list">
                  {(issue.history || []).length === 0 ? (
                    <div className="no-deps-text">{t('noAuditHistory')}</div>
                  ) : (
                    (issue.history || []).map(h => {
                      const author = users.find(u => u.id === h.authorId);
                      return (
                        <div key={h.id} className="audit-timeline-item">
                          <img src={author?.avatar} alt={author?.name} className="audit-avatar" />
                          <div className="audit-content">
                            <div className="audit-header">
                              <span className="audit-author">{author?.name}</span>
                              <span className="audit-time">{new Date(h.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="audit-action">{h.action}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar Metadata Fields */}
          <div className={`detail-sidebar-col ${isInitiative ? 'initiative-sidebar' : ''}`}>
            <div className="field-group">
              <label>{t('issueType')}</label>
              <select
                value={issue.type}
                onChange={e => updateIssue(issue.id, { type: e.target.value as IssueType })}
              >
                <option value="feature">{t('typeFeature')}</option>
                <option value="workitem">{t('typeWorkItem')}</option>
                <option value="bug">{t('typeBug')}</option>
                <option value="initiative">{t('typeInitiative')}</option>
              </select>
            </div>

            <div className="field-group">
              <label className="flex-between">
                <span>{t('priority')}</span>
                <span className="priority-icon-inline flex-center gap-1">
                  {getPriorityIcon(issue.priority)}
                </span>
              </label>
              <select
                value={issue.priority}
                onChange={e => updateIssue(issue.id, { priority: e.target.value as Priority })}
              >
                <option value="highest">{t('priorityHighest')}</option>
                <option value="high">{t('priorityHigh')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="low">{t('priorityLow')}</option>
                <option value="lowest">{t('priorityLowest')}</option>
              </select>
            </div>

            <div className="field-group">
              <label>{t('assignee')}</label>
              <select
                value={issue.assigneeId || ''}
                onChange={e => updateIssue(issue.id, { assigneeId: e.target.value || null })}
              >
                <option value="">{t('unassigned')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="field-group">
              <label>{t('reporter')}</label>
              <div className="user-read-only">
                <img src={reporter?.avatar} alt="" className="avatar-xs" />
                <span>{reporter?.name}</span>
              </div>
            </div>

            {!isInitiative && (
              <div className="field-group">
                <label>{t('typeInitiative')}</label>
                <select
                  value={issue.initiativeId || ''}
                  onChange={e => updateIssue(issue.id, { initiativeId: e.target.value || null, epicId: null })}
                >
                  <option value="">{t('none')}</option>
                  {issues.filter(candidate => candidate.type === 'initiative').map(initiative => (
                    <option key={initiative.id} value={initiative.id}>{initiative.summary}</option>
                  ))}
                </select>
              </div>
            )}

            {!isInitiative && <div className="field-group">
              <label>{t('sprint')}</label>
              <select
                value={issue.sprintId || ''}
                onChange={e => updateIssue(issue.id, { sprintId: e.target.value || null })}
              >
                <option value="">{t('backlogLabel')}</option>
                {sprints.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>}

            <div className="field-group">
              <label>{t('dueDate')}</label>
              <input
                type="date"
                value={issue.dueDate}
                onChange={e => updateIssue(issue.id, { dueDate: e.target.value })}
              />
            </div>

            <div className="field-group">
              <label>{t('storyPoints')}</label>
              <input
                type="number"
                min={0}
                value={issue.storyPoints}
                onChange={e => updateIssue(issue.id, { storyPoints: Number(e.target.value) })}
              />
            </div>

            <div className="field-group initiative-technical-field">
              <label>{t('componentName')}</label>
              <input
                type="text"
                value={issue.component}
                onChange={e => updateIssue(issue.id, { component: e.target.value })}
              />
            </div>

            {/* Custom Fields Section */}
            <div className="field-group custom-fields-sidebar-group">
              <label className="cf-sidebar-title">Custom Fields & Metadata</label>
              <div className="cf-sidebar-list">
                {Object.entries(issue.customFields || {
                  'Deployment Environment': 'Production',
                  'Customer Impact Tier': 'VIP Enterprise',
                  'Security Audit Gate': 'Passed',
                }).map(([key, val]) => (
                  <div key={key} className="cf-sidebar-item">
                    <span className="cf-sidebar-key">{key}:</span>
                    <span className="cf-sidebar-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub & CI/CD Integration Panel */}
            <div className="field-group custom-fields-sidebar-group" style={{ marginTop: '16px', background: 'rgba(99, 102, 241, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <label className="cf-sidebar-title" style={{ color: '#818cf8', fontWeight: 700 }}>GitHub & CI/CD Pipeline</label>
              
              <div style={{ fontSize: '0.8rem', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Branch:</span>
                  <code style={{ background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    {issue.githubBranch || `feature/${issue.key.toLowerCase()}`}
                  </code>
                </div>

                <div style={{ marginTop: '8px' }}>
                  <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Pull Requests ({(issue.linkedPRs || []).length}):</span>
                  {(issue.linkedPRs || []).length === 0 ? (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>No linked PRs yet</span>
                  ) : (
                    (issue.linkedPRs || []).map(pr => (
                      <div key={pr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', fontSize: '0.75rem', background: 'var(--bg-secondary)', padding: '4px 6px', borderRadius: '4px' }}>
                        <a href={pr.url} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>
                          #{pr.number} {pr.title}
                        </a>
                        <span className={`status-badge-sm ${pr.status === 'merged' ? 'done' : pr.status === 'open' ? 'in_progress' : 'todo'}`}>
                          {pr.status.toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontWeight: 600, display: 'block', marginBottom: '4px' }}>Commits ({(issue.linkedCommits || []).length}):</span>
                  {(issue.linkedCommits || []).length === 0 ? (
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>No linked commits yet</span>
                  ) : (
                    (issue.linkedCommits || []).slice(-3).map(c => (
                      <div key={c.hash} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '3px' }}>
                        <code style={{ color: '#a78bfa' }}>{c.hash}</code> - {c.message} ({c.author})
                      </div>
                    ))
                  )}
                </div>

                {/* Simulated Webhook Trigger Buttons */}
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    className="btn-secondary-sm"
                    style={{ fontSize: '0.73rem', padding: '4px 8px' }}
                    onClick={() => {
                      const mockCommit = {
                        hash: Math.random().toString(36).substring(2, 9),
                        message: `feat(${issue.key}): Implement core logic for ${issue.summary}`,
                        url: `https://github.com/aether/repo/commit/${Math.random().toString(36).substring(2, 9)}`,
                        author: 'dev-engineer',
                        timestamp: new Date().toISOString()
                      };
                      const existing = issue.linkedCommits || [];
                      updateIssue(issue.id, {
                        status: issue.status === 'todo' ? 'in_progress' : issue.status,
                        linkedCommits: [...existing, mockCommit],
                        history: [
                          ...(issue.history || []),
                          {
                            id: `hist_${Date.now()}`,
                            authorId: 'system_github',
                            action: `Simulated GitHub Push Commit [${mockCommit.hash}] by ${mockCommit.author}`,
                            timestamp: new Date().toISOString()
                          }
                        ]
                      });
                    }}
                  >
                    Simulate GitHub Commit Push
                  </button>

                  <button
                    className="btn-primary-sm"
                    style={{ fontSize: '0.73rem', padding: '4px 8px' }}
                    onClick={() => {
                      const mockPR = {
                        id: `pr_${Date.now()}`,
                        number: Math.floor(100 + Math.random() * 900),
                        title: `fix(${issue.key}): Resolve ${issue.summary}`,
                        url: `https://github.com/aether/repo/pull/${Math.floor(100 + Math.random() * 900)}`,
                        status: 'merged' as const,
                        author: 'lead-dev',
                        createdAt: new Date().toISOString()
                      };
                      const existingPRs = issue.linkedPRs || [];
                      updateIssue(issue.id, {
                        status: 'done',
                        githubBranch: `feature/${issue.key.toLowerCase()}`,
                        linkedPRs: [...existingPRs, mockPR],
                        history: [
                          ...(issue.history || []),
                          {
                            id: `hist_${Date.now()}`,
                            authorId: 'system_github',
                            action: `Simulated GitHub PR #${mockPR.number} MERGED -> Status set to DONE`,
                            timestamp: new Date().toISOString()
                          }
                        ]
                      });
                    }}
                  >
                    Simulate GitHub PR Merge (Auto Done)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
