import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconCopy, IconStandup, IconAlertTriangle } from '../common/Icons';

interface DailyStandupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyStandupModal: React.FC<DailyStandupModalProps> = ({ isOpen, onClose }) => {
  const { sprints, issues, users, t } = useAether();
  const activeSprint = sprints.find(s => s.status === 'active');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeSprint) return null;

  const sprintIssues = issues.filter(i => i.sprintId === activeSprint.id);
  const doneIssues = sprintIssues.filter(i => i.status === 'done');
  const inProgressIssues = sprintIssues.filter(i => i.status === 'in_progress' || i.status === 'in_review');
  const blockedIssues = sprintIssues.filter(i => (i.blockedBy || []).length > 0 && i.status !== 'done');
  const unassignedLabel = t('unassigned');

  // Format Standup Text for Slack/Teams
  const standupText = `
🚀 *${t('standupTitle')} - ${activeSprint.name}*
📅 Date: ${new Date().toLocaleDateString()}

🟢 *${t('completedRecently')} (${doneIssues.length})*:
${doneIssues.map(i => `  • [${i.key}] ${i.summary} (${users.find(u => u.id === i.assigneeId)?.name || unassignedLabel})`).join('\n') || `  • ${t('none')}`}

⚡ *${t('workingToday')} (${inProgressIssues.length})*:
${inProgressIssues.map(i => `  • [${i.key}] ${i.summary} (${users.find(u => u.id === i.assigneeId)?.name || unassignedLabel})`).join('\n') || `  • ${t('none')}`}

🛑 *${t('blockersImpediments')} (${blockedIssues.length})*:
${blockedIssues.map(i => `  • [${i.key}] ${i.summary} - ${t('waitingOnBlockers')}`).join('\n') || `  • ${t('noBlockers')}`}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(standupText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="daily-standup-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="modal-title-with-icon">
            <span className="standup-modal-icon-badge">
              <IconStandup size={20} color="var(--color-in-progress, #6366f1)" />
            </span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{t('standupTitle')}</h3>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="standup-modal-body">
          {/* Section 1: Completed Tasks */}
          <div className="standup-card-section done">
            <div className="section-title-row">
              <IconCheckCircle size={17} color="#22c55e" />
              <h4>1. {t('completedRecently')} ({doneIssues.length})</h4>
            </div>
            <div className="standup-items-list">
              {doneIssues.length === 0 ? (
                <div className="empty-text">{t('noCompletedRecently')}</div>
              ) : (
                doneIssues.map(issue => {
                  const user = users.find(u => u.id === issue.assigneeId);
                  return (
                    <div key={issue.id} className="standup-item-row">
                      <span className="item-key">{issue.key}</span>
                      <span className="item-summary">{issue.summary}</span>
                      <span className="item-assignee-badge">
                        {user?.avatar && <img src={user.avatar} alt={user.name} className="avatar-xs" />}
                        @{user?.name || t('unassigned')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 2: In Progress Tasks */}
          <div className="standup-card-section progress">
            <div className="section-title-row">
              <IconZap size={17} color="#6366f1" />
              <h4>2. {t('workingToday')} ({inProgressIssues.length})</h4>
            </div>
            <div className="standup-items-list">
              {inProgressIssues.length === 0 ? (
                <div className="empty-text">{t('noInProgress')}</div>
              ) : (
                inProgressIssues.map(issue => {
                  const user = users.find(u => u.id === issue.assigneeId);
                  return (
                    <div key={issue.id} className="standup-item-row">
                      <span className="item-key">{issue.key}</span>
                      <span className="item-summary">{issue.summary}</span>
                      <span className="item-assignee-badge">
                        {user?.avatar && <img src={user.avatar} alt={user.name} className="avatar-xs" />}
                        @{user?.name || t('unassigned')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section 3: Blockers & Risks */}
          <div className="standup-card-section blocked">
            <div className="section-title-row">
              <IconAlertTriangle size={17} color="#ef4444" />
              <h4>3. {t('blockersImpediments')} ({blockedIssues.length})</h4>
            </div>
            <div className="standup-items-list">
              {blockedIssues.length === 0 ? (
                <div className="empty-text ok">🎉 {t('noBlockers')}</div>
              ) : (
                blockedIssues.map(issue => (
                  <div key={issue.id} className="standup-item-row warning">
                    <span className="item-key">{issue.key}</span>
                    <span className="item-summary">{issue.summary}</span>
                    <span className="item-reason">{t('waitingOnBlockers')}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button className="btn-primary" onClick={handleCopy}>
            <IconCopy size={16} /> {copied ? t('copiedClipboard') : t('copyStandupDigest')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
