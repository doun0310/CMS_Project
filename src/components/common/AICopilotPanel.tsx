import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';
import { generateAISpecs, analyzeSprintHealth, type AISpecSuggestion } from '../../services/aiCopilot';
import { IconX, IconZap, IconCheck } from './Icons';

export const AICopilotPanel: React.FC = () => {
  const { sprints, issues, selectedIssueId, updateIssue, addSubtask } = useJira();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'advisor' | 'generator'>('advisor');

  // AI Generator state
  const [inputSummary, setInputSummary] = useState('');
  const [aiResult, setAiResult] = useState<AISpecSuggestion | null>(null);

  const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
  const healthData = activeSprint ? analyzeSprintHealth(activeSprint, issues) : null;

  const handleGenerate = () => {
    if (!inputSummary.trim()) return;
    const res = generateAISpecs(inputSummary);
    setAiResult(res);
  };

  const handleApplyToIssue = () => {
    if (!selectedIssueId || !aiResult) return;
    // Apply story points
    updateIssue(selectedIssueId, { storyPoints: aiResult.suggestedPoints });
    // Add subtasks
    aiResult.suggestedSubtasks.forEach(st => {
      addSubtask(selectedIssueId, st);
    });
    alert(`✨ Applied AI Story Points (${aiResult.suggestedPoints} pts) and ${aiResult.suggestedSubtasks.length} Sub-tasks to selected issue!`);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="ai-copilot-trigger animate-fade-in"
        onClick={() => setIsOpen(!isOpen)}
        title="Aether AI Copilot Assistant"
      >
        <span className="sparkle-icon">✨</span>
        <span className="trigger-label">Aether AI Copilot</span>
      </button>

      {/* Drawer Panel */}
      {isOpen && (
        <div className="ai-copilot-drawer animate-slide-in">
          <div className="ai-drawer-header">
            <div className="header-title">
              <span className="sparkle-icon">✨</span>
              <span>Aether AI Intelligence</span>
            </div>
            <button className="btn-icon-close" onClick={() => setIsOpen(false)}>
              <IconX size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="ai-tabs">
            <button
              className={`ai-tab ${activeTab === 'advisor' ? 'active' : ''}`}
              onClick={() => setActiveTab('advisor')}
            >
              Sprint Health & Risks
            </button>
            <button
              className={`ai-tab ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveTab('generator')}
            >
              Spec & Subtask Generator
            </button>
          </div>

          <div className="ai-drawer-body">
            {activeTab === 'advisor' && healthData && (
              <div className="ai-advisor-section">
                <div className="health-score-card">
                  <div className="score-circle">
                    <span className="score-num">{healthData.healthScore}%</span>
                  </div>
                  <div>
                    <div className="health-title">Sprint Health Index</div>
                    <div className="health-sub">
                      {activeSprint?.name} • {healthData.blockersCount} Blockers Unresolved
                    </div>
                  </div>
                </div>

                <div className="ai-section-box">
                  <h4>⚠️ Identified Risks & Bottlenecks</h4>
                  <ul>
                    {healthData.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-section-box recommendations">
                  <h4>💡 AI Strategic Recommendations</h4>
                  <ul>
                    {healthData.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'generator' && (
              <div className="ai-generator-section">
                <div className="form-group">
                  <label>Issue Summary or Scope:</label>
                  <input
                    type="text"
                    placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
                    value={inputSummary}
                    onChange={e => setInputSummary(e.target.value)}
                  />
                  <button className="btn-ai-generate" onClick={handleGenerate}>
                    <IconZap size={16} /> Generate AI Specifications
                  </button>
                </div>

                {aiResult && (
                  <div className="ai-result-box animate-fade-in">
                    <div className="ai-meta-row">
                      <span className="ai-badge points">Points: {aiResult.suggestedPoints} pts</span>
                      <span className={`ai-badge risk risk-${aiResult.riskRating.toLowerCase()}`}>
                        Risk: {aiResult.riskRating}
                      </span>
                    </div>

                    <h4>Acceptance Criteria:</h4>
                    <ul className="ac-list">
                      {aiResult.acceptanceCriteria.map((ac, idx) => (
                        <li key={idx}>{ac}</li>
                      ))}
                    </ul>

                    <h4>Suggested Sub-tasks:</h4>
                    <ul className="sub-list">
                      {aiResult.suggestedSubtasks.map((st, idx) => (
                        <li key={idx}><IconCheck size={12} /> {st}</li>
                      ))}
                    </ul>

                    {selectedIssueId && (
                      <button className="btn-apply-ai" onClick={handleApplyToIssue}>
                        Apply to Open Issue
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
