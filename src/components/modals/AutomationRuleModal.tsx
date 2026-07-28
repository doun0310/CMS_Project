import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconCopy } from '../common/Icons';

interface AutomationRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AutomationRuleModal: React.FC<AutomationRuleModalProps> = ({ isOpen, onClose }) => {
  const { addAutomationRule, runAutomationRule, automationRules } = useAether();

  const [ruleName, setRuleName] = useState('');
  const [trigger, setTrigger] = useState('Status moves to IN REVIEW');
  const [condition, setCondition] = useState('Component == Auth & Security');
  const [action, setAction] = useState('Auto-assign QA Engineer & Add #needs-qa tag');
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.slack.com/services/AETHER/B109/X9283');
  const [copied, setCopied] = useState(false);
  const [executedSuccess, setExecutedSuccess] = useState(false);

  if (!isOpen) return null;

  const generatedWebhookJson = `{
  "event": "automation_rule_triggered",
  "rule_name": "${ruleName || 'Custom Automation Rule'}",
  "trigger": "${trigger}",
  "condition": "${condition}",
  "action": "${action}",
  "timestamp": "${new Date().toISOString()}",
  "workspace": "AETHER-MAIN"
}`;

  const handleSaveAndRun = () => {
    const nameToSave = ruleName.trim() || `Workflow: ${trigger.split(' ')[0]} -> ${action.split(' ')[0]}`;
    addAutomationRule(nameToSave, trigger, `${action} [Condition: ${condition}]`);

    // Run the newest rule
    const newestRule = automationRules[automationRules.length - 1];
    if (newestRule) {
      runAutomationRule(newestRule.id);
    }

    setExecutedSuccess(true);
    setTimeout(() => {
      setExecutedSuccess(false);
      onClose();
    }, 2000);
  };

  const handleCopyWebhookJson = () => {
    navigator.clipboard.writeText(generatedWebhookJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content automation-rule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon">⚡</span>
            <div>
              <h2 className="modal-title">Visual Automation Rule Builder & Webhook Simulator</h2>
              <p className="modal-subtitle">
                Configure IF-THIS-THEN-THAT triggers, conditions & external Webhook payloads
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body auto-modal-body">
          {/* Rule Name Input */}
          <div className="auto-input-group">
            <label htmlFor="auto-rule-name">Automation Rule Name:</label>
            <input
              id="auto-rule-name"
              type="text"
              placeholder="e.g. Notify QA & Trigger Slack Webhook on In-Review"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="auto-input"
            />
          </div>

          {/* 3-Step Workflow Diagram */}
          <div className="workflow-steps-grid">
            {/* Step 1: Trigger */}
            <div className="step-card trigger">
              <span className="step-badge">STEP 1: WHEN (TRIGGER)</span>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)}>
                <option value="Status moves to IN REVIEW">Status moves to IN REVIEW</option>
                <option value="Issue Created as BUG">Issue Created as BUG</option>
                <option value="Priority Escalated to HIGHEST">Priority Escalated to HIGHEST</option>
                <option value="Story Points > 8">Story Points &gt; 8</option>
                <option value="SLA Threshold Breached">SLA Threshold Breached</option>
              </select>
            </div>

            {/* Step 2: Condition */}
            <div className="step-card condition">
              <span className="step-badge">STEP 2: IF (CONDITION)</span>
              <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="Component == Auth & Security">Component == Auth & Security</option>
                <option value="Assignee == Unassigned">Assignee == Unassigned</option>
                <option value="Sprint == Active Sprint">Sprint == Active Sprint</option>
                <option value="Always True (No Filter)">Always True (No Filter)</option>
              </select>
            </div>

            {/* Step 3: Action */}
            <div className="step-card action">
              <span className="step-badge">STEP 3: THEN (ACTION)</span>
              <select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="Auto-assign QA Engineer & Add #needs-qa tag">Auto-assign QA Engineer & Add #needs-qa tag</option>
                <option value="Send High Priority Alert to Team Slack">Send High Priority Alert to Team Slack</option>
                <option value="Add #heavy-task label & Notify Tech Lead">Add #heavy-task label & Notify Tech Lead</option>
                <option value="Trigger Custom Webhook Endpoint">Trigger Custom Webhook Endpoint</option>
              </select>
            </div>
          </div>

          {/* Webhook Configuration & Payload Preview */}
          <div className="webhook-section">
            <div className="webhook-header">
              <span>🌐 External Webhook Integration Payload:</span>
              <button className="btn-copy-small" onClick={handleCopyWebhookJson}>
                {copied ? <IconCheckCircle /> : <IconCopy />}
                {copied ? ' Copied Payload!' : ' Copy JSON'}
              </button>
            </div>
            <div className="webhook-url-input">
              <label>Endpoint URL:</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/..."
              />
            </div>
            <pre className="webhook-json-pre">{generatedWebhookJson}</pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSaveAndRun} disabled={executedSuccess}>
            {executedSuccess ? (
              <>
                <IconCheckCircle /> Executed & Recorded Audit!
              </>
            ) : (
              <>
                <IconZap /> Save & Dispatch Webhook
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
