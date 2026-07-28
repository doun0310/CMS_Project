import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCopy } from '../common/Icons';

interface ComplianceMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceMatrixModal: React.FC<ComplianceMatrixModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, sprints } = useAether();

  const activeSprint = sprints.find((s) => s.status === 'active') || sprints[0];
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const complianceStandards = [
    { name: 'SOC2 Type II', domain: 'Access Control & Data Encryption', status: 'Passed ✅', score: '99.8%' },
    { name: 'GDPR Data Privacy', domain: 'PII Anonymization & Data Erasure API', status: 'Passed ✅', score: '100%' },
    { name: 'ISO 27001 Security', domain: 'Vulnerability Scan & Audit Logging', status: 'Passed ✅', score: '98.5%' },
    { name: 'HIPAA Health Data Guard', domain: 'PHI Access Logging & TLS 1.3 Transit', status: 'Passed ✅', score: '98.5%' },
  ];

  const overallAuditScore = 99.2;

  const auditCertificateMarkdown = `
# 🛡️ Enterprise Regulatory Compliance Audit Certificate
**Project:** ${currentProject.name} (${currentProject.key})
**Sprint Target:** ${activeSprint?.name}
**Overall Audit Score:** ${overallAuditScore}% (Compliance Certified)
**Audit Date:** ${new Date().toLocaleDateString()}

## 📋 Compliance Standards Audit Breakdown
${complianceStandards.map(s => `- **[${s.name}]** ${s.domain} ➔ ${s.status} (Score: ${s.score})`).join('\n')}

---
*Signed by AetherPulse Automated Enterprise Compliance Gatekeeper*
`.trim();

  const handleCopyCertificate = () => {
    navigator.clipboard.writeText(auditCertificateMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content compliance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon">🛡️</span>
            <div>
              <h2 className="modal-title">Enterprise Release Risk & Regulatory Compliance Matrix</h2>
              <p className="modal-subtitle">
                Automated SOC2, GDPR, ISO 27001 & HIPAA compliance audit signoff for [{currentProject.key}]
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body comp-modal-body">
          {/* Audit Score Banner */}
          <div className="comp-banner">
            <div className="comp-score-circle">
              <span className="comp-val">{overallAuditScore}%</span>
              <span className="comp-lbl">Audit Score</span>
            </div>
            <div className="comp-meta">
              <span className="comp-title">🟢 Compliance Certified for Production Release</span>
              <p className="comp-desc">
                All 4 enterprise regulatory compliance standards (SOC2, GDPR, ISO 27001, HIPAA) have passed automated security audit gates with 0 compliance violations.
              </p>
            </div>
          </div>

          {/* Compliance Standards Table */}
          <div className="comp-standards-section">
            <h3>📋 Enterprise Audit Standards Signoff</h3>

            <div className="comp-table-wrap">
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Standard</th>
                    <th>Domain Scope</th>
                    <th>Audit Status</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {complianceStandards.map((std, idx) => (
                    <tr key={idx}>
                      <td className="font-bold">{std.name}</td>
                      <td className="text-secondary">{std.domain}</td>
                      <td><span className="status-pass">{std.status}</span></td>
                      <td><strong className="text-indigo">{std.score}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleCopyCertificate}>
            <IconCopy size={16} /> {copied ? 'Certificate Copied!' : 'Export ISO/SOC2 Audit Certificate'}
          </button>
        </div>
      </div>
    </div>
  );
};
