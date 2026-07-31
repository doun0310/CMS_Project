import React, { useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconCheckCircle, IconZap, IconBrain, IconUsers } from './Icons';

export const KnowledgeSiloCard: React.FC = () => {
  const { issues, users, createIssue, t } = useAether();
  const [createdTask, setCreatedTask] = useState<string | null>(null);

  // Analyze component ownership distribution among team members
  const componentDiagnostics = useMemo(() => {
    const components = ['Auth & Security', 'UI Component System', 'Database Schema', 'Payment Gateway', 'API Infrastructure'];

    return components.map((comp) => {
      const compIssues = issues.filter((i) => (i.component || '').toLowerCase().includes(comp.toLowerCase().split(' ')[0].toLowerCase()));
      const assignees = new Set(compIssues.map((i) => i.assigneeId).filter(Boolean));
      const busFactor = Math.max(1, assignees.size);

      let riskTier: 'optimal' | 'warning' | 'critical';
      if (busFactor >= 3) {
        riskTier = 'optimal';
      } else if (busFactor === 2) {
        riskTier = 'warning';
      } else {
        riskTier = 'critical';
      }

      // Primary owner
      const primaryOwnerId = Array.from(assignees)[0] || users[0]?.id;
      const primaryOwner = users.find((u) => u.id === primaryOwnerId) || users[0];

      return {
        component: comp,
        busFactor,
        riskTier,
        primaryOwner,
        issueCount: compIssues.length || 2,
      };
    });
  }, [issues, users]);

  const criticalSilosCount = componentDiagnostics.filter((d) => d.riskTier === 'critical').length;
  const overallBusFactorAvg = (
    componentDiagnostics.reduce((acc, d) => acc + d.busFactor, 0) / componentDiagnostics.length
  ).toFixed(1);

  const handleCreateKnowledgeTransferTask = (componentName: string, primaryOwnerName: string) => {
    const secondaryUser = users.find((u) => u.name !== primaryOwnerName) || users[1];
    createIssue({
      summary: `[Knowledge Transfer] Pair programming & docs for ${componentName}`,
      description: `Cross-train ${secondaryUser.name} with ${primaryOwnerName} on ${componentName} to mitigate Bus Factor = 1 risk.`,
      type: 'task',
      priority: 'high',
      status: 'todo',
      assigneeId: secondaryUser.id,
      reporterId: users[0]?.id || '',
      epicId: null,
      sprintId: null,
      storyPoints: 2,
      subtasks: [
        { id: `st-${Date.now()}-1`, title: 'Conduct 1-hour architecture walkthrough', completed: false },
        { id: `st-${Date.now()}-2`, title: 'Pair on next feature PR in this module', completed: false },
      ],
      comments: [],
      history: [],
      labels: ['Knowledge-Share', 'Silo-Mitigation'],
      component: componentName,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      originalEstimate: 4,
      timeLogged: 0,
    });

    setCreatedTask(`Created Knowledge Transfer task for ${componentName} assigned to ${secondaryUser.name}!`);
    setTimeout(() => setCreatedTask(null), 3500);
  };

  return (
    <div className="analytics-card silo-card">
      <div className="card-header-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconBrain size={22} color="#8b5cf6" />
          <div>
            <h3 className="card-title">{t('knowledgeSiloTitle')}</h3>
            <p className="card-subtitle">{t('knowledgeSiloSubtitle')}</p>
          </div>
        </div>
        <div className="bus-factor-badge">
          <span>{t('avgBusFactor')}:</span>
          <strong>{overallBusFactorAvg} {t('engPerComp')}</strong>
        </div>
      </div>

      {/* Silo Risk Overview Bar */}
      <div className="silo-summary-row">
        <div className="silo-stat-pill critical">
          <span className="dot" style={{ backgroundColor: '#de350b', width: 8, height: 8, borderRadius: '50%', display: 'inline-block', marginRight: 6 }}></span>
          <span>{t('singleOwnerSilos')}:</span>
          <strong style={{ marginLeft: 6 }}>{criticalSilosCount} {t('modules')}</strong>
        </div>
        <span className="silo-hint-text">
          {criticalSilosCount > 0 ? t('siloRiskWarning') : t('siloRiskOk')}
        </span>
      </div>

      {/* Components Bus Factor Grid */}
      <div className="silo-components-grid">
        {componentDiagnostics.map((d, idx) => (
          <div key={idx} className={`silo-comp-card ${d.riskTier}`}>
            <div className="comp-card-top">
              <span className="comp-name">{d.component}</span>
              <span className={`bus-badge ${d.riskTier}`}>
                <IconUsers size={12} style={{ marginRight: 4 }} />
                Bus Factor: {d.busFactor}
              </span>
            </div>

            <div className="comp-owner-info">
              <img src={d.primaryOwner?.avatar} alt="" className="avatar-xs" />
              <span>Owner: <strong>{d.primaryOwner?.name}</strong></span>
            </div>

            <div className="comp-card-footer">
              <span className="comp-issues-count">{d.issueCount} {t('tasks')}</span>
              {d.riskTier === 'critical' && (
                <button
                  className="btn-ghost-sm btn-kt"
                  onClick={() => handleCreateKnowledgeTransferTask(d.component, d.primaryOwner?.name || '')}
                >
                  <IconZap size={12} style={{ marginRight: 4 }} /> {t('triggerKnowledgeTransfer')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {createdTask && (
        <div className="silo-toast animate-fade-in">
          <IconCheckCircle size={14} color="#10b981" /> {createdTask}
        </div>
      )}
    </div>
  );
};
