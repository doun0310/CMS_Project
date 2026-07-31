import type { AutomationRule, AutomationAuditLog, Issue, User } from '../types/Aether';
import type { Dispatch, SetStateAction } from 'react';
import { can } from '../utils/permissions';

interface UseAutomationActionsParams {
  automationRules: AutomationRule[];
  setAutomationRules: Dispatch<SetStateAction<AutomationRule[]>>;
  setAutomationAuditLogs: Dispatch<SetStateAction<AutomationAuditLog[]>>;
  issues: Issue[];
  currentUser: User;
}

export function useAutomationActions({
  automationRules,
  setAutomationRules,
  setAutomationAuditLogs,
  issues,
  currentUser,
}: UseAutomationActionsParams) {
  const toggleAutomationRule = (ruleId: string) => {
    if (!can(currentUser, 'project:manage')) return;
    setAutomationRules(prev =>
      prev.map(r => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const addAutomationRule = (name: string, trigger: string, action: string) => {
    if (!can(currentUser, 'project:manage')) return;
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
    if (!can(currentUser, 'project:manage')) return;
    setAutomationRules(prev => prev.filter(rule => rule.id !== ruleId));
  };

  const runAutomationRule = (ruleId: string) => {
    if (!can(currentUser, 'project:manage')) return;
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
  const recordDoneStatusAutomation = (targetIssueKey = 'CLOUD-101') => {
    const nowStr = new Date().toLocaleString();

    setAutomationRules(previousRules =>
      previousRules.map(rule => {
        if ((rule.id === 'auto-1' || rule.trigger.toLowerCase().includes('done')) && rule.enabled) {
          return {
            ...rule,
            lastExecuted: 'Just now',
            executionCount: (rule.executionCount || 0) + 1
          };
        }
        return rule;
      })
    );

    const matchingRule = automationRules.find(
      r => (r.id === 'auto-1' || r.trigger.toLowerCase().includes('done')) && r.enabled
    );
    if (matchingRule) {
      const newLog: AutomationAuditLog = {
        id: `log-${Date.now()}`,
        ruleName: matchingRule.name,
        triggeredAt: nowStr,
        targetIssueKey,
        actionTaken: matchingRule.action,
        status: 'SUCCESS'
      };
      setAutomationAuditLogs(prev => [newLog, ...prev]);
    }
  };

  return {
    toggleAutomationRule,
    addAutomationRule,
    deleteAutomationRule,
    runAutomationRule,
    recordDoneStatusAutomation,
  };
}
