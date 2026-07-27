import React from 'react';
import { useJira } from '../../context/JiraContext';


export const ReportsView: React.FC = () => {
  const { issues, sprints, users } = useJira();

  const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
  const sprintIssues = issues.filter(i => i.sprintId === activeSprint?.id);

  const totalPoints = sprintIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
  const donePoints = sprintIssues
    .filter(i => i.status === 'done')
    .reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
  const remainingPoints = totalPoints - donePoints;

  // Status breakdown count
  const statusCounts = {
    todo: sprintIssues.filter(i => i.status === 'todo').length,
    in_progress: sprintIssues.filter(i => i.status === 'in_progress').length,
    in_review: sprintIssues.filter(i => i.status === 'in_review').length,
    done: sprintIssues.filter(i => i.status === 'done').length
  };

  // Workload breakdown by user
  const userWorkloads = users.map(u => {
    const uIssues = sprintIssues.filter(i => i.assigneeId === u.id);
    const pts = uIssues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
    return { user: u, count: uIssues.length, points: pts };
  });

  return (
    <div className="reports-view">
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Agile Reports & Analytics</h1>
          <p className="view-subtitle">Sprint burndown charts, team velocity, and issue state metrics</p>
        </div>
      </div>

      {/* Analytics Summary Stats Cards */}
      <div className="reports-stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Sprint Commitment</div>
          <div className="stat-value">{totalPoints} <span className="unit">pts</span></div>
          <div className="stat-sub">{sprintIssues.length} issues in {activeSprint?.name}</div>
        </div>

        <div className="stat-card done">
          <div className="stat-label">Completed Velocity</div>
          <div className="stat-value">{donePoints} <span className="unit">pts</span></div>
          <div className="stat-sub">{Math.round(totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0)}% of goal</div>
        </div>

        <div className="stat-card remaining">
          <div className="stat-label">Remaining Work</div>
          <div className="stat-value">{remainingPoints} <span className="unit">pts</span></div>
          <div className="stat-sub">{statusCounts.todo + statusCounts.in_progress + statusCounts.in_review} remaining issues</div>
        </div>
      </div>

      {/* SVG Sprint Burndown Chart & Status Breakdown */}
      <div className="charts-grid">
        {/* SVG Burndown Chart */}
        <div className="chart-box">
          <div className="chart-title-group">
            <h3>Sprint Burndown Chart</h3>
            <span className="chart-subtitle">{activeSprint?.name}</span>
          </div>

          <div className="svg-chart-container">
            <svg viewBox="0 0 500 220" className="burndown-svg">
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
                stroke="#0052CC"
                strokeWidth="3.5"
                points="40,20 120,35 200,60 280,75 360,110 440,140"
              />

              {/* Data points */}
              <circle cx="40" cy="20" r="4" fill="#0052CC" />
              <circle cx="120" cy="35" r="4" fill="#0052CC" />
              <circle cx="200" cy="60" r="4" fill="#0052CC" />
              <circle cx="280" cy="75" r="4" fill="#0052CC" />
              <circle cx="360" cy="110" r="4" fill="#0052CC" />
              <circle cx="440" cy="140" r="5" fill="#36B37E" stroke="#fff" strokeWidth="2" />
            </svg>

            <div className="chart-legend">
              <span className="legend-item"><span className="dot ideal"></span> Ideal Guideline</span>
              <span className="legend-item"><span className="dot actual"></span> Actual Velocity</span>
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
            {userWorkloads.map(({ user, count, points }) => {
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
    </div>
  );
};
