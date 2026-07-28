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
  const [criticalPathOnly, setCriticalPathOnly] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('all');

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
      <div className="view-header-bar flex-between">
        <div>
          <h2>🗺️ Agile Timeline Roadmap & Milestone Dependencies</h2>
          <p className="subtext">
            Visualize macro epic deliverables, release schedules, critical path bottlenecks & milestone markers.
          </p>
        </div>

        <div className="roadmap-controls">
          <button
            className={`btn-cp-toggle ${criticalPathOnly ? 'active' : ''}`}
            onClick={() => setCriticalPathOnly(!criticalPathOnly)}
            title="Toggle Critical Path Dependency Highlighting"
          >
            🔴 {criticalPathOnly ? 'Critical Path Mode ON' : 'Highlight Critical Path'}
          </button>
          <select
            value={selectedMilestone}
            onChange={(e) => setSelectedMilestone(e.target.value)}
            className="milestone-select"
          >
            <option value="all">🚩 All Release Milestones</option>
            <option value="m1">🚩 Milestone 1: Beta Release (July 24)</option>
            <option value="m2">🚩 Milestone 2: GA Launch (Aug 02)</option>
          </select>
        </div>
      </div>

      {/* Dual-Pane Gantt Container */}
      <div className="gantt-container">
        {/* LEFT PANE: Epics & Features Table with 1 SINGLE Unified Horizontal Scrollbar */}
        <div className="gantt-left-pane">
          <div className="gantt-left-header">
            <div className="left-header-title">Epics & Features</div>
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

              let healthStatus = '🟢 On Schedule';
              let healthClass = 'status-on-schedule';
              if (pointsPct < 30) {
                healthStatus = '🔴 At Risk';
                healthClass = 'status-at-risk';
              } else if (pointsPct < 70) {
                healthStatus = '🟡 Attention';
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
                    <span className="epic-title" title={epic.summary}>{epic.summary}</span>
                    <span className="epic-points-badge">{donePoints}/{totalPoints} pts</span>
                    <span className={`epic-health-badge ${healthClass}`}>{healthStatus}</span>
                  </div>

                  {/* Child Issues Left Rows */}
                  {isExpanded && childIssues.map((issue: Issue) => (
                    <div key={issue.id} className="gantt-left-row issue-row" onClick={() => setSelectedIssueId(issue.id)}>
                      <span className="issue-key">{issue.key}</span>
                      <span className="issue-summary" title={issue.summary}>{issue.summary}</span>
                      <span className="issue-pts">{issue.storyPoints || 0} pts</span>
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
                    {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
                  </span>
                  <span className="day-num">{day.getDate()}</span>
                </div>
              );
            })}
          </div>

          <div className="gantt-right-body">
            {/* Milestone Vertical Flags Overlay */}
            <div className="gantt-milestones-overlay">
              <div className="milestone-line m1" style={{ left: '25%' }} title="Milestone 1: Beta Release (July 24)">
                <span className="milestone-flag">🚩 M1: Beta</span>
              </div>
              <div className="milestone-line m2" style={{ left: '75%' }} title="Milestone 2: GA Production Launch (Aug 02)">
                <span className="milestone-flag">🚩 M2: GA Launch</span>
              </div>
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
                      title={`${epic.summary}: ${pointsPct}% completed (${donePoints}/${totalPoints} pts)`}
                    >
                      <span className="bar-label">
                        {isCritical && '🔴 CRITICAL: '}
                        {epic.summary} ({pointsPct}% Done)
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
                          <span className="bar-label">{issue.key} • {issue.status.toUpperCase()}</span>
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
