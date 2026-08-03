import React, { useEffect, useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import {
  generateAISpecs,
  analyzeSprintHealth,
  calculateWorkloadRebalance,
  generateDailyStandupDigest,
  type AISpecSuggestion
} from '../../services/aiCopilot';

export const AICopilotPanel: React.FC = () => {
  const { users, sprints, issues, selectedIssueId, updateIssue, addSubtask, t } = useAether();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'advisor' | 'rebalance' | 'generator'>('advisor');
  const [feedback, setFeedback] = useState<string | null>(null);

  // AI Generator state
  const [inputSummary, setInputSummary] = useState('');
  const [aiResult, setAiResult] = useState<AISpecSuggestion | null>(null);

  const activeSprint = sprints.find(s => s.status === 'active') || sprints[0];
  const healthData = activeSprint ? analyzeSprintHealth(activeSprint, issues) : null;
  const workloadSuggestions = calculateWorkloadRebalance(users, issues);
  const standupDigest = generateDailyStandupDigest(issues);
  const selectedIssue = useMemo(
    () => issues.find(issue => issue.id === selectedIssueId) ?? null,
    [issues, selectedIssueId]
  );

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => setFeedback(null), 2600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  const handleGenerate = () => {
    if (!inputSummary.trim()) {
      setFeedback(t('aiEnterSummary'));
      return;
    }
    const res = generateAISpecs(inputSummary);
    setAiResult(res);
    setFeedback(t('aiProposalGenerated'));
  };

  const handleApplyToIssue = () => {
    if (!selectedIssue || !aiResult) {
      setFeedback(t('aiSelectOpenIssue'));
      return;
    }

    const existingSubtaskTitles = new Set(
      selectedIssue.subtasks.map(subtask => subtask.title.trim().toLowerCase())
    );
    const newSubtasks = aiResult.suggestedSubtasks.filter(
      subtask => !existingSubtaskTitles.has(subtask.trim().toLowerCase())
    );

    updateIssue(selectedIssue.id, { storyPoints: aiResult.suggestedPoints });
    newSubtasks.forEach(subtask => {
      addSubtask(selectedIssue.id, subtask);
    });

    setFeedback(
      newSubtasks.length > 0
        ? `${selectedIssue.key} + ${newSubtasks.length} subtasks (${aiResult.suggestedPoints} pts)`
        : `${selectedIssue.key} -> ${aiResult.suggestedPoints} pts`
    );
  };

  const handleApplyRebalance = (issueId: string, toUserId: string) => {
    updateIssue(issueId, { assigneeId: toUserId });
    const targetUser = users.find(user => user.id === toUserId);
    const movedIssue = issues.find(issue => issue.id === issueId);
    setFeedback(
      movedIssue && targetUser
        ? `${movedIssue.key} -> ${targetUser.name}`
        : t('aiReassignedSuccess')
    );
  };

  const renderLocalizedItem = (
    item: string | { key: string; params?: Record<string, string | number>; rawText: string }
  ) => {
    if (typeof item === 'string') return item;
    let text = t(item.key as any);
    if (item.params) {
      Object.entries(item.params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text || item.rawText;
  };

  const renderReason = (sug: typeof workloadSuggestions[0]) => {
    if (sug.reasonKey) {
      let text = t(sug.reasonKey as any);
      if (sug.reasonParams) {
        Object.entries(sug.reasonParams).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text || sug.reason;
    }
    return sug.reason;
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        className="ai-copilot-trigger animate-fade-in"
        onClick={() => setIsOpen(!isOpen)}
        title={t('copilotTitle')}
      >
        <span className="trigger-label">{t('copilotTitle')}</span>
      </button>

      {/* Drawer Panel */}
      {isOpen && (
        <div className="ai-copilot-drawer animate-slide-in">
          <div className="ai-drawer-header">
            <div className="header-title">
              <span>{t('copilotHeaderTitle')}</span>
            </div>
            <button className="btn-text-close" onClick={() => setIsOpen(false)} title="Close">
              ✕
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="ai-tabs">
            <button
              className={`ai-tab ${activeTab === 'advisor' ? 'active' : ''}`}
              onClick={() => setActiveTab('advisor')}
            >
              {t('copilotTabHealth')}
            </button>
            <button
              className={`ai-tab ${activeTab === 'rebalance' ? 'active' : ''}`}
              onClick={() => setActiveTab('rebalance')}
            >
              {t('copilotTabRebalance')} ({workloadSuggestions.length})
            </button>
            <button
              className={`ai-tab ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveTab('generator')}
            >
              {t('copilotTabGenerator')}
            </button>
          </div>

          <div className="ai-drawer-body">
            {feedback && <div className="ai-feedback-message">{feedback}</div>}

            {/* Screen 1: Sprint Health & Standup Advisor */}
            {activeTab === 'advisor' && healthData && (
              <div className="ai-advisor-section animate-fade-in">
                <div className="health-score-card">
                  <div className="score-circle">
                    <span className="score-num">{healthData.healthScore}%</span>
                  </div>
                  <div className="health-score-info">
                    <div className="health-title-row">
                      <span className="health-title">{t('copilotHealthIndex')}</span>
                      <span className="health-status-tag">
                        {healthData.healthScore >= 80 ? 'Optimal' : healthData.healthScore >= 60 ? 'Warning' : 'Critical'}
                      </span>
                    </div>
                    <div className="health-sub">
                      {activeSprint?.name} · {healthData.blockersCount} {t('copilotBlockersUnresolved')}
                    </div>
                  </div>
                </div>

                <div className="ai-section-box standup-digest">
                  <div className="section-box-header">
                    <h4>{t('copilotDailyStandupDigest')}</h4>
                  </div>
                  <div className="ai-pred-badge-box">
                    <div className="ai-pred-badge">
                      {standupDigest.aiPredictionKey ? t(standupDigest.aiPredictionKey) : standupDigest.aiPrediction}
                    </div>
                  </div>

                  <div className="standup-subgroup">
                    <div className="subgroup-title">{t('copilotInProgressToday')}</div>
                    <ul className="clean-list">
                      {standupDigest.inProgressToday.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {standupDigest.blockersDetected.length > 0 && (
                    <div className="standup-subgroup blockers">
                      <div className="subgroup-title text-red">{t('blocked')}:</div>
                      <ul className="clean-list">
                        {standupDigest.blockersDetected.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="ai-section-box risks-box">
                  <div className="section-box-header">
                    <h4>{t('copilotIdentifiedRisks')}</h4>
                  </div>
                  <ul className="clean-list risk-list">
                    {healthData.risks.map((r, idx) => (
                      <li key={idx}>{renderLocalizedItem(r)}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-section-box recommendations-box">
                  <div className="section-box-header">
                    <h4>{t('copilotStrategicRecs')}</h4>
                  </div>
                  <ul className="clean-list rec-list">
                    {healthData.recommendations.map((rec, idx) => (
                      <li key={idx}>{renderLocalizedItem(rec)}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Screen 2: Auto-Balancer */}
            {activeTab === 'rebalance' && (
              <div className="ai-rebalance-section animate-fade-in">
                <p className="section-desc">
                  {t('copilotRebalanceDesc')}
                </p>
                {workloadSuggestions.length === 0 ? (
                  <div className="empty-rebalance-card">
                    <div className="empty-title">{t('copilotRebalanceBalanced')}</div>
                  </div>
                ) : (
                  <div className="rebalance-list">
                    {workloadSuggestions.map((sug, idx) => {
                      const targetUser = users.find(u => u.id === sug.toUserId);
                      return (
                        <div key={idx} className="rebalance-card">
                          <div className="rebalance-header">
                            <span className="issue-badge font-mono">{sug.issueKey}</span>
                            <span className="rebalance-title">{sug.issueSummary}</span>
                          </div>
                          <div className="rebalance-reason">{renderReason(sug)}</div>
                          <div className="rebalance-action">
                            {targetUser && (
                              <button
                                className="btn-apply-rebalance"
                                onClick={() => handleApplyRebalance(sug.issueId, sug.toUserId)}
                              >
                                {targetUser.name} {t('copilotAssignTo')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Screen 3: Spec Generator */}
            {activeTab === 'generator' && (
              <div className="ai-generator-section animate-fade-in">
                {/* Target Issue Context Banner */}
                <div className="target-issue-banner">
                  <div className="target-banner-label">{t('copilotTargetIssue')}</div>
                  {selectedIssue ? (
                    <div className="target-issue-active">
                      <span className="issue-badge font-mono">{selectedIssue.key}</span>
                      <span className="target-issue-summary">{selectedIssue.summary}</span>
                    </div>
                  ) : (
                    <div className="target-issue-none">
                      {t('copilotNoTargetIssue')}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="input-label">{t('copilotSummaryLabel')}</label>

                  {/* Preset Chips */}
                  <div className="preset-chips-row">
                    <span className="preset-label">{t('copilotQuickPresets')}</span>
                    <button
                      className="preset-chip"
                      onClick={() => {
                        const val = t('copilotPresetOAuth');
                        setInputSummary(val);
                        setAiResult(generateAISpecs(val));
                      }}
                    >
                      {t('copilotPresetOAuth')}
                    </button>
                    <button
                      className="preset-chip"
                      onClick={() => {
                        const val = t('copilotPresetGraphQL');
                        setInputSummary(val);
                        setAiResult(generateAISpecs(val));
                      }}
                    >
                      {t('copilotPresetGraphQL')}
                    </button>
                    <button
                      className="preset-chip"
                      onClick={() => {
                        const val = t('copilotPresetSla');
                        setInputSummary(val);
                        setAiResult(generateAISpecs(val));
                      }}
                    >
                      {t('copilotPresetSla')}
                    </button>
                  </div>

                  <input
                    type="text"
                    className="spec-input"
                    placeholder={t('copilotSummaryPlaceholder')}
                    value={inputSummary}
                    onChange={e => setInputSummary(e.target.value)}
                  />
                  <button className="btn-ai-generate" onClick={handleGenerate}>
                    {t('copilotGenerateBtn')}
                  </button>
                </div>

                {aiResult && (
                  <div className="ai-result-box animate-fade-in">
                    <div className="ai-result-header">
                      <div className="ai-meta-row">
                        <span className="ai-badge points">
                          {aiResult.suggestedPoints} Story Points
                        </span>
                        <span className={`ai-badge risk risk-${aiResult.riskRating.toLowerCase()}`}>
                          Risk: {aiResult.riskRating}
                        </span>
                      </div>
                      {aiResult.reasoning && (
                        <div className="ai-reasoning-text">{aiResult.reasoning}</div>
                      )}
                    </div>

                    <div className="result-section">
                      <h5>{t('copilotAcceptanceCriteria')}</h5>
                      <div className="ac-cards-container">
                        {aiResult.acceptanceCriteria.map((ac, idx) => (
                          <div key={idx} className="ac-card-item">
                            <span className="ac-num-badge">0{idx + 1}</span>
                            <div className="ac-content">{ac}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="result-section">
                      <h5>{t('copilotSuggestedSubtasks')}</h5>
                      <ul className="subtask-chip-list">
                        {aiResult.suggestedSubtasks.map((st, idx) => (
                          <li key={idx} className="subtask-chip">
                            <span className="subtask-bullet">•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className="btn-apply-ai"
                      onClick={handleApplyToIssue}
                      disabled={!selectedIssue}
                    >
                      {selectedIssue ? `${selectedIssue.key} ${t('copilotApplyTo')}` : t('copilotOpenIssueToApply')}
                    </button>
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
