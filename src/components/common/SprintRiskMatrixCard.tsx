import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconUser, IconShield, IconUserPlus, IconLink, IconScale } from './Icons';

export const SprintRiskMatrixCard: React.FC = () => {
  const { sprints, issues, users, updateIssue, t } = useAether();
  const activeSprint = sprints.find(s => s.status === 'active');
  const [mitigatedAction, setMitigatedAction] = useState<string | null>(null);

  if (!activeSprint) return null;

  const sprintIssues = issues.filter(i => i.sprintId === activeSprint.id);

  // 1. Unassigned High Priority Tasks
  const unassignedHighPrio = sprintIssues.filter(
    i => !i.assigneeId && (i.priority === 'highest' || i.priority === 'high')
  );

  // 2. Unfinished Blocker Dependency Risks
  const blockedIssues = sprintIssues.filter(i => {
    const blockers = (i.blockedBy || []).map(bId => issues.find(x => x.id === bId || x.key === bId));
    return blockers.some(b => b && b.status !== 'done');
  });

  // 3. Unestimated Tasks (Scope Risk)
  const unestimatedTasks = sprintIssues.filter(i => !i.storyPoints || i.storyPoints === 0);

  // Calculate composite Risk Score (0~100)
  const riskPoints = (unassignedHighPrio.length * 25) + (blockedIssues.length * 20) + (unestimatedTasks.length * 15);
  const riskScore = Math.min(100, Math.max(10, riskPoints));

  let riskLevelLabel = t('lowRisk');
  let riskColor = '#36b37e'; // Green
  if (riskScore >= 60) {
    riskLevelLabel = t('highRisk');
    riskColor = '#de350b'; // Red
  } else if (riskScore >= 30) {
    riskLevelLabel = t('mediumRisk');
    riskColor = '#ffab00'; // Yellow
  }

  // 1-Click Mitigation Handler
  const handleAutoAssignUnassigned = () => {
    if (unassignedHighPrio.length === 0) return;
    const defaultUser = users[0];
    unassignedHighPrio.forEach(issue => {
      updateIssue(issue.id, { assigneeId: defaultUser.id });
    });
    setMitigatedAction(`${unassignedHighPrio.length} high priority tasks auto-assigned to ${defaultUser.name}!`);
    setTimeout(() => setMitigatedAction(null), 4000);
  };

  return (
    <div className="sprint-risk-matrix-card animate-fade-in">
      <div className="risk-card-header">
        <div className="risk-title-group">
          <span className="risk-card-icon">
            <IconShield size={22} color={riskColor} />
          </span>
          <div>
            <h3>{t('sprintRiskTitle')}</h3>
          </div>
        </div>

        <div className="risk-score-badge" style={{ borderColor: riskColor, color: riskColor }}>
          <span className="score-val">{riskScore}%</span>
          <span className="score-label">{riskLevelLabel}</span>
        </div>
      </div>

      {mitigatedAction && (
        <div className="mitigation-alert-banner animate-fade-in">
          <IconCheckCircle size={16} color="#10b981" /> {mitigatedAction}
        </div>
      )}

      <div className="risk-vectors-grid">
        {/* Risk Vector 1: Unassigned Tasks */}
        <div className={`vector-card ${unassignedHighPrio.length > 0 ? 'warning' : 'ok'}`}>
          <div className="vector-header">
            <span className="vector-icon">
              <IconUserPlus size={18} color={unassignedHighPrio.length > 0 ? '#ffab00' : '#10b981'} />
            </span>
            <span className="vector-title">{t('unassignedTasksTitle')}</span>
          </div>
          <div className="vector-body">
            <span className="vector-count">{unassignedHighPrio.length}</span>
            <span className="vector-desc">
              {unassignedHighPrio.length > 0 ? t('unassignedHighDesc') : t('unassignedOkDesc')}
            </span>
          </div>
          {unassignedHighPrio.length > 0 && (
            <button className="btn-mitigate-sm" onClick={handleAutoAssignUnassigned}>
              <IconUser size={12} /> {t('autoAssignLead')}
            </button>
          )}
        </div>

        {/* Risk Vector 2: Blocker Bottlenecks */}
        <div className={`vector-card ${blockedIssues.length > 0 ? 'warning' : 'ok'}`}>
          <div className="vector-header">
            <span className="vector-icon">
              <IconLink size={18} color={blockedIssues.length > 0 ? '#de350b' : '#10b981'} />
            </span>
            <span className="vector-title">{t('blockerBottlenecksTitle')}</span>
          </div>
          <div className="vector-body">
            <span className="vector-count">{blockedIssues.length}</span>
            <span className="vector-desc">
              {blockedIssues.length > 0 ? t('blockerWarningDesc') : t('blockerOkDesc')}
            </span>
          </div>
        </div>

        {/* Risk Vector 3: Unestimated Items */}
        <div className={`vector-card ${unestimatedTasks.length > 0 ? 'warning' : 'ok'}`}>
          <div className="vector-header">
            <span className="vector-icon">
              <IconScale size={18} color={unestimatedTasks.length > 0 ? '#ffab00' : '#10b981'} />
            </span>
            <span className="vector-title">{t('unestimatedScopeTitle')}</span>
          </div>
          <div className="vector-body">
            <span className="vector-count">{unestimatedTasks.length}</span>
            <span className="vector-desc">
              {unestimatedTasks.length > 0 ? t('unestimatedWarningDesc') : t('unestimatedOkDesc')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
