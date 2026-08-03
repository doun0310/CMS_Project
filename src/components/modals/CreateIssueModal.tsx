import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { IssueType, Priority } from '../../types/Aether';
import {
  IconX,
  IconFeature,
  IconWorkItem,
  IconBug,
  IconInitiative,
  IconStory,
  IconTask,
  IconSubtask,
  IconEpic,
  PriorityHighest,
  PriorityHigh,
  PriorityMedium,
  PriorityLow,
  PriorityLowest,
  IconAiSpark
} from '../common/Icons';

export const CreateIssueModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createIssue,
    issues,
    users,
    sprints,
    currentProject,
    currentUser,
    t
  } = useAether();

  const initiatives = issues.filter(issue => issue.type === 'initiative');

  const typeConfig: Record<IssueType, { label: string; renderIcon: (color: string) => React.ReactNode; color: string; desc: string }> = {
    feature: { label: t('typeFeature'), renderIcon: (c) => <IconFeature size={16} color={c} />, color: '#6366f1', desc: '새로운 기능 추가' },
    workitem: { label: t('typeWorkItem'), renderIcon: (c) => <IconWorkItem size={16} color={c} />, color: '#3b82f6', desc: '일반 작업 및 태스크' },
    bug: { label: t('typeBug'), renderIcon: (c) => <IconBug size={16} color={c} />, color: '#ef4444', desc: '버그 및 문제 수정' },
    initiative: { label: t('typeInitiative'), renderIcon: (c) => <IconInitiative size={16} color={c} />, color: '#a855f7', desc: '대규모 상위 에픽' },
    story: { label: t('typeFeature'), renderIcon: (c) => <IconStory size={16} color={c} />, color: '#8b5cf6', desc: '유저 스토리' },
    task: { label: t('typeWorkItem'), renderIcon: (c) => <IconTask size={16} color={c} />, color: '#06b6d4', desc: '하위 태스크' },
    subtask: { label: t('typeSubtask'), renderIcon: (c) => <IconSubtask size={16} color={c} />, color: '#64748b', desc: '소형 작업' },
    epic: { label: t('typeInitiative'), renderIcon: (c) => <IconEpic size={16} color={c} />, color: '#ec4899', desc: '목표 이니셔티브' }
  };

  const priorityConfig: Record<Priority, { label: string; renderIcon: () => React.ReactNode; color: string }> = {
    highest: { label: t('priorityHighest'), renderIcon: () => <PriorityHighest size={15} />, color: '#ef4444' },
    high: { label: t('priorityHigh'), renderIcon: () => <PriorityHigh size={15} />, color: '#f97316' },
    medium: { label: t('priorityMedium'), renderIcon: () => <PriorityMedium size={15} />, color: '#eab308' },
    low: { label: t('priorityLow'), renderIcon: () => <PriorityLow size={15} />, color: '#3b82f6' },
    lowest: { label: t('priorityLowest'), renderIcon: () => <PriorityLowest size={15} />, color: '#94a3b8' }
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!summary.trim()) return;

    createIssue({
      type,
      summary: summary.trim(),
      description: description.trim(),
      priority,
      assigneeId: assigneeId || null,
      epicId: null,
      initiativeId: epicId || null,
      sprintId: sprintId || null,
      storyPoints,
      component,
      dueDate
    });

    setSummary('');
    setDescription('');
    setShowDetails(false);
    setIsCreateModalOpen(false);
  };

  const selectableTypes: IssueType[] = ['feature', 'workitem', 'bug', 'initiative'];
  const selectablePriorities: Priority[] = ['highest', 'high', 'medium', 'low', 'lowest'];

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={() => setIsCreateModalOpen(false)}>
      <div className="create-issue-modal glass-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        {/* Header Bar */}
        <div className="modal-header-bar">
          <div className="title-group">
            <span className="project-badge">{currentProject.key}</span>
            <h2>{t('createIssueTitle')}</h2>
          </div>
          <button className="btn-icon-close" onClick={() => setIsCreateModalOpen(false)} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-form">
          {/* Issue Type Selector Tabs */}
          <div className="form-group">
            <label className="form-label">{t('issueType')} *</label>
            <div className="type-selector-grid">
              {selectableTypes.map(tKey => {
                const conf = typeConfig[tKey];
                const isSelected = type === tKey;
                return (
                  <button
                    key={tKey}
                    type="button"
                    className={`type-chip-btn ${isSelected ? 'selected' : ''}`}
                    style={{ '--chip-color': conf.color } as React.CSSProperties}
                    onClick={() => setType(tKey)}
                  >
                    <span className="chip-icon-wrapper">{conf.renderIcon(conf.color)}</span>
                    <span className="chip-label">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Issue Summary Title */}
          <div className="form-group">
            <label className="form-label">{t('summary')} *</label>
            <input
              type="text"
              required
              autoFocus
              className="form-input-large"
              placeholder={t('summaryPlaceholder')}
              value={summary}
              onChange={e => setSummary(e.target.value)}
            />
          </div>

          {/* Quick Essential Grid (Assignee & Priority) */}
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">{t('assignee')}</label>
              <div className="select-wrapper">
                <select className="form-select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                  <option value="">{t('unassigned')}</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('priority')}</label>
              <div className="priority-chips-row">
                {selectablePriorities.map(pKey => {
                  const pConf = priorityConfig[pKey];
                  const isSelected = priority === pKey;
                  return (
                    <button
                      key={pKey}
                      type="button"
                      className={`priority-chip-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => setPriority(pKey)}
                      title={pConf.label}
                    >
                      <span className="priority-icon-wrapper">{pConf.renderIcon()}</span>
                      <span className="priority-name">{pConf.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Toggle Details Card */}
          <div className="details-toggle-container">
            <button
              type="button"
              className="create-details-toggle-btn"
              onClick={() => setShowDetails(current => !current)}
              aria-expanded={showDetails}
            >
              <span>{showDetails ? '▲ ' + t('hideDetails') : '▼ ' + t('showDetails')}</span>
              <span className="toggle-hint">스프린트, 에픽, 스토리포인트 및 세부설명</span>
            </button>

            {showDetails && (
              <div className="create-details-card animate-fade-in">
                <div className="form-group">
                  <label className="form-label">{t('description')}</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder={t('descriptionPlaceholder')}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('sprint')}</label>
                    <select className="form-select" value={sprintId} onChange={e => setSprintId(e.target.value)}>
                      <option value="">{t('backlogLabel')}</option>
                      {sprints.map(sp => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name} ({sp.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('typeInitiative')}</label>
                    <select className="form-select" value={epicId} onChange={e => setEpicId(e.target.value)}>
                      <option value="">{t('none')}</option>
                      {initiatives.map(initiative => (
                        <option key={initiative.id} value={initiative.id}>
                          {initiative.summary}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">{t('storyPoints')}</label>
                    <input
                      type="number"
                      min={0}
                      className="form-input"
                      value={storyPoints}
                      onChange={e => setStoryPoints(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('dueDate')}</label>
                    <input
                      type="date"
                      className="form-input"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="modal-actions-bar">
            <button type="button" className="btn-ghost-styled" onClick={() => setIsCreateModalOpen(false)}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-primary-styled">
              <IconAiSpark size={16} color="#ffffff" style={{ marginRight: '6px' }} />
              {t('createIssueAction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

