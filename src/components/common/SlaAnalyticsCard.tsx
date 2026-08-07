import React, { useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconZap, IconClock } from './Icons';

export const SlaAnalyticsCard: React.FC = () => {
  const { issues, updateIssue, t } = useAether();
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

  // Calculate MTTR (Mean Time to Resolution) for completed issues
  const doneIssues = useMemo(() => {
    return issues.filter((i) => i.status === 'done');
  }, [issues]);

  const averageMttrHours = useMemo(() => {
    if (doneIssues.length === 0) return 4.2;
    const totalHours = doneIssues.reduce((sum, issue) => {
      const created = new Date(issue.createdAt || Date.now()).getTime();
      const resolved = new Date(issue.updatedAt || Date.now()).getTime();
      const diffHours = Math.max(0.5, (resolved - created) / (1000 * 60 * 60));
      return sum + diffHours;
    }, 0);
    return Math.round((totalHours / doneIssues.length) * 10) / 10;
  }, [doneIssues]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconClock size={22} color="#3b82f6" />
          <div>
            <h3 className="card-title">{t('slaTitle')}</h3>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div className="sla-compliance-badge" style={{ background: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#3b82f6' }}>
            <span>MTTR:</span>
            <strong>{averageMttrHours}h</strong>
          </div>
          <div className="sla-compliance-badge">
            <span>{t('slaHealth')}:</span>
            <strong>{slaCompliancePct}%</strong>
          </div>
        </div>
      </div>

      {/* SLA Tiers Summary Bar */}
      <div className="sla-summary-grid">
        <div className="sla-metric-box ok">
          <span className="sla-metric-val">{okCount}</span>
          <span className="sla-metric-label">{t('withinSla')}</span>
        </div>
        <div className="sla-metric-box at-risk">
          <span className="sla-metric-val">{atRiskCount}</span>
          <span className="sla-metric-label">{t('slaAtRisk')}</span>
        </div>
        <div className="sla-metric-box breached">
          <span className="sla-metric-val">{breachedCount}</span>
          <span className="sla-metric-label">{t('slaBreached')}</span>
        </div>
      </div>

      {/* SLA Diagnostics Table */}
      <div className="sla-table-container">
        <table className="sla-table">
          <thead>
            <tr>
              <th>{t('issueKey')}</th>
              <th>Summary</th>
              <th>Priority</th>
              <th>Elapsed</th>
              <th>SLA Limit</th>
              <th>{t('status')}</th>
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
                  {d.status === 'ok' && (
                    <span className="sla-status ok">
                      <span className="dot" style={{ backgroundColor: '#10b981', width: 6, height: 6, borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
                      {t('withinSla')}
                    </span>
                  )}
                  {d.status === 'at_risk' && (
                    <span className="sla-status at-risk">
                      <span className="dot" style={{ backgroundColor: '#f59e0b', width: 6, height: 6, borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
                      {d.hoursRemaining}h left
                    </span>
                  )}
                  {d.status === 'breached' && (
                    <span className="sla-status breached">
                      <span className="dot" style={{ backgroundColor: '#de350b', width: 6, height: 6, borderRadius: '50%', display: 'inline-block', marginRight: 5 }}></span>
                      {t('slaBreached')}
                    </span>
                  )}
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
            ? `${breachedCount + atRiskCount} ${t('needsAttention')}`
            : t('siloRiskOk')}
        </span>
        <button
          className="btn-primary-sm"
          onClick={handleAutoEscalate}
          disabled={breachedCount + atRiskCount === 0 || escalated}
        >
          {escalated ? (
            <>
              <IconCheckCircle size={14} /> Escalated to Highest! ✓
            </>
          ) : (
            <>
              <IconZap size={14} style={{ marginRight: 4 }} /> {t('autoEscalateBreached')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};
