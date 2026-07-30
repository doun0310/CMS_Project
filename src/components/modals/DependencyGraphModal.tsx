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

  if (!isOpen) return null;

  const targetIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const dependencyNodes = [
    { id: 'n-1', name: 'Auth API Gateway', type: 'upstream', health: 'healthy', blastScore: 68 },
    { id: 'n-2', name: 'User Session DB Cluster', type: 'database', health: 'healthy', blastScore: 85 },
    { id: 'n-3', name: 'Billing Engine Payment Service', type: 'downstream', health: 'degraded', blastScore: 42 },
    { id: 'n-4', name: 'Mobile Push Notification Microservice', type: 'downstream', health: 'healthy', blastScore: 24 },
  ];

  const handleAttachGraphBadge = () => {
    if (!targetIssue) return;
    const currentDesc = targetIssue.description || '';
    const badgeMarkdown = `\n\n### AI Dependency & Blast Radius Diagnosis
- **Upstream Subsystem:** Auth API Gateway
- **Blast Radius Index:** 68% (High Subsystem Coupling)
- **Affected Services:** Billing Engine, User Session DB, Mobile Push
- **Canary Flag Recommended:** \`FF_AUTH_CANARY_V2\``;

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
            <label>Select Target Issue:</label>
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
              <span className="blast-val">68%</span>
              <span className="blast-lbl">Blast Radius Index</span>
            </div>
            <div className="blast-meta">
              <span className="blast-title">High Subsystem Coupling Detected</span>
              <p className="blast-desc">
                Modifying <strong>{targetIssue?.component || 'Auth API'}</strong> impacts 3 downstream microservices & 8 active sprint tickets. Canary deployment recommended.
              </p>
            </div>
          </div>

          {/* Subsystem Dependency Nodes Grid */}
          <div className="dep-nodes-section">
            <h3>Linked Subsystem Nodes & Risk Scores</h3>

            <div className="dep-nodes-grid">
              {dependencyNodes.map((node) => (
                <div key={node.id} className="dep-node-card">
                  <div className="node-top">
                    <span className="node-name">{node.name}</span>
                    <span className={`node-type-badge ${node.type}`}>{node.type.toUpperCase()}</span>
                  </div>
                  <div className="node-bottom">
                    <span className="node-health">Health: {node.health}</span>
                    <span className="node-blast">Impact Score: {node.blastScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={handleAttachGraphBadge}
            disabled={attachedSuccess}
          >
            {attachedSuccess ? (
              <>
                <IconCheckCircle /> Attached Blast Badge to Ticket!
              </>
            ) : (
              <>
                <IconZap /> Attach Dependency Badge to Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
