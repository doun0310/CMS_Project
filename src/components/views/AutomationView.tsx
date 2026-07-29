import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconAutomation, IconPlay, IconPlus, IconCheck, IconX } from '../common/Icons';

export const AutomationView: React.FC = () => {
  const {
    automationRules,
    automationAuditLogs,
    toggleAutomationRule,
    addAutomationRule,
    deleteAutomationRule,
    runAutomationRule,
    t
  } = useAether();

  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [triggerWhen, setTriggerWhen] = useState('Status moves to IN REVIEW');
  const [actionThen, setActionThen] = useState('Auto-assign QA Engineer & Add #needs-qa tag');

  const handleRunRule = (ruleId: string, ruleName: string) => {
    runAutomationRule(ruleId);
    setTestNotification(`⚡ ${t('automationTriggered')}: "${ruleName}" ${t('executedSuccessfully')}`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  const handleCreateRuleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!ruleName.trim()) return;
    addAutomationRule(ruleName.trim(), triggerWhen, actionThen);
    setRuleName('');
    setIsCreatingRule(false);
    setTestNotification(`✨ ${t('createdAutomationRule')}: "${ruleName.trim()}"`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  const handleDeleteRule = (ruleId: string, ruleName: string) => {
    if (!window.confirm(`${t('deleteAutomationRuleConfirm')}\n\n${ruleName}`)) return;
    deleteAutomationRule(ruleId);
    setTestNotification(`${t('automationRuleDeleted')}: "${ruleName}"`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  return (
    <div className="automation-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2 className="view-title-with-icon"><IconAutomation size={20} /> {t('automationTitle')}</h2>
        </div>
        <button className="btn-primary" onClick={() => setIsCreatingRule(!isCreatingRule)}>
          <IconPlus size={16} /> {t('createAutomationRule')}
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
          <h3>🛠️ {t('customAutomationBuilder')}</h3>

          <div className="builder-grid">
            <div className="form-group">
              <label>{t('ruleName')}:</label>
              <input
                type="text"
                placeholder={t('ruleNamePlaceholder')}
                value={ruleName}
                onChange={e => setRuleName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('whenTriggerEvent')}:</label>
              <select value={triggerWhen} onChange={e => setTriggerWhen(e.target.value)}>
                <option value="Status moves to IN REVIEW">Status moves to IN REVIEW</option>
                <option value="Issue Created as BUG">Issue Created as BUG</option>
                <option value="Priority set to HIGHEST">Priority set to HIGHEST</option>
                <option value="Story Points > 8">Story Points &gt; 8</option>
                <option value="All Subtasks Completed">All Subtasks Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('thenActionExecute')}:</label>
              <select value={actionThen} onChange={e => setActionThen(e.target.value)}>
                <option value="Auto-assign QA Engineer & Add #needs-qa tag">Auto-assign QA Engineer & Add #needs-qa tag</option>
                <option value="Send High Priority Alert to Team Slack">Send High Priority Alert to Team Slack</option>
                <option value="Add #heavy-task label & Notify Tech Lead">Add #heavy-task label & Notify Tech Lead</option>
                <option value="Move Issue Status to DONE automatically">Move Issue Status to DONE automatically</option>
              </select>
            </div>
          </div>

          <div className="builder-actions">
            <button type="submit" className="btn-success-sm">{t('saveEnableRule')}</button>
            <button type="button" className="btn-ghost-sm" onClick={() => setIsCreatingRule(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="automation-layout-grid">
        {/* Rules List */}
        <div className="rules-section">
          <h3>{t('activeWorkflowRules')} ({automationRules.length})</h3>
          <div className="rules-list">
            {automationRules.map(rule => (
              <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
                <div className="rule-info">
                  <div className="rule-title-row">
                    <IconAutomation size={18} className="rule-icon" />
                    <span className="rule-name">{rule.name}</span>
                    <span className="exec-count-badge">{t('runs')}: {rule.executionCount || 0}</span>
                  </div>

                  <div className="rule-flow">
                    <div className="flow-step trigger">
                      <span className="step-badge when-badge">WHEN</span>
                      <span className="step-text">{rule.trigger}</span>
                    </div>
                    <span className="flow-arrow">➔</span>
                    <div className="flow-step action">
                      <span className="step-badge then-badge">THEN</span>
                      <span className="step-text">{rule.action}</span>
                    </div>
                  </div>
                </div>

                <div className="rule-controls">
                  <button className="btn-test-rule" onClick={() => handleRunRule(rule.id, rule.name)}>
                    <IconPlay size={14} /> {t('runRule')}
                  </button>

                  <label className="toggle-switch" title={rule.enabled ? t('enabled') : t('disabled')}>
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => toggleAutomationRule(rule.id)}
                    />
                    <span className="slider"></span>
                  </label>
                  <button
                    className="btn-delete-rule"
                    onClick={() => handleDeleteRule(rule.id, rule.name)}
                    title={t('deleteAutomationRule')}
                    aria-label={`${t('deleteAutomationRule')}: ${rule.name}`}
                  >
                    <IconX size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Execution Audit Log Panel */}
        <div className="audit-logs-section">
          <h3>📜 {t('liveExecutionLogs')}</h3>
          <div className="audit-logs-list">
            {automationAuditLogs.map(log => (
              <div key={log.id} className="audit-log-card animate-fade-in">
                <div className="log-header">
                  <span className="log-status-badge"><IconCheck size={12} /> {log.status}</span>
                  <span className="log-time">{log.triggeredAt}</span>
                </div>
                <div className="log-rule-name">{log.ruleName}</div>
                <div className="log-target">{t('targetIssue')}: <span className="issue-badge">{log.targetIssueKey}</span></div>
                <div className="log-action">{log.actionTaken}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
