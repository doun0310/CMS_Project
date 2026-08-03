import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconArchitecture } from '../common/Icons';

interface DependencyGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DependencyGraphModal: React.FC<DependencyGraphModalProps> = ({ isOpen, onClose }) => {
  const { issues, updateIssue, t } = useAether();

  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [attachedSuccess, setAttachedSuccess] = useState(false);

  const targetIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const blastScore = React.useMemo(() => {
    if (!targetIssue) return 68;
    const base = targetIssue.priority === 'highest' ? 85 : targetIssue.priority === 'high' ? 72 : targetIssue.priority === 'medium' ? 50 : 32;
    const pointsBonus = Math.min(14, (targetIssue.storyPoints || 0) * 1.5);
    return Math.min(99, Math.round(base + pointsBonus));
  }, [targetIssue]);

  const couplingTier = blastScore >= 75 ? 'High' : blastScore >= 45 ? 'Moderate' : 'Low';

  const dependencyNodes = React.useMemo(() => {
    const comp = targetIssue?.component || 'Core Engine';
    return [
      { id: 'n-1', name: `${comp} API Gateway`, type: 'upstream', health: 'healthy', blastScore: Math.min(95, blastScore + 8) },
      { id: 'n-2', name: 'User Session DB Cluster', type: 'database', health: 'healthy', blastScore: Math.min(90, blastScore + 4) },
      { id: 'n-3', name: 'Billing & Enterprise Service', type: 'downstream', health: blastScore > 70 ? 'degraded' : 'healthy', blastScore: Math.max(20, blastScore - 15) },
      { id: 'n-4', name: 'Mobile Push Notification Desk', type: 'downstream', health: 'healthy', blastScore: Math.max(15, blastScore - 30) },
    ];
  }, [targetIssue, blastScore]);

  if (!isOpen) return null;

  const handleAttachGraphBadge = () => {
    if (!targetIssue) return;
    const currentDesc = targetIssue.description || '';
    const badgeMarkdown = `\n\n### AI Dependency & Blast Radius Diagnosis\n` +
      `- **Target Subsystem:** ${targetIssue.component || 'Core Engine'}\n` +
      `- **Blast Radius Index:** ${blastScore}% (${couplingTier} Subsystem Coupling)\n` +
      `- **Affected Services:** ${dependencyNodes.map(n => n.name).join(', ')}\n` +
      `- **Canary Flag Recommended:** \`FF_${(targetIssue.key || 'APP').replace('-', '_')}_CANARY\``;

    updateIssue(targetIssue.id, {
      description: currentDesc + badgeMarkdown,
    });

    setAttachedSuccess(true);
    setTimeout(() => {
      setAttachedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content dep-graph-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconArchitecture size={20} /></span>
            <div>
              <h2 className="modal-title">{t('dependencyGraphModalTitle')}</h2>
              <p className="modal-subtitle">
                Subsystem coupling visualizer & downstream risk analysis for [{targetIssue?.key}]
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body dep-graph-body">
          {/* Target Issue Selection Bar */}
          <div className="dep-issue-select-row">
            <label>{t('selectTargetIssue')}:</label>
            <select
              value={selectedIssueId}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="dep-select"
            >
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.key}] {i.summary} ({i.component})
                </option>
              ))}
            </select>
          </div>

          {/* Blast Radius Scorecard Banner */}
          <div className="blast-banner">
            <div className="blast-score-box">
              <span className="blast-val">{blastScore}%</span>
              <span className="blast-lbl">{t('blastRadiusIndex')}</span>
            </div>
            <div className="blast-meta">
              <span className="blast-title">{couplingTier} {t('subsystemCouplingDetected')}</span>
              <p className="blast-desc">
                Modifying <strong>{targetIssue?.component || 'Core Module'}</strong> impacts {dependencyNodes.length} downstream microservices & active sprint tickets. Canary deployment recommended.
              </p>
            </div>
          </div>

          {/* Subsystem Dependency Nodes Grid */}
          <div className="dep-nodes-section">
            <h3>{t('linkedSubsystemNodes')}</h3>

            <div className="dep-nodes-grid">
              {dependencyNodes.map((node) => (
                <div key={node.id} className="`dep`-node-card">
                  <div className="node-top">
                    <span className="node-name">{node.name}</span>
                    <span className={`node-type-badge ${node.type}`}>{node.type.toUpperCase()}</span>
                  </div>
                  <div className="node-bottom">
                    <span className="node-health">{t('healthy')}: {node.health}</span>
                    <span className="node-blast">Score: {node.blastScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
          <button
            className="btn-primary"
            onClick={handleAttachGraphBadge}
            disabled={attachedSuccess}
          >
            {attachedSuccess ? (
              <>
                <IconCheckCircle /> {t('attachedBlastBadgeSuccess')}
              </>
            ) : (
              <>
                <IconZap /> {t('attachDependencyBadge')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
