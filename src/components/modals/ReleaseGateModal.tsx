import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconTarget } from '../common/Icons';

interface ReleaseGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseGateModal: React.FC<ReleaseGateModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, sprints, issues, users, t } = useAether();

  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];
  const sprintIssues = issues.filter((i) => i.sprintId === activeSprint?.id);
  const openBlockers = sprintIssues.filter((i) => i.priority === 'highest' && i.status !== 'done');

  const [signoffs, setSignoffs] = useState({
    engLead: true,
    qaLead: true,
    securityOfficer: false,
    productManager: true,
  });

  const [signedOff, setSignedOff] = useState(false);

  if (!isOpen) return null;

  const allApproved = signoffs.engLead && signoffs.qaLead && signoffs.securityOfficer && signoffs.productManager;
  const readinessScore = openBlockers.length === 0 ? (allApproved ? 98 : 82) : 45;
  const decisionClass = readinessScore >= 90 ? 'go' : 'nogo';

  const toggleSignoff = (role: keyof typeof signoffs) => {
    setSignoffs((prev) => ({ ...prev, [role]: !prev[role] }));
  };

  const handleExecuteRelease = () => {
    setSignedOff(true);
    setTimeout(() => {
      setSignedOff(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content release-gate-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconTarget size={20} /></span>
            <div>
              <h2 className="modal-title">{t('releaseGateModalTitle')}</h2>
              <p className="modal-subtitle">
                Formal stakeholder signoff & compliance audit gate for [{currentProject.key}] {activeSprint?.name}
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body gate-modal-body">
          {/* AI Decision Recommendation Banner */}
          <div className={`gate-recommendation-card ${decisionClass}`}>
            <div className="rec-header">
              <span className="rec-title">AI Release Readiness Score: {readinessScore}%</span>
              <span className={`rec-badge ${decisionClass}`}>
                {decisionClass === 'go' ? 'GO FOR PRODUCTION RELEASE' : 'NO-GO: HOLD RELEASE'}
              </span>
            </div>
            <p className="rec-text">
              {decisionClass === 'go'
                ? 'All 4 stakeholder signoffs passed. 0 highest-priority blocker issues remaining. CI/CD pipeline tests passed at 98%.'
                : 'Release hold recommended: Security & Compliance Officer signoff is still pending.'}
            </p>
          </div>

          {/* Stakeholder Approval Checklist */}
          <div className="signoff-section">
            <h3>Stakeholder Approval Signoffs</h3>

            <div className="signoff-grid">
              <div
                className={`signoff-card ${signoffs.engLead ? 'approved' : 'pending'}`}
                onClick={() => toggleSignoff('engLead')}
              >
                <div className="signoff-role">Engineering Lead</div>
                <div className="signoff-user">{users[0]?.name || 'Alex Rivera'}</div>
                <div className="signoff-status">
                  {signoffs.engLead ? 'Approved' : 'Pending Signoff'}
                </div>
              </div>

              <div
                className={`signoff-card ${signoffs.qaLead ? 'approved' : 'pending'}`}
                onClick={() => toggleSignoff('qaLead')}
              >
                <div className="signoff-role">QA & Test Manager</div>
                <div className="signoff-user">{users[1]?.name || 'Sarah Chen'}</div>
                <div className="signoff-status">
                  {signoffs.qaLead ? 'Approved' : 'Pending Signoff'}
                </div>
              </div>

              <div
                className={`signoff-card ${signoffs.securityOfficer ? 'approved' : 'pending'}`}
                onClick={() => toggleSignoff('securityOfficer')}
              >
                <div className="signoff-role">Security & Compliance Officer</div>
                <div className="signoff-user">{users[2]?.name || 'Marcus Vance'}</div>
                <div className="signoff-status">
                  {signoffs.securityOfficer ? 'Approved' : 'Pending Signoff'}
                </div>
              </div>

              <div
                className={`signoff-card ${signoffs.productManager ? 'approved' : 'pending'}`}
                onClick={() => toggleSignoff('productManager')}
              >
                <div className="signoff-role">Product Manager</div>
                <div className="signoff-user">{users[0]?.name || 'Elena Rostova'}</div>
                <div className="signoff-status">
                  {signoffs.productManager ? 'Approved' : 'Pending Signoff'}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Quality Audit Metrics */}
          <div className="gate-audit-summary">
            <div className="audit-row">
              <span>Blocker Issues Remaining:</span>
              <strong className={openBlockers.length === 0 ? 'text-green' : 'text-red'}>
                {openBlockers.length} {openBlockers.length === 0 ? ' (Clean Pass)' : ' Blockers'}
              </strong>
            </div>
            <div className="audit-row">
              <span>Automated Test Pass Rate:</span>
              <strong className="text-green">98.4% (142 / 144 Passed)</strong>
            </div>
            <div className="audit-row">
              <span>Security Vulnerability Audit:</span>
              <strong className="text-indigo">0 Critical, 0 High Vulnerabilities</strong>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={handleExecuteRelease}
            disabled={!allApproved || signedOff}
          >
            {signedOff ? (
              <>
                <IconCheckCircle /> Release Certified & Signed Off!
              </>
            ) : (
              <>
                Execute Official Production Signoff
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
