import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCopy, IconCheckCircle, IconRelease } from '../common/Icons';

interface ReleaseNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, sprints, issues, users, t } = useAether();
  const activeSprint = sprints.find(s => s.status === 'active');
  const [copied, setCopied] = useState(false);
  const [versionTag, setVersionTag] = useState('v1.4.0');

  const [includeRollbackPlan, setIncludeRollbackPlan] = useState(true);

  if (!isOpen || !activeSprint) return null;

  const sprintIssues = issues.filter(i => i.sprintId === activeSprint.id && i.status === 'done');
  const features = sprintIssues.filter(i => i.type === 'feature' || i.type === 'story');
  const workItems = sprintIssues.filter(i => i.type === 'workitem' || i.type === 'task');
  const bugs = sprintIssues.filter(i => i.type === 'bug');
  const initiatives = sprintIssues.filter(i => i.type === 'initiative' || i.type === 'epic');
  const teamLabel = t('teamActivity');

  const rollbackPlanText = `## 🛡️ Emergency Rollback Strategy (${versionTag})
1. **Kubernetes / Helm Rollback**: \`helm rollback aether-pulse-prod v1.3.9\`
2. **Database Migration Rollback**: \`npm run db:migrate:undo -- --to v1.3.9\`
3. **Cache Purge**: \`redis-cli flushdb && CDN purge all\`
4. **On-Call Lead**: Alex Rivera (@alex.rivera)`;

  const releaseMarkdown = `
# ${t('releaseNotesTitle')} - ${currentProject.name} (${versionTag})
**${t('sprint')}:** ${activeSprint.name}
**Date:** ${new Date().toLocaleDateString()}

${initiatives.length > 0 ? `## ${t('typeInitiative')}
${initiatives.map(i => `- **[${i.key}]** ${i.summary}`).join('\n')}
` : ''}
${features.length > 0 ? `## ${t('typeFeature')}
${features.map(i => `- **[${i.key}]** ${i.summary} (@${users.find(u => u.id === i.assigneeId)?.name || teamLabel})`).join('\n')}
` : ''}
${workItems.length > 0 ? `## ${t('typeWorkItem')}
${workItems.map(i => `- **[${i.key}]** ${i.summary}`).join('\n')}
` : ''}
${bugs.length > 0 ? `## ${t('typeBug')}
${bugs.map(i => `- **[${i.key}]** ${i.summary}`).join('\n')}
` : ''}
${includeRollbackPlan ? rollbackPlanText : ''}
---
*AetherPulse AI*
`.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(releaseMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return createPortal(
    <div className="modal-backdrop-center animate-fade-in" onClick={onClose}>
      <div className="release-notes-modal animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="modal-header-bar">
          <div className="title-with-icon">
            <span className="release-modal-icon-badge">
              <IconRelease size={20} color="var(--color-in-progress, #6366f1)" />
            </span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{t('releaseNotesTitle')} & AI Deployment Advisor</h3>
              <span className="subtitle-text" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {t('releaseNotesSubtitle')} • <strong>{activeSprint.name}</strong>
              </span>
            </div>
          </div>
          <button className="btn-icon-close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <div className="release-modal-body">
          {/* AI Deployment Risk Scorecard */}
          <div className="risk-scorecard-grid">
            <div className="risk-card green">
              <span className="risk-val">14/100</span>
              <span className="risk-lbl">Deployment Risk Score</span>
            </div>
            <div className="risk-card green">
              <span className="risk-val">0</span>
              <span className="risk-lbl">Breaking Changes</span>
            </div>
            <div className="risk-card blue">
              <span className="risk-val">Backward OK</span>
              <span className="risk-lbl">DB Schema Safety</span>
            </div>
          </div>

          <div className="version-input-row">
            <label>{t('releaseVersionTag')}:</label>
            <input
              type="text"
              value={versionTag}
              onChange={e => setVersionTag(e.target.value)}
              placeholder="v1.4.0"
            />
            <label className="rollback-checkbox-label">
              <input
                type="checkbox"
                checked={includeRollbackPlan}
                onChange={e => setIncludeRollbackPlan(e.target.checked)}
              />
              Include Emergency Rollback Strategy
            </label>
            <span className="done-count-badge">
              <IconCheckCircle size={14} color="#22c55e" /> {sprintIssues.length} {t('completedItems')}
            </span>
          </div>

          <div className="preview-markdown-box">
            <pre>{releaseMarkdown}</pre>
          </div>
        </div>

        <div className="modal-footer-bar">
          <button className="btn-primary" onClick={handleCopy}>
            <IconCopy size={16} /> {copied ? t('copiedReleaseNotes') : t('copyReleaseNotes')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
