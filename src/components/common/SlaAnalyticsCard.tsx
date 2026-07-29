import React, { useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconZap } from './Icons';

export const SlaAnalyticsCard: React.FC = () => {
  const { issues, updateIssue } = useAether();
  const [escalated, setEscalated] = useState(false);

  // SLA Threshold rules (in hours) based on priority
  const activeIssues = useMemo(() => {
    return issues.filter((i) => i.status !== 'done');
  }, [issues]);

  // Calculate SLA status for each active issue
  const slaDiagnostics = useMemo(() => {
    const now = new Date().getTime();
    const thresholds: Record<string, number> = {
      highest: 4,
      high: 24,
      medium: 48,
      low: 72,
      lowest: 120,
    };

    return activeIssues.map((issue) => {
      const createdTime = new Date(issue.createdAt || Date.now()).getTime();
      const elapsedHours = Math.max(1, Math.round((now - createdTime) / (1000 * 60 * 60)));
      const maxAllowedHours = thresholds[issue.priority] || 48;
      const hoursRemaining = maxAllowedHours - elapsedHours;

      let status: 'ok' | 'at_risk' | 'breached';
      if (hoursRemaining <= 0) {
        status = 'breached';
      } else if (hoursRemaining <= 6) {
        status = 'at_risk';
      } else {
        status = 'ok';
      }

      return {
        issue,
        elapsedHours,
        maxAllowedHours,
        hoursRemaining,
        status,
      };
    });
  }, [activeIssues]);

  const breachedCount = slaDiagnostics.filter((d) => d.status === 'breached').length;
  const atRiskCount = slaDiagnostics.filter((d) => d.status === 'at_risk').length;
  const okCount = slaDiagnostics.filter((d) => d.status === 'ok').length;

  const slaCompliancePct = activeIssues.length > 0
    ? Math.round(((okCount + atRiskCount * 0.5) / activeIssues.length) * 100)
    : 100;

  const handleAutoEscalate = () => {
    const targetDiagnoses = slaDiagnostics.filter((d) => d.status === 'breached' || d.status === 'at_risk');
    targetDiagnoses.forEach((d) => {
      updateIssue(d.issue.id, {
        priority: 'highest',
      });
    });
    setEscalated(true);
    setTimeout(() => setEscalated(false), 3000);
  };

  return (
    <div className="analytics-card sla-card">
      <div className="card-header-row">
        <div>
          <h3 className="card-title">⏱️ Enterprise SLA & MTTR Compliance Diagnostics</h3>
          <p className="card-subtitle">
            Service Level Agreement tracking & Mean Time To Resolution (MTTR) monitoring
          </p>
        </div>
        <div className="sla-compliance-badge">
          <span>SLA Health:</span>
          <strong>{slaCompliancePct}%</strong>
        </div>
      </div>

      {/* SLA Tiers Summary Bar */}
      <div className="sla-summary-grid">
        <div className="sla-metric-box ok">
          <span className="sla-metric-val">{okCount}</span>
          <span className="sla-metric-label">🟢 Within SLA Threshold</span>
        </div>
        <div className="sla-metric-box at-risk">
          <span className="sla-metric-val">{atRiskCount}</span>
          <span className="sla-metric-label">🟡 SLA At-Risk (&lt; 6h)</span>
        </div>
        <div className="sla-metric-box breached">
          <span className="sla-metric-val">{breachedCount}</span>
          <span className="sla-metric-label">🔴 SLA Breached</span>
        </div>
      </div>

      {/* SLA Diagnostics Table */}
      <div className="sla-table-container">
        <table className="sla-table">
          <thead>
            <tr>
              <th>Issue Key</th>
              <th>Summary</th>
              <th>Priority</th>
              <th>Elapsed</th>
              <th>SLA Limit</th>
              <th>SLA Status</th>
            </tr>
          </thead>
          <tbody>
            {slaDiagnostics.slice(0, 5).map((d) => (
              <tr key={d.issue.id}>
                <td className="font-mono font-bold">{d.issue.key}</td>
                <td className="truncate-cell">{d.issue.summary}</td>
                <td>
                  <span className={`priority-pill-sm ${d.issue.priority}`}>
                    {d.issue.priority.toUpperCase()}
                  </span>
                </td>
                <td>{d.elapsedHours}h</td>
                <td>{d.maxAllowedHours}h</td>
                <td>
                  {d.status === 'ok' && <span className="sla-status ok">🟢 OK</span>}
                  {d.status === 'at_risk' && <span className="sla-status at-risk">🟡 {d.hoursRemaining}h left</span>}
                  {d.status === 'breached' && <span className="sla-status breached">🔴 Breached</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Row */}
      <div className="sla-action-footer">
        <span className="sla-hint">
          {breachedCount + atRiskCount > 0
            ? `⚠️ ${breachedCount + atRiskCount} issues require immediate escalation to prevent breach.`
            : '✅ All active issues are currently well within SLA limits.'}
        </span>
        <button
          className="btn-primary-sm"
          onClick={handleAutoEscalate}
          disabled={breachedCount + atRiskCount === 0 || escalated}
        >
          {escalated ? (
            <>
              <IconCheckCircle size={14} /> Escalated to Highest Priority!
            </>
          ) : (
            <>
              <IconZap size={14} /> ⚡ Auto-Escalate At-Risk Issues
            </>
          )}
        </button>
      </div>
    </div>
  );
};
