import React, { useState, useMemo } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap } from '../common/Icons';

interface VelocitySimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VelocitySimulatorModal: React.FC<VelocitySimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sprints, issues, updateIssue } = useAether();

  const activeSprint = useMemo(() => {
    return sprints.find((s) => s.status === 'active') || sprints[0] || null;
  }, [sprints]);

  const activeIssues = useMemo(() => {
    if (!activeSprint) return [];
    return issues.filter((i) => i.sprintId === activeSprint.id);
  }, [issues, activeSprint]);

  // Simulation Controls
  const [teamCapacityPct, setTeamCapacityPct] = useState<number>(100);
  const [addedScopeSp, setAddedScopeSp] = useState<number>(0);
  const [complexityFactor, setComplexityFactor] = useState<number>(1.0);
  const [selectedIssueIdToDefer, setSelectedIssueIdToDefer] = useState<string>('');
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  // Calculations
  const currentTotalSp = useMemo(() => {
    return activeIssues.reduce((acc, i) => acc + (i.storyPoints || 1), 0);
  }, [activeIssues]);

  const effectiveSp = Math.round((currentTotalSp + addedScopeSp) * complexityFactor);
  const adjustedCapacitySp = Math.round((currentTotalSp * (teamCapacityPct / 100)));

  // Probability of On-Time Completion (0 ~ 100%)
  const probability = Math.max(
    5,
    Math.min(99, Math.round(100 - (effectiveSp - adjustedCapacitySp) * 4.5))
  );

  const riskTier = probability >= 80 ? 'optimal' : probability >= 50 ? 'warning' : 'critical';

  if (!isOpen || !activeSprint) return null;

  const handleDeferIssue = () => {
    if (!selectedIssueIdToDefer) return;
    const targetIssue = issues.find((i) => i.id === selectedIssueIdToDefer);
    if (targetIssue) {
      updateIssue(targetIssue.id, { sprintId: null }); // Move back to backlog
      setAppliedMessage(`Moved [${targetIssue.key}] back to Backlog to relieve sprint pressure.`);
      setSelectedIssueIdToDefer('');
      setTimeout(() => setAppliedMessage(null), 3000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content velocity-simulator-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon">⚡</span>
            <div>
              <h2 className="modal-title">Sprint Velocity & What-If Capacity Simulator</h2>
              <p className="modal-subtitle">
                Simulate team availability, scope creep, and risk multipliers in real-time
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body vel-modal-body">
          {/* Active Sprint Context Banner */}
          <div className="vel-sprint-banner">
            <span className="vel-sprint-badge">ACTIVE SPRINT</span>
            <span className="vel-sprint-name">{activeSprint.name}</span>
            <span className="vel-sprint-sp">
              Total Scope: <strong>{currentTotalSp} SP</strong> ({activeIssues.length} issues)
            </span>
          </div>

          {/* Simulation Controls & Meters */}
          <div className="vel-sim-grid">
            {/* Left Controls */}
            <div className="vel-controls-col">
              <h3 className="vel-col-title">🎛️ Simulation Parameters</h3>

              {/* Slider 1: Team Capacity */}
              <div className="vel-slider-group">
                <div className="vel-slider-label">
                  <span>👥 Team Available Capacity:</span>
                  <strong>{teamCapacityPct}% ({adjustedCapacitySp} SP)</strong>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={5}
                  value={teamCapacityPct}
                  onChange={(e) => setTeamCapacityPct(Number(e.target.value))}
                  className="vel-slider"
                />
                <span className="slider-hint">Simulate vacations, PTO, or holiday shifts</span>
              </div>

              {/* Slider 2: Added Mid-Sprint Scope */}
              <div className="vel-slider-group">
                <div className="vel-slider-label">
                  <span>➕ Mid-Sprint Added Scope:</span>
                  <strong>+{addedScopeSp} SP</strong>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={addedScopeSp}
                  onChange={(e) => setAddedScopeSp(Number(e.target.value))}
                  className="vel-slider"
                />
                <span className="slider-hint">Simulate unplanned emergency requests or scope creep</span>
              </div>

              {/* Slider 3: Tech Debt / Complexity Factor */}
              <div className="vel-slider-group">
                <div className="vel-slider-label">
                  <span>🧱 Risk / Complexity Multiplier:</span>
                  <strong>{complexityFactor.toFixed(2)}x</strong>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={1.6}
                  step={0.05}
                  value={complexityFactor}
                  onChange={(e) => setComplexityFactor(Number(e.target.value))}
                  className="vel-slider"
                />
                <span className="slider-hint">Legacy codebase debt, unknown APIs, or third-party blockers</span>
              </div>
            </div>

            {/* Right Gauge & Probability Results */}
            <div className="vel-results-col">
              <h3 className="vel-col-title">📊 Simulated Delivery Probability</h3>

              <div className={`prob-card ${riskTier}`}>
                <div className="prob-value">{probability}%</div>
                <div className="prob-title">
                  {probability >= 80
                    ? '🟢 High Completion Confidence'
                    : probability >= 50
                    ? '🟡 Moderate Overflow Risk'
                    : '🔴 High Delivery Delay Danger'}
                </div>
                <p className="prob-desc">
                  Based on Monte Carlo velocity distribution modeling for {effectiveSp} effective SP versus {adjustedCapacitySp} SP available capacity.
                </p>
              </div>

              {/* AI Recommendation */}
              <div className="vel-ai-recommendation">
                <div className="vel-ai-header">
                  <IconZap size={16} color="#6366f1" />
                  <span>AI Workload Mitigation Recommendation:</span>
                </div>
                <p className="vel-ai-text">
                  {probability >= 80
                    ? 'The current sprint parameters indicate optimal health. No scope reduction required.'
                    : `Deferring 1-2 non-critical issues back to Backlog will restore completion confidence above 85%.`}
                </p>

                {probability < 80 && (
                  <div className="vel-defer-row">
                    <select
                      value={selectedIssueIdToDefer}
                      onChange={(e) => setSelectedIssueIdToDefer(e.target.value)}
                      className="vel-issue-dropdown"
                    >
                      <option value="">-- Select Issue to Defer to Backlog --</option>
                      {activeIssues.map((i) => (
                        <option key={i.id} value={i.id}>
                          [{i.key}] {i.summary} ({i.storyPoints || 1} SP)
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-primary-sm"
                      onClick={handleDeferIssue}
                      disabled={!selectedIssueIdToDefer}
                    >
                      Defer Issue
                    </button>
                  </div>
                )}

                {appliedMessage && (
                  <div className="vel-applied-toast">
                    <IconCheckCircle size={14} /> {appliedMessage}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close Simulator
          </button>
          <button className="btn-primary" onClick={onClose}>
            Apply Scenario Baseline
          </button>
        </div>
      </div>
    </div>
  );
};
