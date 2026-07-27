import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';
import { IconAutomation, IconPlay } from '../common/Icons';

export const AutomationView: React.FC = () => {
  const { automationRules, toggleAutomationRule } = useJira();
  const [testNotification, setTestNotification] = useState<string | null>(null);

  const handleRunTest = (ruleName: string) => {
    setTestNotification(`⚡ Automation Triggered: "${ruleName}" executed successfully on active issues!`);
    setTimeout(() => setTestNotification(null), 4000);
  };

  return (
    <div className="automation-view">
      <div className="view-header-bar">
        <div>
          <h1 className="view-title">Jira Automation Engine</h1>
          <p className="view-subtitle">Automate repetitive issue workflows with Trigger-Condition-Action rules</p>
        </div>
      </div>

      {testNotification && (
        <div className="alert-banner animate-fade-in">
          <span>{testNotification}</span>
        </div>
      )}

      <div className="rules-list">
        {automationRules.map(rule => (
          <div key={rule.id} className={`rule-card ${rule.enabled ? 'enabled' : 'disabled'}`}>
            <div className="rule-info">
              <div className="rule-title-row">
                <IconAutomation size={20} className="rule-icon" />
                <span className="rule-name">{rule.name}</span>
                {rule.lastExecuted && (
                  <span className="rule-exec-time">Last run: {rule.lastExecuted}</span>
                )}
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
              <button className="btn-test-rule" onClick={() => handleRunTest(rule.name)}>
                <IconPlay size={14} /> Test Run
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
  );
};
