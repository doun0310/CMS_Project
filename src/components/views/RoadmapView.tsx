import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Epic, Issue } from '../../types/Aether';

import { IconEpic, IconChevronRight, IconChevronDown } from '../common/Icons';

export const RoadmapView: React.FC = () => {
  const { epics, issues, setSelectedIssueId } = useAether();
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
  for (let i = -3; i < 11; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const getPositionPercent = (dateStr: string) => {
    const d = new Date(dateStr);
    const start = days[0].getTime();
    const end = days[days.length - 1].getTime();
    const current = d.getTime();
    if (current <= start) return 0;
    if (current >= end) return 95;
    return Math.round(((current - start) / (end - start)) * 100);
  };

  return (
    <div className="roadmap-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2>🗺️ Agile Timeline Roadmap</h2>
          <p className="subtext">
            Visualize macro epic deliverables, release schedules, and cross-team dependencies.
          </p>
        </div>
      </div>

      {/* Gantt Timeline Container */}
      <div className="gantt-container">
        {/* Timeline Header Row */}
        <div className="gantt-header">
          <div className="gantt-sidebar-col">Epics & Features</div>
          <div className="gantt-timeline-grid">
            {days.map((day, idx) => {
              const isToday = day.toISOString().split('T')[0] === '2026-07-27';
              return (
                <div key={idx} className={`gantt-day-cell ${isToday ? 'today' : ''}`}>
                  <span className="day-name">
                    {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                  <span className="day-num">{day.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Epics and Children list */}
        <div className="gantt-body">
          {epics.map((epic: Epic) => {
            const isExpanded = !!expandedEpics[epic.id];
            const childIssues = issues.filter((i: Issue) => i.epicId === epic.id);
            const doneChildCount = childIssues.filter((i: Issue) => i.status === 'done').length;
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
                {isExpanded && childIssues.map((issue: Issue) => {
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
