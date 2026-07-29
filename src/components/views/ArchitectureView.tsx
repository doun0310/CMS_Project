import React, { useState, useMemo } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconAiSpark, IconArchitecture } from '../common/Icons';

export const ArchitectureView: React.FC = () => {
  const { issues, users, currentProject, t } = useAether();

  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const typeLabels: Record<string, string> = {
    feature: t('typeFeature'), story: t('typeFeature'), workitem: t('typeWorkItem'), task: t('typeWorkItem'),
    bug: t('typeBug'), initiative: t('typeInitiative'), epic: t('typeInitiative'), subtask: t('typeSubtask')
  };

  // Microservices & Subsystem Architecture Nodes
  const subsystems = [
    {
      id: 'sub-fe',
      name: t('archFrontend'),
      tech: 'React 19 / TypeScript / Vite',
      ownerId: users[0]?.id,
      health: 'healthy',
      keywords: ['frontend', 'ui', 'core', 'header', 'board'],
    },
    {
      id: 'sub-auth',
      name: t('archAuth'),
      tech: 'Node.js / JWT / OAuth 2.0',
      ownerId: users[1]?.id || users[0]?.id,
      health: 'healthy',
      keywords: ['auth', 'security', 'login', 'token'],
    },
    {
      id: 'sub-db',
      name: t('archDatabase'),
      tech: 'PostgreSQL 16 / Redis 7',
      ownerId: users[2]?.id || users[0]?.id,
      health: 'degraded',
      keywords: ['database', 'schema', 'query', 'redis', 'cache'],
    },
    {
      id: 'sub-gw',
      name: t('archGateway'),
      tech: 'Express / NGINX / Gateway',
      ownerId: users[0]?.id,
      health: 'healthy',
      keywords: ['api', 'gateway', 'rest', 'graphql'],
    },
    {
      id: 'sub-pay',
      name: t('archPayment'),
      tech: 'Stripe API / Webhook Handler',
      ownerId: users[1]?.id || users[0]?.id,
      health: 'warning',
      keywords: ['payment', 'billing', 'stripe'],
    },
    {
      id: 'sub-ai',
      name: t('archAiEngine'),
      tech: 'Python FastAPI / Gemini SDK',
      ownerId: users[2]?.id || users[0]?.id,
      health: 'healthy',
      keywords: ['ai', 'copilot', 'analytics', 'inference'],
    },
  ];

  // Map issues to subsystems
  const subsystemNodes = useMemo(() => {
    return subsystems.map((sub) => {
      const linkedIssues = issues.filter((i) => {
        const text = `${i.summary} ${i.component} ${i.description}`.toLowerCase();
        return sub.keywords.some((kw) => text.includes(kw));
      });

      const totalSp = linkedIssues.reduce((acc, i) => acc + (i.storyPoints || 1), 0);
      const owner = users.find((u) => u.id === sub.ownerId) || users[0];

      return {
        ...sub,
        linkedIssues,
        totalSp,
        owner,
      };
    });
  }, [issues, users, subsystems]);

  const filteredIssues = useMemo(() => {
    if (!selectedSubsystem) return issues;
    const targetNode = subsystemNodes.find((n) => n.id === selectedSubsystem);
    return targetNode ? targetNode.linkedIssues : issues;
  }, [selectedSubsystem, issues, subsystemNodes]);

  return (
    <div className="view-container architecture-view animate-fade-in">
      <div className="view-header-row">
        <div>
          <h1 className="view-title view-title-with-icon"><IconArchitecture size={20} /> {t('architectureTitle')}</h1>
          <p className="view-subtitle">
            {t('architectureSubtitle')} [{currentProject.key}]
          </p>
        </div>
      </div>

      {/* Architecture Subsystem Grid */}
      <div className="architecture-grid">
        {subsystemNodes.map((node) => {
          const isSelected = selectedSubsystem === node.id;
          return (
            <div
              key={node.id}
              className={`arch-node-card ${node.health} ${isSelected ? 'selected' : ''}`}
              onClick={() => setSelectedSubsystem(isSelected ? null : node.id)}
            >
              <div className="arch-node-header">
                <span className="arch-node-name">{node.name}</span>
                <span className={`arch-health-badge ${node.health}`}>
                  {node.health === 'healthy' ? `🟢 ${t('healthy')}` : node.health === 'warning' ? `🟡 ${t('heavyLoad')}` : `🔴 ${t('degraded')}`}
                </span>
              </div>

              <div className="arch-node-tech">{node.tech}</div>

              <div className="arch-node-stats">
                <span>{t('issues')}: <strong>{node.linkedIssues.length}</strong></span>
                <span>{t('workload')}: <strong>{node.totalSp} {t('pointsShort')}</strong></span>
              </div>

              <div className="arch-node-footer">
                <div className="arch-owner">
                  <img src={node.owner?.avatar} alt="" className="avatar-xs" />
                  <span>{node.owner?.name}</span>
                </div>
                <span className="arch-click-hint">
                  {isSelected ? t('viewingLinkedIssues') : t('clickToFilter')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Architecture Health Audit Banner */}
      <div className="arch-ai-banner">
        <div className="arch-ai-header">
          <IconAiSpark size={18} color="var(--color-in-progress, #6366f1)" />
          <span>{t('archAiDiagnostics')}</span>
        </div>
        <p className="arch-ai-text">
          {t('archAiDescription')}
        </p>
      </div>

      {/* Filtered Issues Table */}
      <div className="arch-issues-section">
        <div className="arch-issues-header">
          <h3>
            {t('linkedSubsystemIssues')} ({filteredIssues.length})
            {selectedSubsystem && (
              <span className="filter-tag">
                {t('filteredBy')}: {subsystemNodes.find((n) => n.id === selectedSubsystem)?.name}
                <button onClick={() => setSelectedSubsystem(null)} className="clear-filter">✕</button>
              </span>
            )}
          </h3>
        </div>

        <div className="arch-table-wrap">
          <table className="arch-table">
            <thead>
              <tr>
                <th>{t('issueKey')}</th>
                <th>{t('summary')}</th>
                <th>{t('issueType')}</th>
                <th>{t('status')}</th>
                <th>{t('priority')}</th>
                <th>{t('assignee')}</th>
                <th>{t('storyPoints')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue) => {
                const assignee = users.find((u) => u.id === issue.assigneeId);
                return (
                  <tr key={issue.id}>
                    <td className="font-mono font-bold text-indigo">{issue.key}</td>
                    <td className="font-semibold">{issue.summary}</td>
                    <td>
                      <span className={`issue-type-badge ${issue.type}`}>
                        {typeLabels[issue.type] || issue.type}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge-sm ${issue.status}`}>
                        {t(issue.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`priority-pill-sm ${issue.priority}`}>
                        {t(`priority${issue.priority.charAt(0).toUpperCase()}${issue.priority.slice(1)}`)}
                      </span>
                    </td>
                    <td>
                      {assignee ? (
                        <div className="user-info-flex">
                          <img src={assignee.avatar} alt="" className="avatar-xs" />
                          <span>{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-tertiary">Unassigned</span>
                      )}
                    </td>
                    <td className="font-bold">{issue.storyPoints || 1} {t('pointsShort')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
