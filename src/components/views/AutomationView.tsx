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
    language,
    t
  } = useAether();

  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState('');
  const [triggerWhen, setTriggerWhen] = useState('Status moves to IN REVIEW');
  const [actionThen, setActionThen] = useState('Auto-assign QA Engineer & Add #needs-qa tag');

  const tr = (text: string): string => {
    if (!text) return '';
    const isKo = language === 'ko';
    const isJa = language === 'ja';
    const isZh = language === 'zh';

    if (text === 'Auto-set Resolution Date on Done' || text === '완료 시 자동 해결 일자 기록') {
      if (isKo) return '완료 시 자동 해결 일자 기록';
      if (isJa) return '完了時の解決日時自動記録';
      if (isZh) return '完成时自动记录解决日期';
      return 'Auto-set Resolution Date on Done';
    }
    if (text === 'Auto-assign Bug to SRE Team' || text === '최고 우선순위 버그 SRE 팀 자동 할당') {
      if (isKo) return '최고 우선순위 버그 SRE 팀 자동 할당';
      if (isJa) return '最高優先度バグのSREチーム自動割り当て';
      if (isZh) return '最高优先级 Bug 自动指派 SRE 团队';
      return 'Auto-assign Bug to SRE Team';
    }
    if (text === 'Sub-task Completion Checker' || text === '하위 작업 완료 상태 체커') {
      if (isKo) return '하위 작업 완료 상태 체커';
      if (isJa) return 'サブタスク完了状態チェッカー';
      if (isZh) return '子任务完成状态检查器';
      return 'Sub-task Completion Checker';
    }
    if (text === 'GitHub PR Merge -> Auto Move to DONE' || text === 'GitHub PR 머지 -> 자동 DONE 이동') {
      if (isKo) return 'GitHub PR 머지 시 자동 완료(DONE) 이동';
      if (isJa) return 'GitHub PRマージ時自動DONE移動';
      if (isZh) return 'GitHub PR 合并自动更改为 DONE';
      return 'GitHub PR Merge -> Auto Move to DONE';
    }
    if (text === 'High Priority Bug -> Auto Assign Lead & Slack Alert' || text === '긴급 버그 -> 리드 자동 할당 및 슬랙 알림') {
      if (isKo) return '긴급 버그 발생 시 리드 자동 할당 및 슬랙 알림';
      if (isJa) return '緊急バグ発生時リード自動割り当て＆Slackアラート';
      if (isZh) return '紧急 Bug 发生时自动指派 Leader 并发送 Slack 警报';
      return 'High Priority Bug -> Auto Assign Lead & Slack Alert';
    }
    if (text === 'All Subtasks Done -> Auto Resolve Parent Task' || text === '하위 작업 모두 완료 -> 부모 작업 자동 해결') {
      if (isKo) return '모든 하위 작업 완료 시 부모 작업 자동 해결';
      if (isJa) return '全サブタスク完了時親課題自動解決';
      if (isZh) return '所有子任务完成时自动解决父事项';
      return 'All Subtasks Done -> Auto Resolve Parent Task';
    }

    if (text.includes('When Issue Status changes to') || text.includes('완료(Done)')) {
      if (isKo) return '이슈 상태가 "완료(Done)"로 변경될 때';
      if (isJa) return '課題ステータスが「Done」に変更された時';
      if (isZh) return '当事项状态更改为 Done 时';
      return 'When Issue Status changes to "Done"';
    }
    if (text.includes('When new Issue of type "Bug"') || text.includes('Highest')) {
      if (isKo) return '우선순위 "최상(Highest)" 버그 이슈가 생성될 때';
      if (isJa) return '優先度「最高」のバグ課題が作成された時';
      if (isZh) return '当创建 Highest 优先级的 Bug 事项时';
      return 'When new Issue of type "Bug" with Priority "Highest" is created';
    }
    if (text.includes('When all Sub-tasks are checked completed') || text.includes('하위 작업')) {
      if (isKo) return '모든 하위 작업이 완료 상태로 체크될 때';
      if (isJa) return 'すべてのサブタスクが完了チェックされた時';
      if (isZh) return '当所有子任务勾选完成时';
      return 'When all Sub-tasks are checked completed';
    }
    if (text === 'GitHub PR Merged Event') {
      if (isKo) return 'GitHub PR 머지 이벤트 감지 시';
      if (isJa) return 'GitHub PRマージイベント検知時';
      if (isZh) return '检测到 GitHub PR 合并事件时';
      return 'GitHub PR Merged Event';
    }
    if (text === 'Issue Created as BUG with Priority HIGHEST') {
      if (isKo) return '우선순위 HIGHEST 버그 이슈 생성 시';
      if (isJa) return '優先度HIGHESTのバグ課題作成時';
      if (isZh) return '创建 Highest 优先级 Bug 事项时';
      return 'Issue Created as BUG with Priority HIGHEST';
    }
    if (text === 'All Subtasks Completed') {
      if (isKo) return '모든 하위 작업 완료 시';
      if (isJa) return 'すべてのサブタスク完了時';
      if (isZh) return '所有子任务完成时';
      return 'All Subtasks Completed';
    }
    if (text === 'Status moves to IN REVIEW') {
      if (isKo) return '상태가 검토 중(IN REVIEW)으로 이동 시';
      if (isJa) return 'ステータスが「レビュー中」へ移動時';
      if (isZh) return '状态更改为 IN REVIEW 时';
      return 'Status moves to IN REVIEW';
    }
    if (text === 'Issue Created as BUG') {
      if (isKo) return '버그(BUG) 이슈 생성 시';
      if (isJa) return 'バグ課題作成時';
      if (isZh) return '创建 Bug 事项时';
      return 'Issue Created as BUG';
    }
    if (text === 'Priority set to HIGHEST') {
      if (isKo) return '우선순위가 최상(HIGHEST)으로 설정 시';
      if (isJa) return '優先度が「最高」に設定時';
      if (isZh) return '优先级设置为 HIGHEST 时';
      return 'Priority set to HIGHEST';
    }
    if (text === 'Story Points > 8') {
      if (isKo) return '스토리 포인트 > 8 초과 시';
      if (isJa) return 'ストーリーポイント > 8 超過時';
      if (isZh) return '故事点数 > 8 时';
      return 'Story Points > 8';
    }

    if (text.includes('Set Resolved Timestamp')) {
      if (isKo) return '해결 타임스탬프 기록 및 보고자 알림';
      if (isJa) return '解決タイムスタンプ記録＆報告者通知';
      if (isZh) return '设置解决时间戳并通知报告人';
      return 'Set Resolved Timestamp & Notify Reporter';
    }
    if (text.includes('Assign to Elena Rostova') || text.includes('SRE')) {
      if (isKo) return 'SRE 팀 담당자 지정 및 #critical-bug 라벨 추가';
      if (isJa) return 'SREチーム割り当て＆#critical-bugラベル追加';
      if (isZh) return '指派 SRE 团队并添加 #critical-bug 标签';
      return 'Assign to SRE Team & Add label #critical-bug';
    }
    if (text.includes('Suggest moving parent issue to')) {
      if (isKo) return '상위 이슈를 "검토 중(In Review)"으로 이동 제안';
      if (isJa) return '親課題を「レビュー中」へ移動提案';
      if (isZh) return '建议将父事项更改为 In Review';
      return 'Suggest moving parent issue to "In Review"';
    }
    if (text === 'Move Issue Status to DONE automatically') {
      if (isKo) return '이슈 상태를 완료(DONE)로 자동 이동';
      if (isJa) return '課題ステータスをDONEに自動変更';
      if (isZh) return '自动将事项状态更改为 DONE';
      return 'Move Issue Status to DONE automatically';
    }
    if (text.includes('Send High Priority Alert to Team Slack')) {
      if (isKo) return '팀 슬랙 채널로 긴급 알람 전송 및 리드 지정';
      if (isJa) return 'チームSlackに緊急アラート送信＆リード指定';
      if (isZh) return '发送 High 优先级警报至团队 Slack 并指派 Leader';
      return 'Send High Priority Alert to Team Slack';
    }
    if (text.includes('Auto-assign QA Engineer')) {
      if (isKo) return 'QA 엔지니어 자동 할당 및 #needs-qa 태그 추가';
      if (isJa) return 'QAエンジニア自動割り当て＆#needs-qaタグ追加';
      if (isZh) return '自动指派 QA 工程师并添加 #needs-qa 标签';
      return 'Auto-assign QA Engineer & Add #needs-qa tag';
    }
    if (text.includes('Add #heavy-task label')) {
      if (isKo) return '#heavy-task 라벨 추가 및 테크 리드 알림';
      if (isJa) return '#heavy-taskラベル追加＆テックリード通知';
      if (isZh) return '添加 #heavy-task 标签并通知 Tech Lead';
      return 'Add #heavy-task label & Notify Tech Lead';
    }
    if (text.includes('Assigned to QA Engineer')) {
      if (isKo) return 'QA 엔지니어(David Park)에게 자동 할당됨';
      if (isJa) return 'QAエンジニア（David Park）に自動割り当て完了';
      if (isZh) return '已自动指派至 QA 工程师 (David Park)';
      return 'Assigned to QA Engineer (David Park)';
    }
    if (text.includes('Sent AI alert to Team Lead')) {
      if (isKo) return '팀 리드 슬랙 채널로 AI 알림 전송됨';
      if (isJa) return 'チームリードSlackチャンネルへAIアラート送信完了';
      if (isZh) return '已向 Team Lead Slack 频道发送 AI 警报';
      return 'Sent AI alert to Team Lead Slack channel';
    }

    return text;
  };

  const handleRunRule = (ruleId: string, ruleName: string) => {
    runAutomationRule(ruleId);
    setTestNotification(`⚡ ${t('automationTriggered')}: "${tr(ruleName)}" ${t('executedSuccessfully')}`);
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
    if (!window.confirm(`${t('deleteAutomationRuleConfirm')}\n\n${tr(ruleName)}`)) return;
    deleteAutomationRule(ruleId);
    setTestNotification(`${t('automationRuleDeleted')}: "${tr(ruleName)}"`);
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

      {/* 1-Click Preset Templates */}
      <div className="ai-preset-card animate-fade-in" style={{ marginBottom: '20px' }}>
        <div className="ai-preset-header">
          <span>{t('oneClickPresets')}</span>
        </div>
        <div className="preset-buttons-row" style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-preset-sm"
            onClick={() => {
              addAutomationRule(
                'GitHub PR Merge -> Auto Move to DONE',
                'GitHub PR Merged Event',
                'Move Issue Status to DONE automatically'
              );
              setTestNotification(`${t('addedRule')}: ${tr('GitHub PR Merge -> Auto Move to DONE')}`);
              setTimeout(() => setTestNotification(null), 3000);
            }}
          >
            {t('presetPrMerge')}
          </button>

          <button
            type="button"
            className="btn-preset-sm"
            onClick={() => {
              addAutomationRule(
                'High Priority Bug -> Auto Assign Lead & Slack Alert',
                'Issue Created as BUG with Priority HIGHEST',
                'Send High Priority Alert to Team Slack & Assign Lead'
              );
              setTestNotification(`${t('addedRule')}: ${tr('High Priority Bug -> Auto Assign Lead & Slack Alert')}`);
              setTimeout(() => setTestNotification(null), 3000);
            }}
          >
            {t('presetHighBug')}
          </button>

          <button
            type="button"
            className="btn-preset-sm"
            onClick={() => {
              addAutomationRule(
                'All Subtasks Done -> Auto Resolve Parent Task',
                'All Subtasks Completed',
                'Move Issue Status to DONE automatically'
              );
              setTestNotification(`${t('addedRule')}: ${tr('All Subtasks Done -> Auto Resolve Parent Task')}`);
              setTimeout(() => setTestNotification(null), 3000);
            }}
          >
            {t('presetSubtaskSync')}
          </button>
        </div>
      </div>

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
                <option value="Status moves to IN REVIEW">{tr('Status moves to IN REVIEW')}</option>
                <option value="Issue Created as BUG">{tr('Issue Created as BUG')}</option>
                <option value="Priority set to HIGHEST">{tr('Priority set to HIGHEST')}</option>
                <option value="Story Points > 8">{tr('Story Points > 8')}</option>
                <option value="All Subtasks Completed">{tr('All Subtasks Completed')}</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('thenActionExecute')}:</label>
              <select value={actionThen} onChange={e => setActionThen(e.target.value)}>
                <option value="Auto-assign QA Engineer & Add #needs-qa tag">{tr('Auto-assign QA Engineer & Add #needs-qa tag')}</option>
                <option value="Send High Priority Alert to Team Slack">{tr('Send High Priority Alert to Team Slack')}</option>
                <option value="Add #heavy-task label & Notify Tech Lead">{tr('#heavy-task 라벨 추가 및 테크 리드 알림')}</option>
                <option value="Move Issue Status to DONE automatically">{tr('Move Issue Status to DONE automatically')}</option>
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
                    <span className="rule-name">{tr(rule.name)}</span>
                    <span className="exec-count-badge">{t('runs')}: {rule.executionCount || 0}</span>
                  </div>

                  <div className="rule-flow">
                    <div className="flow-step trigger">
                      <span className="step-badge when-badge">WHEN</span>
                      <span className="step-text">{tr(rule.trigger)}</span>
                    </div>
                    <span className="flow-arrow">➔</span>
                    <div className="flow-step action">
                      <span className="step-badge then-badge">THEN</span>
                      <span className="step-text">{tr(rule.action)}</span>
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
                    aria-label={`${t('deleteAutomationRule')}: ${tr(rule.name)}`}
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
          <h3> {t('liveExecutionLogs')}</h3>
          <div className="audit-logs-list">
            {automationAuditLogs.map(log => (
              <div key={log.id} className="audit-log-card animate-fade-in">
                <div className="log-header">
                  <span className="log-status-badge"><IconCheck size={12} /> {log.status}</span>
                  <span className="log-time">{log.triggeredAt}</span>
                </div>
                <div className="log-rule-name">{tr(log.ruleName)}</div>
                <div className="log-target">{t('targetIssue')}: <span className="issue-badge">{log.targetIssueKey}</span></div>
                <div className="log-action">{tr(log.actionTaken)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
