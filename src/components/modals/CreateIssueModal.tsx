import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { IssueType, Priority } from '../../types/Aether';
import { IconX } from '../common/Icons';

export const CreateIssueModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createIssue,
    users,
    epics,
    sprints,
    currentProject,
    currentUser,
    t
  } = useAether();

  const typeLabels: Record<IssueType, string> = {
    feature: t('typeFeature'),
    story: t('typeFeature'),
    workitem: t('typeWorkItem'),
    task: t('typeWorkItem'),
    bug: t('typeBug'),
    initiative: t('typeInitiative'),
    epic: t('typeInitiative'),
    subtask: t('typeSubtask')
  };

  const priorityLabels: Record<Priority, string> = {
    highest: t('priorityHighest'),
    high: t('priorityHigh'),
    medium: t('priorityMedium'),
    low: t('priorityLow'),
    lowest: t('priorityLowest')
  };

  const [type, setType] = useState<IssueType>('feature');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assigneeId, setAssigneeId] = useState<string>(currentUser.id);
  const [epicId, setEpicId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>(sprints.find(s => s.status === 'active')?.id || '');
  const [storyPoints, setStoryPoints] = useState<number>(3);
  const [component] = useState<string>('Core Engine');
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [showDetails, setShowDetails] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
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
    setShowDetails(false);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
      <div className="create-issue-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <h2>{t('createIssueTitle')} • {currentProject.key}</h2>
          <button className="btn-icon-close" onClick={() => setIsCreateModalOpen(false)}>
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-grid-2 create-essential-fields">
            <div className="form-group">
              <label>{t('issueType')} *</label>
              <select value={type} onChange={e => setType(e.target.value as IssueType)}>
                <option value="feature">{typeLabels.feature}</option>
                <option value="workitem">{typeLabels.workitem}</option>
                <option value="bug">{typeLabels.bug}</option>
                <option value="initiative">{typeLabels.initiative}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('assignee')}</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">{t('unassigned')}</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('summary')} *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder={t('summaryPlaceholder')}
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="create-details-toggle"
            onClick={() => setShowDetails(current => !current)}
            aria-expanded={showDetails}
          >
            {showDetails ? t('hideDetails') : t('showDetails')}
          </button>

          {showDetails && (
            <div className="create-details animate-fade-in">
              <div className="form-group">
                <label>{t('description')}</label>
                <textarea
                  rows={3}
                  placeholder={t('descriptionPlaceholder')}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>{t('priority')}</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as Priority)}>
                    <option value="highest">{priorityLabels.highest}</option>
                    <option value="high">{priorityLabels.high}</option>
                    <option value="medium">{priorityLabels.medium}</option>
                    <option value="low">{priorityLabels.low}</option>
                    <option value="lowest">{priorityLabels.lowest}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('epicLink')}</label>
                  <select value={epicId} onChange={e => setEpicId(e.target.value)}>
                    <option value="">{t('none')}</option>
                    {epics.map(ep => (
                      <option key={ep.id} value={ep.id}>{ep.summary}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label>{t('sprint')}</label>
                  <select value={sprintId} onChange={e => setSprintId(e.target.value)}>
                    <option value="">{t('backlogLabel')}</option>
                    {sprints.map(sp => (
                      <option key={sp.id} value={sp.id}>{sp.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('storyPoints')}</label>
                  <input type="number" min={0} value={storyPoints} onChange={e => setStoryPoints(Number(e.target.value))} />
                </div>

                <div className="form-group">
                  <label>{t('dueDate')}</label>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions-bar">
            <button type="button" className="btn-ghost" onClick={() => setIsCreateModalOpen(false)}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary">
              {t('createIssueAction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
