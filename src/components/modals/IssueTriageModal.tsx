import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap } from '../common/Icons';

interface IssueTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IssueTriageModal: React.FC<IssueTriageModalProps> = ({ isOpen, onClose }) => {
  const { issues, updateIssue, t } = useAether();

  const untriagedIssues = issues.filter((i) => i.status === 'todo' || i.priority === 'medium');
  const [selectedIssueId, setSelectedIssueId] = useState<string>(untriagedIssues[0]?.id || issues[0]?.id || '');
  const [triagedSuccess, setTriagedSuccess] = useState(false);

  if (!isOpen) return null;

  const targetIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const aiTriageRecommendation = {
    suggestedPriority: targetIssue?.type === 'bug' ? 'highest' : 'high',
    suggestedComponent: targetIssue?.summary?.toLowerCase().includes('auth') ? 'Auth API Subsystem' : 'UI Core Platform',
    suggestedStoryPoints: targetIssue?.type === 'bug' ? 5 : 3,
    suggestedLabels: ['#ai-triaged', '#high-priority', targetIssue?.type === 'bug' ? '#bug-fix' : '#feature-enhancement'],
    confidenceScore: 97,
  };

  const handleApplyTriage = () => {
    if (!targetIssue) return;
    updateIssue(targetIssue.id, {
      priority: aiTriageRecommendation.suggestedPriority as any,
      component: aiTriageRecommendation.suggestedComponent,
      storyPoints: aiTriageRecommendation.suggestedStoryPoints,
    });
    setTriagedSuccess(true);
    setTimeout(() => {
      setTriagedSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content triage-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon">📥</span>
            <div>
              <h2 className="modal-title">{t('autoTriageModalTitle')}</h2>
              <p className="modal-subtitle">
                Automated priority scoring, subsystem tagging & story point estimation for untriaged backlog
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body triage-modal-body">
          {/* Target Issue Selector */}
          <div className="triage-issue-select-row">
            <label>Select Untriaged Issue:</label>
            <select
              value={selectedIssueId}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="triage-select"
            >
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.key}] {i.summary} (Priority: {i.priority.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Issue Raw Summary Box */}
          <div className="triage-summary-box">
            <div className="triage-box-header">
              <span className="triage-box-key">[{targetIssue?.key}]</span>
              <span className="triage-box-type">{targetIssue?.type.toUpperCase()}</span>
            </div>
            <p className="triage-box-text">{targetIssue?.summary}</p>
          </div>

          {/* AI Triage Recommendation Matrix Card */}
          <div className="ai-triage-card">
            <div className="triage-card-header">
              <div className="flex-align-gap">
                <IconZap size={18} color="#6366f1" />
                <span className="font-bold">🤖 AI Auto-Triage Diagnosis</span>
              </div>
              <span className="triage-confidence">Confidence: {aiTriageRecommendation.confidenceScore}%</span>
            </div>

            <div className="triage-matrix-grid">
              <div className="triage-matrix-item">
                <span className="matrix-lbl">Suggested Priority</span>
                <span className="matrix-val red-text">{aiTriageRecommendation.suggestedPriority.toUpperCase()}</span>
              </div>

              <div className="triage-matrix-item">
                <span className="matrix-lbl">Suggested Component</span>
                <span className="matrix-val blue-text">{aiTriageRecommendation.suggestedComponent}</span>
              </div>

              <div className="triage-matrix-item">
                <span className="matrix-lbl">Suggested Estimate</span>
                <span className="matrix-val green-text">{aiTriageRecommendation.suggestedStoryPoints} Story Points</span>
              </div>
            </div>

            <div className="triage-labels-row">
              <span className="labels-lbl">Recommended Labels:</span>
              <div className="labels-flex">
                {aiTriageRecommendation.suggestedLabels.map((lbl, idx) => (
                  <span key={idx} className="triage-tag-chip">
                    {lbl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            onClick={handleApplyTriage}
            disabled={triagedSuccess}
          >
            {triagedSuccess ? (
              <>
                <IconCheckCircle /> Applied Triage Recommendations!
              </>
            ) : (
              <>
                ⚡ Apply AI Triage & Promote to Backlog
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
