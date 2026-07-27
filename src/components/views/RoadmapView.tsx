import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';

import { IconEpic, IconChevronRight, IconChevronDown } from '../common/Icons';

export const RoadmapView: React.FC = () => {
  const { epics, issues, setSelectedIssueId } = useJira();
  const [expandedEpics, setExpandedEpics] = useState<Record<string, boolean>>({
    'epic-1': true,
    'epic-2': true,
    'epic-3': true
  });

  const toggleEpic = (id: string) => {
    setExpandedEpics(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Timeline date columns (14-day window for visual clarity)
  const today = new Date('2026-07-27');
  const days: Date[] = [];
  for (let i = -3; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }

  const getPositionPercent = (dateStr: string) => {
    if (!dateStr) return 20;
    const d = new Date(dateStr);
    const firstDay = days[0];
    const diffTime = d.getTime() - firstDay.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    const pct = (diffDays / days.length) * 100;
    return Math.max(2, Math.min(95, pct));
  };

  return (
    <div className="roadmap-view">
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Timeline Roadmap</h1>
          <p className="view-subtitle">High-level strategic epic roadmap and cross-team milestone planning</p>
        </div>
      </div>

      {/* Gantt Timeline Container */}
      <div className="gantt-container">
        {/* Timeline Header Row */}
        <div className="gantt-header-row">
          <div className="gantt-sidebar-col">EPIC & STORIES</div>
          <div className="gantt-timeline-grid">
            {days.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div key={i} className={`gantt-day-col ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="day-num">{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Epics and Children list */}
        <div className="gantt-body">
          {epics.map(epic => {
            const isExpanded = !!expandedEpics[epic.id];
            const childIssues = issues.filter(i => i.epicId === epic.id);
            const doneChildCount = childIssues.filter(i => i.status === 'done').length;
            const progressPct = childIssues.length > 0 ? Math.round((doneChildCount / childIssues.length) * 100) : 0;

            return (
              <div key={epic.id} className="gantt-epic-group">
                {/* Epic row */}
                <div className="gantt-row epic-row">
                  <div className="gantt-sidebar-col" onClick={() => toggleEpic(epic.id)}>
                    <span className="expand-icon">
                      {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </span>
                    <IconEpic size={16} color={epic.color} />
                    <span className="epic-key">{epic.key}</span>
                    <span className="epic-title">{epic.summary}</span>
                  </div>

                  <div className="gantt-timeline-grid">
                    {/* Epic Bar spanning timeline */}
                    <div
                      className="gantt-bar epic-bar"
                      style={{
                        left: '10%',
                        width: '75%',
                        backgroundColor: epic.color
                      }}
                    >
                      <span className="bar-label">{epic.summary} ({progressPct}% Done)</span>
                      <div className="bar-progress" style={{ width: `${progressPct}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Child issues rows */}
                {isExpanded && childIssues.map(issue => {
                  const leftPos = getPositionPercent(issue.createdAt);
                  const rightPos = getPositionPercent(issue.dueDate);
                  const barWidth = Math.max(15, rightPos - leftPos);

                  return (
                    <div key={issue.id} className="gantt-row issue-row" onClick={() => setSelectedIssueId(issue.id)}>
                      <div className="gantt-sidebar-col sub-col">
                        <span className="issue-key">{issue.key}</span>
                        <span className="issue-summary">{issue.summary}</span>
                      </div>

                      <div className="gantt-timeline-grid">
                        <div
                          className={`gantt-bar issue-bar status-${issue.status}`}
                          style={{
                            left: `${leftPos}%`,
                            width: `${barWidth}%`
                          }}
                        >
                          <span className="bar-label">{issue.key} • {issue.status.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
