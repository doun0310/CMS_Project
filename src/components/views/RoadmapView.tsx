import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Epic, Issue } from '../../types/Aether';
import { IconEpic, IconChevronRight, IconChevronDown, IconRoadmap, IconPlus, IconSettings, IconTrash } from '../common/Icons';

export const RoadmapView: React.FC = () => {
  const { epics, issues, createEpic, updateEpic, deleteEpic, setSelectedIssueId, t, language } = useAether();
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({
    'epic-1': true,
    'epic-2': true,
    'epic-3': true
  });
  const [criticalPathOnly, setCriticalPathOnly] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const [newEpicSummary, setNewEpicSummary] = useState('');
  const [editingEpicId, setEditingEpicId] = useState<string | null>(null);
  const [editingEpicSummary, setEditingEpicSummary] = useState('');
  const dateLocale = { en: 'en-US', ko: 'ko-KR', ja: 'ja-JP', zh: 'zh-CN' }[language];

  const toggleEpic = (id: string) => {
    setExpandedEpics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Timeline date columns (14-day window for visual clarity)
  const today = new Date('2026-07-27');
  const days: Date[] = [];
  for (let i = -3; i < 11; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const getPositionPercent = (dateStr: string) => {
    const d = new Date(`${dateStr}T00:00:00`);
    const start = days[0].getTime();
    const end = days[days.length - 1].getTime();
    const current = d.getTime();
    if (current <= start) return 0;
    if (current >= end) return 95;
    return Math.round(((current - start) / (end - start)) * 100);
  };

  const milestones = [
    { id: 'm1', date: '2026-07-24', label: t('milestoneBetaShort'), title: t('milestoneBeta') },
    { id: 'm2', date: '2026-08-02', label: t('milestoneGaShort'), title: t('milestoneGa') },
  ].map(milestone => ({ ...milestone, position: getPositionPercent(milestone.date) }));
  const visibleMilestones = selectedMilestone === 'all'
    ? milestones
    : milestones.filter(milestone => milestone.id === selectedMilestone);

  const handleCreateEpic = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const summary = newEpicSummary.trim();
    if (!summary) return;

    const epic = createEpic(summary);
    setExpandedEpics(previous => ({ ...previous, [epic.id]: true }));
    setNewEpicSummary('');
    setIsCreatingEpic(false);
  };

  const handleUpdateEpic = (event: React.SubmitEvent<HTMLFormElement>, epicId: string) => {
    event.preventDefault();
    const summary = editingEpicSummary.trim();
    if (!summary) return;

    updateEpic(epicId, { summary });
    setEditingEpicId(null);
    setEditingEpicSummary('');
  };

  return (
    <div className="roadmap-view animate-fade-in">
      <div className="view-header-bar flex-between">
        <div>
          <h2 className="view-title-with-icon"><IconRoadmap size={20} /> {t('roadmapTitle')}</h2>
        </div>

        <div className="roadmap-controls">
          {isCreatingEpic ? (
            <form className="roadmap-epic-create" onSubmit={handleCreateEpic}>
              <input
                autoFocus
                value={newEpicSummary}
                onChange={event => setNewEpicSummary(event.target.value)}
                placeholder="Epic name"
                aria-label="Epic name"
              />
              <button className="btn-primary-sm" type="submit">Add</button>
              <button
                className="btn-ghost-sm"
                type="button"
                onClick={() => {
                  setNewEpicSummary('');
                  setIsCreatingEpic(false);
                }}
              >
                {t('cancel')}
              </button>
            </form>
          ) : (
            <button className="btn-primary-sm" type="button" onClick={() => setIsCreatingEpic(true)}>
              <IconPlus size={14} /> Add Epic
            </button>
          )}
          <button
            className={`btn-cp-toggle ${criticalPathOnly ? 'active' : ''}`}
            onClick={() => setCriticalPathOnly(!criticalPathOnly)}
            title={t('criticalPathTitle')}
          >
            {criticalPathOnly ? t('criticalPathOn') : t('highlightCriticalPath')}
          </button>
          <select
            value={selectedMilestone}
            onChange={(e) => setSelectedMilestone(e.target.value)}
            className="milestone-select"
          >
            <option value="all">{t('allReleaseMilestones')}</option>
            <option value="m1">{t('milestoneBeta')}</option>
            <option value="m2">{t('milestoneGa')}</option>
          </select>
        </div>
      </div>

      {/* Dual-Pane Gantt Container */}
      <div className="gantt-container">
        {/* LEFT PANE: Epics & Features Table with 1 SINGLE Unified Horizontal Scrollbar */}
        <div className="gantt-left-pane">
          <div className="gantt-left-header">
            <div className="left-header-title">{t('epicsFeatures')}</div>
          </div>

          <div className="gantt-left-body">
            {epics.map((epic: Epic) => {
              const isExpanded = !!expandedEpics[epic.id];
              const childIssues = issues.filter((i: Issue) => i.epicId === epic.id);
              const doneChildCount = childIssues.filter((i: Issue) => i.status === 'done').length;
              const progressPct = childIssues.length > 0 ? Math.round((doneChildCount / childIssues.length) * 100) : 0;

              const totalPoints = childIssues.reduce((acc: number, i: Issue) => acc + (i.storyPoints || 0), 0);
              const donePoints = childIssues.filter((i: Issue) => i.status === 'done').reduce((acc: number, i: Issue) => acc + (i.storyPoints || 0), 0);
              const pointsPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : progressPct;

              let healthStatus = `🟢 ${t('onSchedule')}`;
              let healthClass = 'status-on-schedule';
              if (pointsPct < 30) {
                healthStatus = `🔴 ${t('atRisk')}`;
                healthClass = 'status-at-risk';
              } else if (pointsPct < 70) {
                healthStatus = `🟡 ${t('attention')}`;
                healthClass = 'status-attention';
              }

              return (
                <React.Fragment key={epic.id}>
                  {/* Epic Left Row */}
                  <div className="gantt-left-row epic-row" onClick={() => toggleEpic(epic.id)}>
                    <span className="expand-icon">
                      {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </span>
                    <IconEpic size={16} color={epic.color} />
                    <span className="epic-key">{epic.key}</span>
                    {editingEpicId === epic.id ? (
                      <form
                        className="roadmap-epic-edit"
                        onClick={event => event.stopPropagation()}
                        onSubmit={event => handleUpdateEpic(event, epic.id)}
                      >
                        <input
                          autoFocus
                          value={editingEpicSummary}
                          onChange={event => setEditingEpicSummary(event.target.value)}
                          aria-label="Epic name"
                        />
                        <button className="btn-primary-sm" type="submit">{t('save')}</button>
                        <button
                          className="btn-ghost-sm"
                          type="button"
                          onClick={() => {
                            setEditingEpicId(null);
                            setEditingEpicSummary('');
                          }}
                        >
                          {t('cancel')}
                        </button>
                      </form>
                    ) : (
                      <span className="epic-title" title={epic.summary}>{epic.summary}</span>
                    )}
                    <span className="epic-points-badge">{donePoints}/{totalPoints} {t('pointsShort')}</span>
                    <span className={`epic-health-badge ${healthClass}`}>{healthStatus}</span>
                    <button
                      className="roadmap-epic-action"
                      onClick={event => {
                        event.stopPropagation();
                        setEditingEpicId(epic.id);
                        setEditingEpicSummary(epic.summary);
                      }}
                      title="Edit epic"
                      aria-label={`Edit ${epic.summary}`}
                    >
                      <IconSettings size={13} />
                    </button>
                    <button className="roadmap-epic-action danger" onClick={event => { event.stopPropagation(); if (window.confirm(`Delete ${epic.summary}?`)) deleteEpic(epic.id); }} title="Delete epic"><IconTrash size={13} /></button>
                  </div>

                  {/* Child Issues Left Rows */}
                  {isExpanded && childIssues.map((issue: Issue) => (
                    <div key={issue.id} className="gantt-left-row issue-row" onClick={() => setSelectedIssueId(issue.id)}>
                      <span className="issue-key">{issue.key}</span>
                      <span className="issue-summary" title={issue.summary}>{issue.summary}</span>
                      <span className="issue-pts">{issue.storyPoints || 0} {t('pointsShort')}</span>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Timeline Gantt Grid */}
        <div className="gantt-right-pane">
          <div className="gantt-right-header">
            {days.map((day, idx) => {
              const isToday = day.toISOString().split('T')[0] === '2026-07-27';
              return (
                <div key={idx} className={`gantt-day-cell ${isToday ? 'today' : ''}`}>
                  <span className="day-name">
                    {day.toLocaleDateString(dateLocale, { weekday: 'narrow' })}
                  </span>
                  <span className="day-num">{day.getDate()}</span>
                </div>
              );
            })}
            {visibleMilestones.map(milestone => (
              <span
                key={milestone.id}
                className={`gantt-milestone-label ${milestone.id}`}
                style={{ left: `${milestone.position}%` }}
                title={milestone.title}
              >
                {milestone.label}
              </span>
            ))}
          </div>

          <div className="gantt-right-body">
            {/* Milestone Vertical Flags Overlay */}
            <div className="gantt-milestones-overlay">
              {visibleMilestones.map(milestone => (
                <div key={milestone.id} className="milestone-line" style={{ left: `${milestone.position}%` }} />
              ))}
            </div>

            {epics.map((epic: Epic) => {
              const isExpanded = !!expandedEpics[epic.id];
              const childIssues = issues.filter((i: Issue) => i.epicId === epic.id);
              const doneChildCount = childIssues.filter((i: Issue) => i.status === 'done').length;
              const progressPct = childIssues.length > 0 ? Math.round((doneChildCount / childIssues.length) * 100) : 0;

              const totalPoints = childIssues.reduce((acc: number, i: Issue) => acc + (i.storyPoints || 0), 0);
              const donePoints = childIssues.filter((i: Issue) => i.status === 'done').reduce((acc: number, i: Issue) => acc + (i.storyPoints || 0), 0);
              const pointsPct = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : progressPct;
              const isCritical = criticalPathOnly && pointsPct < 50;

              return (
                <React.Fragment key={epic.id}>
                  {/* Epic Timeline Bar Row */}
                  <div className="gantt-right-row epic-row">
                    <div
                      className={`gantt-bar epic-bar ${isCritical ? 'critical-path-bar' : ''}`}
                      style={{
                        left: '8%',
                        width: '84%',
                        backgroundColor: epic.color
                      }}
                      title={`${epic.summary}: ${pointsPct}% ${t('completed').toLowerCase()} (${donePoints}/${totalPoints} ${t('pointsShort')})`}
                    >
                      <span className="bar-label">
                        {isCritical && `${t('critical')}: `}
                        {epic.summary} ({pointsPct}% {t('completed')})
                      </span>
                      <div className="bar-progress" style={{ width: `${pointsPct}%` }}></div>
                    </div>
                  </div>

                  {/* Child Issues Timeline Bar Rows */}
                  {isExpanded && childIssues.map((issue: Issue) => {
                    const leftPos = getPositionPercent(issue.createdAt);
                    const rightPos = getPositionPercent(issue.dueDate);
                    const barWidth = Math.max(15, rightPos - leftPos);

                    return (
                      <div key={issue.id} className="gantt-right-row issue-row" onClick={() => setSelectedIssueId(issue.id)}>
                        <div
                          className={`gantt-bar issue-bar status-${issue.status}`}
                          style={{
                            left: `${leftPos}%`,
                            width: `${barWidth}%`
                          }}
                        >
                          <span className="bar-label">{issue.key} • {t(issue.status)}</span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
