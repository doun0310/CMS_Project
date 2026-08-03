import React, { useState, useMemo } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconCopy, IconArchitecture } from '../common/Icons';

interface CodeImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeImpactModal: React.FC<CodeImpactModalProps> = ({ isOpen, onClose }) => {
  const { issues, users, updateIssue, t } = useAether();

  const [selectedIssueId, setSelectedIssueId] = useState<string>(issues[0]?.id || '');
  const [copied, setCopied] = useState(false);
  const [attached, setAttached] = useState(false);

  const selectedIssue = useMemo(() => {
    return issues.find((i) => i.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  // AI Code Impact Analysis Mock Generator based on selected issue
  const impactAnalysis = useMemo(() => {
    if (!selectedIssue) return null;

    const component = selectedIssue.component || 'Frontend Core';
    const isHighRisk = selectedIssue.priority === 'highest' || selectedIssue.priority === 'high';

    const impactedModules = [
      { name: `${component} / UI Components`, risk: 'low', filesCount: 4, linesChanged: '~120' },
      { name: 'API Client & REST Gateway', risk: isHighRisk ? 'high' : 'medium', filesCount: 2, linesChanged: '~65' },
      { name: 'Aether State Context & Reducer', risk: 'medium', filesCount: 3, linesChanged: '~90' },
      { name: 'Database Migration Schema', risk: isHighRisk ? 'critical' : 'low', filesCount: 1, linesChanged: '~25' },
    ];

    const blastRadiusScore = isHighRisk ? 82 : 45;
    const blastTier = blastRadiusScore >= 75 ? 'critical' : blastRadiusScore >= 40 ? 'warning' : 'low';

    // Recommended code reviewers based on ownership
    const recommendedReviewers = users.slice(0, 2);

    const prReadinessChecklist = [
      { text: 'Unit tests covering primary state transition', passed: true },
      { text: 'Backward compatibility with API v1 schema', passed: !isHighRisk },
      { text: 'No breaking CSS Custom Property changes', passed: true },
      { text: 'Performance LCP / INP benchmark audit', passed: true },
    ];

    return {
      impactedModules,
      blastRadiusScore,
      blastTier,
      recommendedReviewers,
      prReadinessChecklist,
    };
  }, [selectedIssue, users]);

  if (!isOpen || !selectedIssue || !impactAnalysis) return null;

  const handleCopyReport = () => {
    const reportText = `### AI Code Architecture & Impact Analysis Report
**Issue:** [${selectedIssue.key}] ${selectedIssue.summary}
**Blast Radius Score:** ${impactAnalysis.blastRadiusScore}/100 (${impactAnalysis.blastTier.toUpperCase()})
**Recommended Reviewers:** ${impactAnalysis.recommendedReviewers.map(r => r.name).join(', ')}

#### Impacted Modules:
${impactAnalysis.impactedModules.map(m => `- ${m.name} (${m.filesCount} files, ${m.linesChanged}) -> Risk: ${m.risk.toUpperCase()}`).join('\n')}

#### PR Readiness Checklist:
${impactAnalysis.prReadinessChecklist.map(c => `- [${c.passed ? 'x' : ' '}] ${c.text}`).join('\n')}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttachToIssue = () => {
    const existingDesc = selectedIssue.description || '';
    const reportMarkdown = `\n\n### AI Code Impact & Blast Radius Audit\n` +
      `- **Blast Radius:** ${impactAnalysis.blastRadiusScore}/100 (${impactAnalysis.blastTier.toUpperCase()})\n` +
      `- **Reviewers:** ${impactAnalysis.recommendedReviewers.map(r => `@${r.name}`).join(' ')}\n` +
      `- **Modules:** ${impactAnalysis.impactedModules.map(m => m.name).join(', ')}`;

    updateIssue(selectedIssue.id, {
      description: existingDesc.includes('Blast Radius Audit') ? existingDesc : existingDesc + reportMarkdown,
    });
    setAttached(true);
    setTimeout(() => setAttached(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content code-impact-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconArchitecture size={20} /></span>
            <div>
              <h2 className="modal-title">{t('codeImpactModalTitle')}</h2>
              <p className="modal-subtitle">
                {t('codeImpactModalSubtitle')}
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body impact-modal-body">
          {/* Target Issue Selection Row */}
          <div className="impact-issue-row">
            <label htmlFor="impact-issue-select">{t('targetIssue')}:</label>
            <select
              id="impact-issue-select"
              value={selectedIssue.id}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="impact-issue-dropdown"
            >
              {issues.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.key}] {i.summary} ({i.priority.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Blast Radius Score & Reviewers Grid */}
          <div className="impact-summary-grid">
            <div className={`blast-score-card ${impactAnalysis.blastTier}`}>
              <span className="blast-score-val">{impactAnalysis.blastRadiusScore}</span>
              <span className="blast-score-title">
                {impactAnalysis.blastTier === 'critical'
                  ? t('highBlastRadius')
                  : impactAnalysis.blastTier === 'warning'
                  ? t('moderateArchRisk')
                  : t('lowBlastRadius')}
              </span>
              <span className="blast-score-desc">
                {t('blastRadiusCalcDesc')}
              </span>
            </div>

            <div className="reviewers-card">
              <span className="reviewers-card-title">{t('recommendedReviewers')}</span>
              <div className="reviewers-list">
                {impactAnalysis.recommendedReviewers.map((rev) => (
                  <div key={rev.id} className="reviewer-item">
                    <img src={rev.avatar} alt={rev.name} className="avatar-xs" />
                    <div>
                      <div className="rev-name">{rev.name}</div>
                      <div className="rev-role">{rev.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Impacted Modules Table */}
          <div className="impact-modules-section">
            <h3 className="impact-section-title">{t('impactedArchitectureModules')}</h3>
            <div className="modules-table-wrap">
              <table className="modules-table">
                <thead>
                  <tr>
                    <th>{t('moduleSubsystem')}</th>
                    <th>{t('riskLevel')}</th>
                    <th>{t('touchedFiles')}</th>
                    <th>{t('estDiffLines')}</th>
                  </tr>
                </thead>
                <tbody>
                  {impactAnalysis.impactedModules.map((mod, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{mod.name}</td>
                      <td>
                        <span className={`risk-pill ${mod.risk}`}>
                          {mod.risk.toUpperCase()}
                        </span>
                      </td>
                      <td>{mod.filesCount} files</td>
                      <td className="font-mono text-tertiary">{mod.linesChanged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* PR Readiness Checklist */}
          <div className="pr-checklist-section">
            <h3 className="impact-section-title">{t('prReadinessChecklist')}</h3>
            <div className="pr-checklist">
              {impactAnalysis.prReadinessChecklist.map((item, idx) => (
                <div key={idx} className="pr-check-item">
                  <span className={`check-icon ${item.passed ? 'passed' : 'failed'}`}>
                    {item.passed ? 'Passed' : 'Review'}
                  </span>
                  <span className="check-text">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleAttachToIssue} disabled={attached}>
            {attached ? t('attachedReportSuccess') : t('attachReportToIssue')}
          </button>
          <button className="btn-primary" onClick={handleCopyReport}>
            {copied ? (
              <>
                <IconCheckCircle /> {t('copiedReportSuccess')}
              </>
            ) : (
              <>
                <IconCopy /> {t('copyImpactReport')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
