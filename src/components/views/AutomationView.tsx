import React, { useState } from 'react';
import { useAether } from '../../context/AetherContext';
import { IconAutomation, IconPlay, IconPlus, IconCheck } from '../common/Icons';

export const AutomationView: React.FC = () => {
  const {
    automationRules,
    automationAuditLogs,
    toggleAutomationRule,
    addAutomationRule,
    runAutomationRule
  } = useAether();

  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [triggerWhen, setTriggerWhen] = useState('Status moves to IN REVIEW');
  const [actionThen, setActionThen] = useState('Auto-assign QA Engineer & Add #needs-qa tag');

  const handleRunRule = (ruleId: string, ruleName: string) => {
    runAutomationRule(ruleId);
    setTestNotification(`⚡ Automation Triggered: "${ruleName}" executed successfully! Audit log recorded.`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  const handleCreateRuleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ruleName.trim()) return;
    addAutomationRule(ruleName.trim(), triggerWhen, actionThen);
    setRuleName('');
    setIsCreatingRule(false);
    setTestNotification(`✨ Created new automation rule: "${ruleName.trim()}"`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  return (
    <div className="automation-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2>⚡ Visual Automation Engine & Rule Simulator</h2>
          <p className="subtext">
            Build custom Trigger-Condition-Action workflows and simulate real-time automated execution.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setIsCreatingRule(!isCreatingRule)}>
          <IconPlus size={16} /> Create Automation Rule
        </button>
      </div>

      {testNotification && (
        <div className="alert-banner animate-fade-in">
          <span>{testNotification}</span>
        </div>
      )}

      {/* Interactive New Rule Builder Form */}
      {isCreatingRule && (
        <form onSubmit={handleCreateRuleSubmit} className="automation-builder-card animate-fade-in">
          <h3>🛠️ Custom Automation Rule Builder</h3>
          
          <div className="builder-grid">
            <div className="form-group">
              <label>Rule Name:</label>
              <input
                type="text"
                placeholder="e.g. Auto-tag High Priority Bugs"
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>WHEN (Trigger Event):</label>
              <select value={triggerWhen} onChange={e => setTriggerWhen(e.target.value)}>
                <option value="Status moves to IN REVIEW">Status moves to IN REVIEW</option>
                <option value="Issue Created as BUG">Issue Created as BUG</option>
                <option value="Priority set to HIGHEST">Priority set to HIGHEST</option>
                <option value="Story Points > 8">Story Points &gt; 8</option>
                <option value="All Subtasks Completed">All Subtasks Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>THEN (Action to Execute):</label>
              <select value={actionThen} onChange={e => setActionThen(e.target.value)}>
                <option value="Auto-assign QA Engineer & Add #needs-qa tag">Auto-assign QA Engineer & Add #needs-qa tag</option>
                <option value="Send High Priority Alert to Team Slack">Send High Priority Alert to Team Slack</option>
                <option value="Add #heavy-task label & Notify Tech Lead">Add #heavy-task label & Notify Tech Lead</option>
                <option value="Move Issue Status to DONE automatically">Move Issue Status to DONE automatically</option>
              </select>
            </div>
          </div>

          <div className="builder-actions">
            <button type="submit" className="btn-success-sm">Save & Enable Rule</button>
            <button type="button" className="btn-ghost-sm" onClick={() => setIsCreatingRule(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="automation-layout-grid">
        {/* Rules List */}
        <div className="rules-section">
          <h3>Active Workflow Rules ({automationRules.length})</h3>
          <div className="rules-list">
            {automationRules.map(rule => (
              <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                <div className="rule-info">
                  <div className="rule-title-row">
                    <IconAutomation size={20} className="rule-icon" />
                    <span className="rule-name">{rule.name}</span>
                    <span className="exec-count-badge">Runs: {rule.executionCount || 0}</span>
                  </div>

                  <div className="rule-flow">
                    <div className="flow-step trigger">
                      <span className="step-label">WHEN:</span> {rule.trigger}
                    </div>
                    <div className="flow-step action">
                      <span className="step-label">THEN:</span> {rule.action}
                    </div>
                  </div>
                </div>

                <div className="rule-controls">
                  <button className="btn-test-rule" onClick={() => handleRunRule(rule.id, rule.name)}>
                    <IconPlay size={14} /> Run Rule
                  </button>

                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleAutomationRule(rule.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Audit Log Panel */}
        <div className="audit-logs-section">
          <h3>📜 Live Execution Audit Logs</h3>
          <div className="audit-logs-list">
            {automationAuditLogs.map(log => (
              <div key={log.id} className="audit-log-card animate-fade-in">
                <div className="log-header">
                  <span className="log-status-badge"><IconCheck size={12} /> {log.status}</span>
                  <span className="log-time">{log.triggeredAt}</span>
                </div>
                <div className="log-rule-name">{log.ruleName}</div>
                <div className="log-target">Target: <span className="issue-badge">{log.targetIssueKey}</span></div>
                <div className="log-action">{log.actionTaken}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
