import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconZap, IconSettings } from '../common/Icons';

interface TechDebtScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechDebtScannerModal: React.FC<TechDebtScannerModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, createIssue, t } = useAether();

  const [convertedDebt, setConvertedDebt] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const debtItems = [
    { id: 'td-1', category: 'Security', title: 'Deprecated OAuth 1.0a Library Dependency', impact: 'High', sp: 5, snippet: 'package.json -> oauth@0.9.15 (Vulnerable)' },
    { id: 'td-2', category: 'Performance', title: 'Unmemoized Chart Rendering in ReportsView', impact: 'Medium', sp: 3, snippet: 'ReportsView.tsx L142 -> Re-rendering 45 times/sec' },
    { id: 'td-3', category: 'Testing', title: 'Missing Unit Tests for Billing Engine Edge Cases', impact: 'High', sp: 5, snippet: 'BillingEngine.ts -> 42% Coverage (Goal 85%)' },
    { id: 'td-4', category: 'Code Smells', title: 'High Cyclomatic Complexity in IssueDetailModal', impact: 'Low', sp: 2, snippet: 'IssueDetailModal.tsx -> CC Score: 18' },
  ];

  const healthScore = 84;
  const totalDebtSp = debtItems.reduce((sum, item) => sum + item.sp, 0);

  const handleConvertDebtToTask = (item: typeof debtItems[0]) => {
    createIssue({
      summary: `[Tech Debt] ${item.title}`,
      type: 'task',
      priority: item.impact === 'High' ? 'high' : 'medium',
      status: 'todo',
      storyPoints: item.sp,
      description: `Technical Debt Remediation task. Target: ${item.snippet}`,
    });

    setConvertedDebt((prev) => ({ ...prev, [item.id]: true }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content tech-debt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconSettings size={20} /></span>
            <div>
              <h2 className="modal-title">{t('techDebtModalTitle')}</h2>
              <p className="modal-subtitle">
                Static analysis & automated refactoring task generator for [{currentProject.key}] {currentProject.name}
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body tech-debt-modal-body">
          {/* Health Score Banner */}
          <div className="debt-score-banner">
            <div className="score-badge-circle">
              <span className="score-val">{healthScore}</span>
              <span className="score-lbl">Health Score</span>
            </div>
            <div className="score-meta">
              <span className="score-title">Codebase Technical Debt Index</span>
              <p className="score-desc">
                4 technical debt items detected totaling <strong>{totalDebtSp} Story Points</strong> of refactoring effort needed.
              </p>
            </div>
          </div>

          {/* Technical Debt Items List */}
          <div className="debt-items-section">
            <h3>Detected Technical Debt & Code Smells</h3>

            <div className="debt-items-list">
              {debtItems.map((item) => (
                <div key={item.id} className="debt-item-card">
                  <div className="debt-card-left">
                    <div className="debt-card-header">
                      <span className={`debt-cat-tag ${item.category.toLowerCase().replace(/\s+/g, '')}`}>
                        {item.category}
                      </span>
                      <span className="debt-title">{item.title}</span>
                    </div>
                    <span className="debt-snippet">{item.snippet}</span>
                  </div>

                  <div className="debt-card-right">
                    <span className="debt-sp-badge">{item.sp} SP</span>
                    <button
                      className="btn-primary-sm"
                      onClick={() => handleConvertDebtToTask(item)}
                      disabled={convertedDebt[item.id]}
                    >
                      {convertedDebt[item.id] ? (
                        <>
                          <IconCheckCircle size={14} /> Created!
                        </>
                      ) : (
                        <>
                          <IconZap size={14} /> Refactor Task
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
