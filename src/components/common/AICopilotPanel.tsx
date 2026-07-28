import React, { useEffect, useMemo, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import {
  generateAISpecs,
  analyzeSprintHealth,
  calculateWorkloadRebalance,
  generateDailyStandupDigest,
  type AISpecSuggestion
} from '../../services/aiCopilot';
import { IconX, IconZap, IconCheck } from './Icons';

export const AICopilotPanel: React.FC = () => {
  const { users, sprints, issues, selectedIssueId, updateIssue, addSubtask } = useAether();
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
      setFeedback('Generate할 이슈 요약을 먼저 입력해 주세요.');
      return;
    }
    const res = generateAISpecs(inputSummary);
    setAiResult(res);
    setFeedback('AI 제안이 생성되었습니다. 검토 후 적용할 수 있습니다.');
  };

  const handleApplyToIssue = () => {
    if (!selectedIssue || !aiResult) {
      setFeedback('적용할 열린 이슈를 먼저 선택해 주세요.');
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
        ? `${selectedIssue.key}에 스토리 포인트와 ${newSubtasks.length}개의 새 서브태스크를 반영했습니다.`
        : `${selectedIssue.key}의 스토리 포인트를 업데이트했고, 중복 없는 새 서브태스크는 없었습니다.`
    );
  };

  const handleApplyRebalance = (issueId: string, toUserId: string) => {
    updateIssue(issueId, { assigneeId: toUserId });
    const targetUser = users.find(user => user.id === toUserId);
    const movedIssue = issues.find(issue => issue.id === issueId);
    setFeedback(
      movedIssue && targetUser
        ? `${movedIssue.key}를 ${targetUser.name}에게 재할당했습니다.`
        : '이슈를 재할당했습니다.'
    );
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
              Sprint Health & Standup
            </button>
            <button
              className={`ai-tab ${activeTab === 'rebalance' ? 'active' : ''}`}
              onClick={() => setActiveTab('rebalance')}
            >
              Auto-Balancer ({workloadSuggestions.length})
            </button>
            <button
              className={`ai-tab ${activeTab === 'generator' ? 'active' : ''}`}
              onClick={() => setActiveTab('generator')}
            >
              Spec Generator
            </button>
          </div>

          <div className="ai-drawer-body">
            {feedback && <div className="ai-feedback-message">{feedback}</div>}

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

                <div className="ai-section-box standup-digest">
                  <h4>🎙️ Daily AI Standup & Digest</h4>
                  <p className="ai-pred-badge">{standupDigest.aiPrediction}</p>
                  
                  <div className="standup-subgroup">
                    <strong>In Progress:</strong>
                    <ul>
                      {standupDigest.inProgressToday.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {standupDigest.blockersDetected.length > 0 && (
                    <div className="standup-subgroup blockers">
                      <strong>⚠️ Blockers:</strong>
                      <ul>
                        {standupDigest.blockersDetected.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="ai-section-box">
                  <h4>⚠️ Identified Risks</h4>
                  <ul>
                    {healthData.risks.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="ai-section-box recommendations">
                  <h4>💡 Strategic AI Recommendations</h4>
                  <ul>
                    {healthData.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'rebalance' && (
              <div className="ai-rebalance-section">
                <p className="section-desc">
                  AI analyzes story points and active workload to propose optimal issue redistribution.
                </p>
                {workloadSuggestions.length === 0 ? (
                  <div className="empty-rebalance">
                    🎉 Workload is evenly balanced across team members!
                  </div>
                ) : (
                  <div className="rebalance-list">
                    {workloadSuggestions.map((sug, idx) => {
                      const targetUser = users.find(u => u.id === sug.toUserId);
                      return (
                        <div key={idx} className="rebalance-card">
                          <div className="rebalance-header">
                            <span className="issue-badge">{sug.issueKey}</span>
                            <span className="rebalance-title">{sug.issueSummary}</span>
                          </div>
                          <div className="rebalance-reason">{sug.reason}</div>
                          <div className="rebalance-action">
                            {targetUser && (
                              <button
                                className="btn-apply-rebalance"
                                onClick={() => handleApplyRebalance(sug.issueId, sug.toUserId)}
                              >
                                ⚡ Assign to {targetUser.name}
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

                    <button
                      className="btn-apply-ai"
                      onClick={handleApplyToIssue}
                      disabled={!selectedIssue}
                    >
                      {selectedIssue ? `Apply to ${selectedIssue.key}` : 'Open an issue to apply'}
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
