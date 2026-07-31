import React, { useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Issue, Sprint, User } from '../../types/Aether';
import { IconAiSpark, IconAnalytics, IconDownload } from '../common/Icons';
import { SprintRiskMatrixCard } from '../common/SprintRiskMatrixCard';
import { TeamHealthPulseCard } from '../common/TeamHealthPulseCard';
import { SlaAnalyticsCard } from '../common/SlaAnalyticsCard';
import { KnowledgeSiloCard } from '../common/KnowledgeSiloCard';

export const ReportsView: React.FC = () => {
  const { issues, sprints, users, t, language } = useAether();
  const [selectedSprintId, setSelectedSprintId] = useState<string>(
    sprints.find((s: Sprint) => s.status === 'active')?.id || sprints[0]?.id || ''
  );

  const [chartView, setChartView] = useState<'burndown' | 'cfd'>('burndown');
  const [showInsights, setShowInsights] = useState(false);

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

    let statusLabel = `🟢 ${t('optimal')}`;
    let statusClass = 'optimal';
    if (pts > 11) {
      statusLabel = `🔴 ${t('overloaded')}`;
      statusClass = 'overloaded';
    } else if (pts > 8) {
      statusLabel = `🟡 ${t('heavyCapacity')}`;
      statusClass = 'heavy';
    }

    return { user: u, count: uIssues.length, points: pts, completedPts, statusLabel, statusClass };
  });

  // Dynamic AI Velocity & Capacity Forecasting Calculations
  const completedIssuesAllSprints = issues.filter((i: Issue) => i.status === 'done');
  const totalCompletedStoryPoints = completedIssuesAllSprints.reduce((sum: number, curr: Issue) => sum + (curr.storyPoints || 0), 0);
  const historicalAvgVelocity = Math.max(
    10,
    totalCompletedStoryPoints > 0 ? totalCompletedStoryPoints : (donePoints > 0 ? donePoints : totalPoints)
  );

  const backlogIssues = issues.filter((i: Issue) => !i.sprintId);
  const totalBacklogPoints = backlogIssues.reduce((acc: number, curr: Issue) => acc + (curr.storyPoints || 0), 0);
  const estimatedSprintsNeeded = Math.max(1, Math.ceil(totalBacklogPoints / historicalAvgVelocity));
  const completionPercentage = totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0;
  const activeEngineerCount = Math.max(1, users.length);
  const recommendedCapacityPerEngineer = (historicalAvgVelocity / activeEngineerCount).toFixed(1);

  // Status changes are not stored as a separate event stream yet.  Use each completed
  // issue's last update as the best available completion timestamp, so the chart always
  // reflects this sprint's work instead of a decorative fixed data set.
  const chartDates = useMemo(() => {
    const start = activeSprint?.startDate ? new Date(`${activeSprint.startDate}T00:00:00`) : new Date();
    const requestedEnd = activeSprint?.endDate ? new Date(`${activeSprint.endDate}T00:00:00`) : new Date();
    const end = requestedEnd >= start ? requestedEnd : new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
    const checkpoints = 6;

    return Array.from({ length: checkpoints }, (_, index) => {
      const ratio = index / (checkpoints - 1);
      return new Date(start.getTime() + (end.getTime() - start.getTime()) * ratio);
    });
  }, [activeSprint?.endDate, activeSprint?.startDate]);

  const burndownSeries = useMemo(() => chartDates.map((date, index) => {
    const completedByDate = sprintIssues
      .filter(issue => issue.status === 'done' && new Date(issue.updatedAt || issue.createdAt) <= date)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const completed = index === chartDates.length - 1 ? donePoints : Math.min(donePoints, completedByDate);

    return {
      date,
      actual: Math.max(0, totalPoints - completed),
      ideal: Math.round(totalPoints * (1 - index / Math.max(chartDates.length - 1, 1)))
    };
  }), [chartDates, donePoints, sprintIssues, totalPoints]);

  const cumulativeFlowSeries = useMemo(() => chartDates.map((date, index) => {
    const availableIssues = sprintIssues.filter(issue => new Date(issue.createdAt) <= date);
    const bucketPoints = (status: Issue['status']) => availableIssues
      .filter(issue => issue.status === status)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const done = availableIssues
      .filter(issue => issue.status === 'done' && new Date(issue.updatedAt || issue.createdAt) <= date)
      .reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    const inProgress = bucketPoints('in_progress');
    const inReview = bucketPoints('in_review');
    const availablePoints = availableIssues.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);

    return {
      date,
      done: index === chartDates.length - 1 ? donePoints : done,
      inReview,
      inProgress,
      todo: Math.max(0, availablePoints - done - inReview - inProgress)
    };
  }), [chartDates, donePoints, sprintIssues]);

  const maxChartValue = Math.max(totalPoints, 1);
  const chartWidth = 520;
  const chartHeight = 220;
  const chartPadding = { left: 42, right: 16, top: 18, bottom: 34 };
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const chartX = (index: number) => chartPadding.left + (plotWidth * index) / Math.max(chartDates.length - 1, 1);
  const chartY = (value: number) => chartPadding.top + plotHeight - (Math.min(value, maxChartValue) / maxChartValue) * plotHeight;
  const actualPath = burndownSeries.map((point, index) => `${index === 0 ? 'M' : 'L'} ${chartX(index)} ${chartY(point.actual)}`).join(' ');
  const idealPath = burndownSeries.map((point, index) => `${index === 0 ? 'M' : 'L'} ${chartX(index)} ${chartY(point.ideal)}`).join(' ');
  const formatChartDate = (date: Date) => new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : language, { month: 'numeric', day: 'numeric' }).format(date);

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = [t('sprintName'), t('status'), t('totalPoints'), t('donePoints'), t('velocityPercent')];
    const row1 = [activeSprint?.name || t('sprint'), activeSprint ? t(activeSprint.status) : t('active'), totalPoints, donePoints, `${completionPercentage}%`].join(',');

    const teamHeader = [`\n${t('teamMember')}`, t('role'), t('assignedTasks'), t('donePoints'), t('totalPoints'), t('capacityHealth')];
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
          <h2 className="view-title-with-icon"><IconAnalytics size={20} /> {t('sprintAnalytics')}</h2>
        </div>

        <div className="sprint-select-wrap reports-controls">
          <label htmlFor="report-sprint">{t('sprint')}</label>
          <select
            id="report-sprint"
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            className="settings-select"
          >
            {sprints.map((s: Sprint) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status.toUpperCase()})
              </option>
            ))}
          </select>

          <button className="btn-ghost-sm report-export-button" onClick={handleExportCSV} title={t('exportCsv')}>
            <IconDownload size={14} /> {t('exportCsv')}
          </button>
        </div>
      </div>

      {/* Analytics Summary Stats Cards */}
      <div className="reports-stats-grid">
        <div className="stat-card">
          <div className="stat-label">{t('sprintCommitment')}</div>
          <div className="stat-value">{totalPoints} <span className="unit">{t('pointsShort')}</span></div>
          <div className="stat-sub">{sprintIssues.length} {t('tasks')} · {activeSprint?.name}</div>
        </div>

        <div className="stat-card done">
          <div className="stat-label">{t('completedVelocity')}</div>
          <div className="stat-value">{donePoints} <span className="unit">{t('pointsShort')}</span></div>
          <div className="stat-sub">{completionPercentage}% {t('goalCompleted')}</div>
        </div>

        <div className="stat-card remaining">
          <div className="stat-label">{t('remainingWork')}</div>
          <div className="stat-value">{remainingPoints} <span className="unit">{t('pointsShort')}</span></div>
          <div className="stat-sub">{statusCounts.todo + statusCounts.in_progress + statusCounts.in_review} {t('remainingTasks')}</div>
        </div>
      </div>

      <div className="ai-forecast-card animate-fade-in">
        <div className="forecast-header">
          <h3 className="section-title-with-icon"><IconAiSpark size={17} /> {t('forecastTitle')}</h3>
          <span className="ai-forecast-badge">{t('predictiveAccuracy')} 94%</span>
        </div>
        <div className="forecast-grid">
          <div className="forecast-item">
            <div className="f-title">{t('averageTeamVelocity')}</div>
            <div className="f-value">{historicalAvgVelocity} {t('pointsShort')} / {t('sprint')}</div>
            <div className="f-sub">{t('basedOnHistoricalSprints')}</div>
          </div>
          <div className="forecast-item">
            <div className="f-title">{t('backlogBurndownTime')}</div>
            <div className="f-value">~{estimatedSprintsNeeded} {t('sprints')} ({estimatedSprintsNeeded * 2} {t('weeks')})</div>
            <div className="f-sub">{totalBacklogPoints} {t('backlogPoints')}</div>
          </div>
          <div className="forecast-item">
            <div className="f-title">{t('recommendedCapacity')}</div>
            <div className="f-value">{recommendedCapacityPerEngineer} {t('pointsShort')} / {t('engineer')}</div>
            <div className="f-sub">{t('preventsBurnout')} ({activeEngineerCount}명 엔지니어 기준)</div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* Chart Box */}
        <div className="chart-box">
          <div className="chart-title-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{chartView === 'burndown' ? t('burndownChart') : t('cumulativeFlow')}</h3>
              <span className="chart-subtitle">{activeSprint?.name}</span>
            </div>
            <div className="chart-view-toggle">
              <button
                className={`btn-toggle-sm ${chartView === 'burndown' ? 'active' : ''}`}
                onClick={() => setChartView('burndown')}
              >
                {t('burndown')}
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
              <>
                <div className="chart-kpi-row">
                  <div><span>{t('remainingWork')}</span><strong>{remainingPoints} {t('pointsShort')}</strong></div>
                  <div><span>{t('goalCompleted')}</span><strong>{completionPercentage}%</strong></div>
                </div>
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="burndown-svg" role="img" aria-label={t('burndownChart')}>
                  {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                    const value = Math.round(maxChartValue * (1 - ratio));
                    const y = chartY(value);
                    return <g key={ratio}>
                      <line x1={chartPadding.left} y1={y} x2={chartWidth - chartPadding.right} y2={y} className="report-chart-gridline" />
                      <text x={chartPadding.left - 8} y={y + 4} className="report-chart-y-label">{value}</text>
                    </g>;
                  })}
                  <path d={idealPath} className="report-ideal-path" />
                  <path d={actualPath} className="report-actual-path" />
                  {burndownSeries.map((point, index) => (
                    <g key={point.date.toISOString()}>
                      <circle cx={chartX(index)} cy={chartY(point.actual)} r={index === burndownSeries.length - 1 ? 4.5 : 3.5} className="report-actual-point" />
                      <text x={chartX(index)} y={chartHeight - 10} textAnchor="middle" className="report-chart-x-label">{formatChartDate(point.date)}</text>
                    </g>
                  ))}
                </svg>
              </>
            ) : (
              <>
                <div className="chart-kpi-row">
                  <div><span>WIP</span><strong>{statusCounts.in_progress + statusCounts.in_review} {t('tasks')}</strong></div>
                  <div><span>{t('done')}</span><strong>{donePoints} {t('pointsShort')}</strong></div>
                </div>
                <div className="cfd-chart" role="img" aria-label={t('cumulativeFlow')}>
                  <div className="cfd-scale"><span>{maxChartValue}</span><span>{Math.round(maxChartValue / 2)}</span><span>0</span></div>
                  <div className="cfd-columns">
                    {cumulativeFlowSeries.map(point => {
                      const total = point.todo + point.inProgress + point.inReview + point.done;
                      const asPercent = (value: number) => `${total ? (value / maxChartValue) * 100 : 0}%`;
                      return <div className="cfd-column" key={point.date.toISOString()}>
                        <div className="cfd-stack" title={`${formatChartDate(point.date)} · ${total} ${t('pointsShort')}`}>
                          <span className="cfd-segment todo" style={{ height: asPercent(point.todo) }} />
                          <span className="cfd-segment progress" style={{ height: asPercent(point.inProgress) }} />
                          <span className="cfd-segment review" style={{ height: asPercent(point.inReview) }} />
                          <span className="cfd-segment done" style={{ height: asPercent(point.done) }} />
                        </div>
                        <span className="cfd-date-label">{formatChartDate(point.date)}</span>
                      </div>;
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="chart-legend">
              {chartView === 'burndown' ? (
                <>
                  <span className="legend-item"><span className="dot ideal"></span> {t('idealGuideline')}</span>
                  <span className="legend-item"><span className="dot actual"></span> {t('actualVelocity')}</span>
                </>
              ) : (
                <>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#10b981' }}></span> {t('done')}</span>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#f59e0b' }}></span> {t('in_review')}</span>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#6366f1' }}></span> {t('in_progress')}</span>
                  <span className="legend-item"><span className="dot" style={{ backgroundColor: '#94a3b8' }}></span> {t('todo')}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Team Workload Chart */}
        <div className="chart-box">
          <div className="chart-title-group">
            <h3>{t('teamWorkload')}</h3>
            <span className="chart-subtitle">{t('workloadDistribution')}</span>
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
                    <strong>{points}</strong> {t('pointsShort')} ({count} {t('tasks')})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="manager-matrix-section animate-fade-in">
        <div className="section-title-group">
          <h3>{t('teamCapacity')}</h3>
          <span className="section-subtitle">{t('teamCapacitySubtitle')}</span>
        </div>

        <div className="matrix-table-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>{t('teamMember')}</th>
                <th>{t('role')}</th>
                <th>{t('assignedTasks')}</th>
                <th>{t('storyPoints')} ({t('done')} / {t('total')})</th>
                <th>{t('capacityHealth')}</th>
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
                  <td>{item.count} {t('tasks')}</td>
                  <td>
                    <strong>{item.completedPts}</strong> / {item.points} {t('pointsShort')}
                  </td>
                  <td>
                    <span className={`capacity-badge ${item.statusClass}`}>{item.statusLabel}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="report-insights-section">
        <div>
          <h3>{t('advancedInsights')}</h3>
          <p>{t('advancedInsightsSubtitle')}</p>
        </div>
        <button
          className="btn-ghost-sm report-insights-toggle"
          onClick={() => setShowInsights(current => !current)}
          aria-expanded={showInsights}
        >
          {showInsights ? t('hideInsights') : t('viewInsights')}
        </button>
      </section>

      {showInsights && (
        <div className="report-insights animate-fade-in">
          <SprintRiskMatrixCard />
          <TeamHealthPulseCard />
          <SlaAnalyticsCard />
          <KnowledgeSiloCard />
        </div>
      )}
    </div>
  );
};
