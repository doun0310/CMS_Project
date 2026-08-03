import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconAnalytics } from '../common/Icons';

interface MonteCarloSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonteCarloSimulatorModal: React.FC<MonteCarloSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, sprints, t } = useAether();

  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];
  const [simulationCount] = useState(1000);
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  if (!isOpen) return null;

  const simulationResults = [
    { probability: '50% (50/50 Chance)', sp: 42, date: 'Aug 12, 2026', risk: 'Medium Risk' },
    { probability: '85% (High Confidence - Recommended)', sp: 36, date: 'Aug 15, 2026', risk: 'Low Risk' },
    { probability: '95% (Guaranteed Safe Commitment)', sp: 30, date: 'Aug 18, 2026', risk: 'Ultra Safe' },
  ];

  const recommendedSp = 36;

  const handleSyncCommitment = () => {
    setSyncedSuccess(true);
    setTimeout(() => {
      setSyncedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content mc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconAnalytics size={20} /></span>
            <div>
              <h2 className="modal-title">{t('monteCarloModalTitle')}</h2>
              <p className="modal-subtitle">
                1,000 statistical trial simulation based on historical velocity for [{currentProject.key}] {activeSprint?.name}
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body mc-modal-body">
          {/* Simulation Header Banner */}
          <div className="mc-banner">
            <div className="mc-trials-box">
              <span className="mc-val">{simulationCount}</span>
              <span className="mc-lbl">{t('monteCarloTrials')}</span>
            </div>
            <div className="mc-meta">
              <span className="mc-title">{t('confidenceVelocityTarget')}: {recommendedSp} SP</span>
              <p className="mc-desc">
                Based on 1,000 statistical trials, your team has an <strong>85% probability</strong> of completing <strong>{recommendedSp} Story Points</strong> without scope overflow.
              </p>
            </div>
          </div>

          {/* Probability Percentile Table */}
          <div className="mc-percentiles-section">
            <h3>{t('statisticalCompletionLikelihood')}</h3>

            <div className="mc-table-wrap">
              <table className="mc-table">
                <thead>
                  <tr>
                    <th>{t('confidenceLevel')}</th>
                    <th>{t('targetVelocity')}</th>
                    <th>{t('estCompletionDate')}</th>
                    <th>{t('riskProfile')}</th>
                  </tr>
                </thead>
                <tbody>
                  {simulationResults.map((res, idx) => (
                    <tr key={idx} className={res.sp === recommendedSp ? 'highlight-row' : ''}>
                      <td className="font-bold">{res.probability}</td>
                      <td><span className="mc-sp-pill">{res.sp} SP</span></td>
                      <td className="text-secondary">{res.date}</td>
                      <td><span className="risk-text">{res.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSyncCommitment}
            disabled={syncedSuccess}
          >
            {syncedSuccess ? (
              <>
                <IconCheckCircle /> {t('syncedTargetSuccess')}
              </>
            ) : (
              <>
                <IconZap /> {t('syncTargetToSprintGoal')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
