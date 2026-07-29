import type { AutomationRule, AutomationAuditLog, Issue } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';

interface UseAutomationActionsParams {
  automationRules: AutomationRule[];
  setAutomationRules: Dispatch<SetStateAction<AutomationRule[]>>;
  setAutomationAuditLogs: Dispatch<SetStateAction<AutomationAuditLog[]>>;
  issues: Issue[];
}

export function useAutomationActions({
  automationRules,
  setAutomationRules,
  setAutomationAuditLogs,
  issues,
}: UseAutomationActionsParams) {
  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addAutomationRule = (name: string, trigger: string, action: string) => {
    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      name,
      trigger,
      action,
      enabled: true,
      executionCount: 0
    };
    setAutomationRules(prev => [newRule, ...prev]);
  };

  const deleteAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const runAutomationRule = (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    // Execute rule simulation on issues
    const targetIssue = issues[0] || { key: 'CLOUD-101' };
    const nowStr = new Date().toLocaleString();

    const newLog: AutomationAuditLog = {
      id: `log-${Date.now()}`,
      ruleName: rule.name,
      triggeredAt: nowStr,
      targetIssueKey: targetIssue.key,
      actionTaken: rule.action,
      status: 'SUCCESS'
    };

    setAutomationAuditLogs(prev => [newLog, ...prev]);

    // Increment execution count and timestamp
    setAutomationRules(prev =>
      prev.map(r =>
        r.id === ruleId
          ? {
              ...r,
              lastExecuted: 'Just now',
              executionCount: (r.executionCount || 0) + 1
            }
          : r
      )
    );
  };

  /** Called internally when an issue moves to 'done' status */
  const recordDoneStatusAutomation = () => {
    setAutomationRules(previousRules =>
      previousRules.map(rule =>
        rule.id === 'auto-1' && rule.enabled
          ? { ...rule, lastExecuted: new Date().toLocaleTimeString() }
          : rule
      )
    );
  };

  return {
    toggleAutomationRule,
    addAutomationRule,
    deleteAutomationRule,
    runAutomationRule,
    recordDoneStatusAutomation,
  };
}
