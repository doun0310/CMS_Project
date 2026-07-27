import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconCopy } from '../common/Icons';

interface DailyStandupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyStandupModal: React.FC<DailyStandupModalProps> = ({ isOpen, onClose }) => {
  const { sprints, issues, users } = useAether();
  const activeSprint = sprints.find(s => s.status === 'active');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeSprint) return null;

  const sprintIssues = issues.filter(i => i.sprintId === activeSprint.id);
  const doneIssues = sprintIssues.filter(i => i.status === 'done');
  const inProgressIssues = sprintIssues.filter(i => i.status === 'in_progress' || i.status === 'in_review');
  const blockedIssues = sprintIssues.filter(i => (i.blockedBy || []).length > 0 && i.status !== 'done');

  // Format Standup Text for Slack/Teams
  const standupText = `
🚀 *AetherPulse Daily Standup Digest - ${activeSprint.name}*
📅 Date: ${new Date().toLocaleDateString()}

🟢 *Completed Recently (${doneIssues.length})*:
${doneIssues.map(i => `  • [${i.key}] ${i.summary} (${users.find(u => u.id === i.assigneeId)?.name || 'Unassigned'})`).join('\n') || '  • None yet'}

⚡ *In Progress Today (${inProgressIssues.length})*:
${inProgressIssues.map(i => `  • [${i.key}] ${i.summary} (${users.find(u => u.id === i.assigneeId)?.name || 'Unassigned'})`).join('\n') || '  • None'}

🛑 *Impediments & Blockers (${blockedIssues.length})*:
${blockedIssues.map(i => `  • [${i.key}] ${i.summary} - Blocked by prerequisite tasks`).join('\n') || '  • 0 Blockers! Smooth sailing 🚀'}
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(standupText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="daily-standup-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="modal-title-with-icon">
            <span className="standup-icon">🤖</span>
            <div>
              <h3>AI Daily Standup Digest</h3>
              <span className="subtitle-text">Auto-generated daily standup summary for {activeSprint.name}</span>
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
              <IconCheckCircle size={16} color="#22c55e" />
              <h4>1. Completed Recently ({doneIssues.length})</h4>
            </div>
            <div className="standup-items-list">
              {doneIssues.length === 0 ? (
                <div className="empty-text">No items completed recently yet.</div>
              ) : (
                doneIssues.map(issue => (
                  <div key={issue.id} className="standup-item-row">
                    <span className="item-key">{issue.key}</span>
                    <span className="item-summary">{issue.summary}</span>
                    <span className="item-assignee">@{users.find(u => u.id === issue.assigneeId)?.name || 'Unassigned'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 2: In Progress Tasks */}
          <div className="standup-card-section progress">
            <div className="section-title-row">
              <IconZap size={16} color="#6366f1" />
              <h4>2. Working On Today ({inProgressIssues.length})</h4>
            </div>
            <div className="standup-items-list">
              {inProgressIssues.length === 0 ? (
                <div className="empty-text">No items currently in progress.</div>
              ) : (
                inProgressIssues.map(issue => (
                  <div key={issue.id} className="standup-item-row">
                    <span className="item-key">{issue.key}</span>
                    <span className="item-summary">{issue.summary}</span>
                    <span className="item-assignee">@{users.find(u => u.id === issue.assigneeId)?.name || 'Unassigned'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 3: Blockers & Risks */}
          <div className="standup-card-section blocked">
            <div className="section-title-row">
              <span className="blocker-icon">🛑</span>
              <h4>3. Blockers & Impediments ({blockedIssues.length})</h4>
            </div>
            <div className="standup-items-list">
              {blockedIssues.length === 0 ? (
                <div className="empty-text ok">🎉 0 Blockers! Team momentum is strong.</div>
              ) : (
                blockedIssues.map(issue => (
                  <div key={issue.id} className="standup-item-row warning">
                    <span className="item-key">{issue.key}</span>
                    <span className="item-summary">{issue.summary}</span>
                    <span className="item-reason">Waiting on blocker issues</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button className="btn-primary" onClick={handleCopy}>
            <IconCopy size={16} /> {copied ? 'Copied to Clipboard! ✓' : 'Copy Standup Digest (Slack/Teams)'}
          </button>
        </div>
      </div>
    </div>
  );
};
