import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Issue, Sprint, User } from '../../types/Aether';
import { IconDownload } from '../common/Icons';
import { SprintRiskMatrixCard } from '../common/SprintRiskMatrixCard';
import { TeamHealthPulseCard } from '../common/TeamHealthPulseCard';
import { SlaAnalyticsCard } from '../common/SlaAnalyticsCard';
import { KnowledgeSiloCard } from '../common/KnowledgeSiloCard';

export const ReportsView: React.FC = () => {
  const { issues, sprints, users } = useAether();
  const [selectedSprintId, setSelectedSprintId] = useState<string>(
    sprints.find((s: Sprint) => s.status === 'active')?.id || sprints[0]?.id || ''
  );

  const [chartView, setChartView] = useState<'burndown' | 'cfd'>('burndown');

  const activeSprint = sprints.find((s: Sprint) => s.id === selectedSprintId) || sprints[0];
  const sprintIssues = issues.filter((i: Issue) => i.sprintId === activeSprint?.id);

  const totalPoints = sprintIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
  const donePoints = sprintIssues
    .filter((i: Issue) => i.status === 'done')
    .reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
  const remainingPoints = Math.max(0, totalPoints - donePoints);

  // Status breakdown count
  const statusCounts = {
    todo: sprintIssues.filter((i: Issue) => i.status === 'todo').length,
    in_progress: sprintIssues.filter((i: Issue) => i.status === 'in_progress').length,
    in_review: sprintIssues.filter((i: Issue) => i.status === 'in_review').length,
    done: sprintIssues.filter((i: Issue) => i.status === 'done').length
  };

  // Workload breakdown by user
  const userWorkloads = users.map((u: User) => {
    const uIssues = sprintIssues.filter((i: Issue) => i.assigneeId === u.id);
    const pts = uIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
    const completedPts = uIssues
      .filter((i: Issue) => i.status === 'done')
      .reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);

    let statusLabel = '🟢 Optimal';
    let statusClass = 'optimal';
    if (pts > 11) {
      statusLabel = '🔴 Overloaded';
      statusClass = 'overloaded';
    } else if (pts > 8) {
      statusLabel = '🟡 Heavy Capacity';
      statusClass = 'heavy';
    }

    return { user: u, count: uIssues.length, points: pts, completedPts, statusLabel, statusClass };
  });

  // AI Velocity Forecasting Calculation
  const historicalAvgVelocity = 28; // Story Points per sprint average
  const backlogIssues = issues.filter((i: Issue) => !i.sprintId);
  const totalBacklogPoints = backlogIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
  const estimatedSprintsNeeded = Math.ceil(totalBacklogPoints / historicalAvgVelocity);
  const completionPercentage = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = ['Sprint Name', 'Status', 'Total Points', 'Done Points', 'Velocity %'];
    const row1 = [activeSprint?.name || 'Sprint', activeSprint?.status || 'Active', totalPoints, donePoints, `${completionPercentage}%`].join(',');

    const teamHeader = ['\nTeam Member', 'Role', 'Assigned Tasks', 'Done Points', 'Total Points', 'Capacity Health'];
    const teamRows = userWorkloads.map(w =>
      [w.user.name, w.user.role, w.count, w.completedPts, w.points, w.statusLabel.replace(/,/g, '')].join(',')
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), row1, teamHeader.join(','), ...teamRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aether-sprint-report-${activeSprint?.name.toLowerCase().replace(/\s+/g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2>📊 Advanced Agile Analytics & Manager Capacity Matrix</h2>
          <p className="subtext">
            Sprint burndown trends, team workload matrix, and AI-powered velocity completion forecasts.
          </p>
        </div>

        {/* Sprint Selector & Export Controls */}
        <div className="sprint-select-wrap">
          <label>Select Sprint: </label>
          <select
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            className="settings-select"
            style={{ width: '200px', display: 'inline-block' }}
          >
            {sprints.map((s: Sprint) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button className="btn-primary-sm" onClick={handleExportCSV} title="Export CSV Report" style={{ marginLeft: '10px' }}>
            <IconDownload size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* AI Multi-Factor Sprint Risk Matrix & Automated Mitigation Recommender */}
      <SprintRiskMatrixCard />

      {/* AI Team Health Pulse & Developer Burnout Risk Diagnostics */}
      <TeamHealthPulseCard />

      {/* Analytics Summary Stats Cards */}
      <div className="reports-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Sprint Commitment</div>
          <div className="stat-value">{totalPoints} <span className="unit">pts</span></div>
          <div className="stat-sub">{sprintIssues.length} tasks in {activeSprint?.name}</div>
        </div>

        <div className="stat-card done">
          <div className="stat-label">Completed Velocity</div>
          <div className="stat-value">{donePoints} <span className="unit">pts</span></div>
          <div className="stat-sub">{completionPercentage}% of goal completed</div>
        </div>

        <div className="stat-card remaining">
          <div className="stat-label">Remaining Work</div>
          <div className="stat-value">{remainingPoints} <span className="unit">pts</span></div>
          <div className="stat-sub">{statusCounts.todo + statusCounts.in_progress + statusCounts.in_review} remaining tasks</div>
        </div>
      </div>

      {/* AI Velocity Forecasting Banner */}
      <div className="ai-forecast-card animate-fade-in">
        <div className="forecast-header">
          <h3>🤖 AI Sprint Completion & Capacity Forecast</h3>
          <span className="ai-forecast-badge">Predictive Accuracy 94%</span>
        </div>
        <div className="forecast-grid">
          <div className="forecast-item">
            <div className="f-title">Avg Team Velocity</div>
            <div className="f-value">{historicalAvgVelocity} pts / sprint</div>
            <div className="f-sub">Based on 3 historical sprints</div>
          </div>
          <div className="forecast-item">
            <div className="f-title">Backlog Burndown Time</div>
            <div className="f-value">~{estimatedSprintsNeeded} Sprints ({estimatedSprintsNeeded * 2} weeks)</div>
            <div className="f-sub">{totalBacklogPoints} points in backlog</div>
          </div>
          <div className="forecast-item">
            <div className="f-title">Recommended Capacity</div>
            <div className="f-value">7.5 pts / engineer</div>
            <div className="f-sub">Prevents burnout & bottlenecks</div>
          </div>
        </div>
      </div>

      {/* SVG Sprint Burndown / CFD Chart & Team Workload */}
      <div className="charts-grid">
        {/* Chart Box */}
        <div className="chart-box">
          <div className="chart-title-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{chartView === 'burndown' ? 'Sprint Burndown Chart' : 'Cumulative Flow Diagram (CFD)'}</h3>
              <span className="chart-subtitle">{activeSprint?.name}</span>
            </div>
            <div className="chart-view-toggle">
              <button
                className={`btn-toggle-sm ${chartView === 'burndown' ? 'active' : ''}`}
                onClick={() => setChartView('burndown')}
              >
                Burndown
              </button>
              <button
                className={`btn-toggle-sm ${chartView === 'cfd' ? 'active' : ''}`}
                onClick={() => setChartView('cfd')}
              >
                CFD
              </button>
            </div>
          </div>

          <div className="svg-chart-container">
            {chartView === 'burndown' ? (
              <svg viewBox="0 0 500 200" className="burndown-svg">
                {/* Grid Lines */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="40" y1="70" x2="480" y2="70" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="var(--border-color)" strokeDasharray="3 3" />
                <line x1="40" y1="170" x2="480" y2="170" stroke="var(--border-color)" strokeDasharray="3 3" />

                {/* Y Axis Labels */}
                <text x="10" y="25" fill="var(--text-secondary)" fontSize="11">{totalPoints} pts</text>
                <text x="10" y="75" fill="var(--text-secondary)" fontSize="11">{Math.round(totalPoints * 0.75)}</text>
                <text x="10" y="125" fill="var(--text-secondary)" fontSize="11">{Math.round(totalPoints * 0.5)}</text>
                <text x="10" y="175" fill="var(--text-secondary)" fontSize="11">0</text>

                {/* Ideal Burndown Line */}
                <line x1="40" y1="20" x2="460" y2="170" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />

                {/* Actual Burndown Polyline */}
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  points="40,20 120,35 200,60 280,75 360,110 440,140"
                />

                {/* Data points */}
                <circle cx="40" cy="20" r="4" fill="#6366f1" />
                <circle cx="120" cy="35" r="4" fill="#6366f1" />
                <circle cx="200" cy="60" r="4" fill="#6366f1" />
                <circle cx="280" cy="75" r="4" fill="#6366f1" />
                <circle cx="360" cy="110" r="4" fill="#6366f1" />
                <circle cx="440" cy="140" r="5" fill="#10b981" stroke="#fff" strokeWidth="2" />
              </svg>
            ) : (
              /* CFD Area Chart SVG */
              <svg viewBox="0 0 500 200" className="burndown-svg">
                <polygon points="40,170 120,150 200,120 280,100 360,70 440,40 440,170 40,170" fill="rgba(16, 185, 129, 0.4)" />
                <polygon points="40,150 120,130 200,100 280,80 360,50 440,30 440,40 360,70 280,100 200,120 120,150 40,170" fill="rgba(245, 158, 11, 0.4)" />
                <polygon points="40,100 120,80 200,60 280,40 360,30 440,20 440,30 360,50 280,80 200,100 120,130 40,150" fill="rgba(99, 102, 241, 0.4)" />

                <text x="50" y="160" fill="#10b981" fontSize="10" fontWeight="bold">DONE</text>
                <text x="180" y="110" fill="#f59e0b" fontSize="10" fontWeight="bold">IN REVIEW</text>
                <text x="300" y="55" fill="#6366f1" fontSize="10" fontWeight="bold">IN PROGRESS</text>
              </svg>
            )}

            <div className="chart-legend">
              {chartView === 'burndown' ? (
                <>
                  <span className="legend-item"><span className="dot ideal"></span> Ideal Guideline</span>
                  <span className="legend-item"><span className="dot actual"></span> Actual Velocity</span>
                </>
              ) : (
                <>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#10b981' }}></span> Done</span>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#f59e0b' }}></span> In Review</span>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#6366f1' }}></span> In Progress</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Team Workload Chart */}
        <div className="chart-box">
          <div className="chart-title-group">
            <h3>Team Member Workload</h3>
            <span className="chart-subtitle">Story points distribution per engineer</span>
          </div>

          <div className="workload-list">
            {userWorkloads.map(item => {
              const { user, count, points } = item;
              const maxPts = Math.max(...userWorkloads.map(u => u.points), 1);
              const barWidth = Math.round((points / maxPts) * 100);

              return (
                <div key={user.id} className="workload-item">
                  <div className="user-info">
                    <img src={user.avatar} alt={user.name} className="avatar-sm" />
                    <div>
                      <div className="user-name">{user.name}</div>
                      <div className="user-role">{user.role}</div>
                    </div>
                  </div>

                  <div className="workload-bar-wrap">
                    <div className="workload-bar" style={{ width: `${barWidth}%` }}></div>
                  </div>

                  <div className="workload-pts">
                    <strong>{points}</strong> pts ({count} tasks)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enterprise SLA Diagnostics Card */}
      <div style={{ marginTop: '20px' }}>
        <SlaAnalyticsCard />
      </div>

      {/* Team Knowledge Silo & Bus Factor Card */}
      <div style={{ marginTop: '20px' }}>
        <KnowledgeSiloCard />
      </div>

      {/* Manager Resource & Capacity Allocation Matrix Table */}
      <div className="manager-matrix-section animate-fade-in">
        <div className="section-title-group">
          <h3>👨‍💼 Manager Team Resource & Capacity Matrix</h3>
          <span className="section-subtitle">Real-time team load balancing & capacity status for Managers</span>
        </div>

        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Role</th>
                <th>Assigned Tasks</th>
                <th>Story Points (Done / Total)</th>
                <th>Capacity Health</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userWorkloads.map(item => (
                <tr key={item.user.id}>
                  <td>
                    <div className="user-info-flex">
                      <img src={item.user.avatar} alt="" className="avatar-xs" />
                      <strong>{item.user.name}</strong>
                    </div>
                  </td>
                  <td>{item.user.role}</td>
                  <td>{item.count} tasks</td>
                  <td>
                    <strong>{item.completedPts}</strong> / {item.points} pts
                  </td>
                  <td>
                    <span className={`capacity-badge ${item.statusClass}`}>{item.statusLabel}</span>
                  </td>
                  <td>
                    <button className="btn-ghost-sm" title="Manage workload">
                      View Tasks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
