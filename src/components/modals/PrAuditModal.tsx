import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconCopy } from '../common/Icons';

interface PrAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrAuditModal: React.FC<PrAuditModalProps> = ({ isOpen, onClose }) => {
  const { issues, selectedIssueId, t } = useAether();

  const targetIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const [prUrl, setPrUrl] = useState('https://github.com/doun0310/CMS_Project/pull/142');
  const [copied, setCopied] = useState(false);
  const [auditAttached, setAuditAttached] = useState(false);

  if (!isOpen) return null;

  const auditResults = {
    prNumber: '#142',
    prTitle: `Fix: ${targetIssue?.summary || 'Security Gate Audit'}`,
    securityScore: 98,
    coveragePct: 86,
    codeSmells: 2,
    vulnerabilities: 0,
    status: 'PASSED',
    checks: [
      { name: 'OWASP Security Vulnerability Scan', status: 'pass', detail: '0 critical vulnerabilities found' },
      { name: 'Unit & Integration Test Suite', status: 'pass', detail: '142 tests passed, 86% coverage' },
      { name: 'Static Code Analysis (Oxlint)', status: 'pass', detail: '0 errors, 2 minor warnings' },
      { name: 'DB Migration Backward Compatibility', status: 'pass', detail: 'No breaking schema changes' },
    ],
  };

  const formattedAuditMarkdown = `### AI Pull Request Quality & Security Audit Report [${auditResults.prNumber}]
- **Target Issue**: [${targetIssue?.key}] ${targetIssue?.summary}
- **Security Score**: ${auditResults.securityScore}/100 (Pass)
- **Test Coverage**: ${auditResults.coveragePct}% (Threshold: 80%)
- **Static Code Analysis**: 0 Errors, ${auditResults.codeSmells} Warnings
- **Status**: **READY FOR PROD MERGE**`;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(formattedAuditMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttachToIssue = () => {
    setAuditAttached(true);
    setTimeout(() => {
      setAuditAttached(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content pr-audit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconCheckCircle size={20} /></span>
            <div>
              <h2 className="modal-title">{t('prAuditModalTitle')}</h2>
              <p className="modal-subtitle">
                {t('prAuditModalSubtitle')} [{targetIssue?.key}]
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body audit-modal-body">
          {/* PR Link Bar */}
          <div className="pr-link-bar">
            <label>{t('githubPrLink')}:</label>
            <input
              type="url"
              value={prUrl}
              onChange={(e) => setPrUrl(e.target.value)}
              className="pr-url-input"
            />
          </div>

          {/* Audit Metrics Cards */}
          <div className="audit-metrics-grid">
            <div className="audit-card green">
              <div className="audit-val">{auditResults.securityScore}/100</div>
              <div className="audit-lbl">{t('securityGateScore')}</div>
            </div>
            <div className="audit-card green">
              <div className="audit-val">{auditResults.coveragePct}%</div>
              <div className="audit-lbl">{t('testCoverage')}</div>
            </div>
            <div className="audit-card yellow">
              <div className="audit-val">{auditResults.codeSmells}</div>
              <div className="audit-lbl">{t('codeSmells')}</div>
            </div>
            <div className="audit-card blue">
              <div className="audit-val">0</div>
              <div className="audit-lbl">{t('vulnerabilities')}</div>
            </div>
          </div>

          {/* Detailed Security & Quality Checks List */}
          <div className="audit-checks-section">
            <h3>{t('cicdQualityChecks')}</h3>

            <div className="checks-list">
              {auditResults.checks.map((check, idx) => (
                <div key={idx} className="check-item">
                  <IconCheckCircle size={16} color="#22c55e" />
                  <div className="check-info">
                    <span className="check-name">{check.name}</span>
                    <span className="check-detail">{check.detail}</span>
                  </div>
                  <span className="check-status-badge">PASS</span>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Report Markdown Box */}
          <div className="audit-report-box">
            <div className="report-header">
              <span>{t('formattedAuditMarkdown')}:</span>
              <button className="btn-copy-small" onClick={handleCopyMarkdown}>
                {copied ? <IconCheckCircle /> : <IconCopy />}
                {copied ? ` ${t('copied')}` : ` ${t('copyMarkdown')}`}
              </button>
            </div>
            <pre className="audit-markdown-pre">{formattedAuditMarkdown}</pre>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('close')}
          </button>
          <button className="btn-primary" onClick={handleAttachToIssue} disabled={auditAttached}>
            {auditAttached ? (
              <>
                <IconCheckCircle /> {t('attachedBadgeSuccess')}
              </>
            ) : (
              <>
                {t('approveAndAttachBadge')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
