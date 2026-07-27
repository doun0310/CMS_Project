import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';
import type { IssueType, Priority } from '../../types/jira';
import { IconX } from '../common/Icons';

export const CreateIssueModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createIssue,
    users,
    epics,
    sprints,
    currentProject
  } = useJira();

  const [type, setType] = useState<IssueType>('story');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>(users[0]?.id || '');
  const [epicId, setEpicId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>(sprints.find(s => s.status === 'active')?.id || '');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [component] = useState<string>('Core Engine');
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    createIssue({
      type,
      summary: summary.trim(),
      description: description.trim(),
      priority,
      assigneeId: assigneeId || null,
      epicId: epicId || null,
      sprintId: sprintId || null,
      storyPoints,
      component,
      dueDate
    });

    // Reset and close
    setSummary('');
    setDescription('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
      <div className="create-issue-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h2>Create Issue • {currentProject.key}</h2>
          <button className="btn-icon-close" onClick={() => setIsCreateModalOpen(false)}>
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Issue Type *</label>
              <select value={type} onChange={e => setType(e.target.value as IssueType)}>
                <option value="story">Story</option>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="epic">Epic</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                <option value="highest">Highest</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="lowest">Lowest</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Summary *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Implement OAuth2 client credentials grant flow"
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={4}
              placeholder="Provide background context, acceptance criteria, or design links..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label>Assignee</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Epic Link</label>
              <select value={epicId} onChange={e => setEpicId(e.target.value)}>
                <option value="">None</option>
                {epics.map(ep => (
                  <option key={ep.id} value={ep.id}>{ep.summary}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label>Sprint</label>
              <select value={sprintId} onChange={e => setSprintId(e.target.value)}>
                <option value="">Backlog</option>
                {sprints.map(sp => (
                  <option key={sp.id} value={sp.id}>{sp.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Story Points</label>
              <input
                type="number"
                min={0}
                value={storyPoints}
                onChange={e => setStoryPoints(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions-bar">
            <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
