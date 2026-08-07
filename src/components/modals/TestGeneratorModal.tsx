import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCopy, IconCheckCircle } from '../common/Icons';
import type { Issue } from '../../types/Aether';

interface TestGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIssueId?: string;
}

export const TestGeneratorModal: React.FC<TestGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialIssueId,
}) => {
  const { issues, updateIssue, t } = useAether();
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    initialIssueId || (issues.length > 0 ? issues[0].id : '')
  );
  const [activeTab, setActiveTab] = useState<'ac' | 'gherkin' | 'code'>('ac');
  const [testFramework, setTestFramework] = useState<'playwright' | 'cypress' | 'vitest'>('playwright');
  const [copied, setCopied] = useState<string | null>(null);
  const [appended, setAppended] = useState(false);

  const selectedIssue = useMemo(() => {
    return issues.find(i => i.id === selectedIssueId) || issues[0] || null;
  }, [issues, selectedIssueId]);

  if (!isOpen || !selectedIssue) return null;

  // AI-generated Acceptance Criteria mock rules based on issue summary & type
  const generatedAC = [
    `Given a valid user session, when accessing ${selectedIssue.key} functionality, then system state should respond within < 200ms.`,
    `Given invalid or missing parameters during ${selectedIssue.summary}, then display user-friendly validation error banner.`,
    `Given concurrent operations on ${selectedIssue.key}, then transaction isolation level ensures data consistency.`,
    `Given network latency or offline state, then optimistic UI update falls back gracefully with retry mechanism.`,
  ];

  // AI-generated Gherkin feature file content
  const gherkinText = `Feature: ${selectedIssue.key} - ${selectedIssue.summary}
  As a user interacting with Aether Pulse
  I want ${selectedIssue.summary}
  So that project workflows remain highly reliable and efficient.

  @happy-path @qa-automated
  Scenario: Successfully execute ${selectedIssue.key} primary flow
    Given the user is logged into workspace "${selectedIssue.component || 'Core'}"
    When the user triggers "${selectedIssue.summary}"
    Then the system updates state to reflect changes instantly
    And an audit activity log entry is recorded for author

  @edge-case @error-handling
  Scenario: Handle boundary constraints for ${selectedIssue.key}
    Given the target issue state is set to "${selectedIssue.status}"
    When unexpected payload or timeout occurs
    Then error boundary intercepts failure gracefully
    And status code 422 Unprocessable Entity notification is shown`;

  // AI-generated Test Code snippet generator
  const getTestCode = () => {
    if (testFramework === 'playwright') {
      return `import { test, expect } from '@playwright/test';

test.describe('${selectedIssue.key}: ${selectedIssue.summary}', () => {
  test('should complete primary workflow successfully', async ({ page }) => {
    await page.goto('/workspace');
    await page.click('[data-testid="${selectedIssue.key.toLowerCase()}"]');
    
    // Validate state update
    const statusBadge = page.locator('.issue-status');
    await expect(statusBadge).toBeVisible();
    await expect(page.locator('.toast-notification')).toContainText('Success');
  });

  test('should handle edge cases without throwing uncaught errors', async ({ page }) => {
    await page.goto('/workspace');
    // Trigger edge case simulation
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('.offline-warning')).toBeVisible();
  });
});`;
    } else if (testFramework === 'cypress') {
      return `describe('${selectedIssue.key} - ${selectedIssue.summary}', () => {
  beforeEach(() => {
    cy.visit('/workspace');
  });

  it('verifies happy path for ${selectedIssue.key}', () => {
    cy.get('[data-issue-id="${selectedIssue.id}"]').should('be.visible').click();
    cy.get('.modal-title').should('contain', '${selectedIssue.key}');
    cy.get('.btn-submit').click();
    cy.get('.toast-message').should('have.text', 'Updated successfully');
  });
});`;
    } else {
      return `import { describe, it, expect, vi } from 'vitest';

describe('${selectedIssue.key} Unit & Integration Test Suite', () => {
  it('should validate ${selectedIssue.summary} state transition', () => {
    const mockIssue = { id: '${selectedIssue.id}', status: '${selectedIssue.status}' };
    const updateFn = vi.fn((issue) => ({ ...issue, status: 'done' }));
    
    const result = updateFn(mockIssue);
    expect(result.status).toBe('done');
    expect(updateFn).toHaveBeenCalledTimes(1);
  });
});`;
    }
  };

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAppendToIssue = () => {
    const existingDesc = selectedIssue.description || '';
    const acFormatted = `\n\n### AI Acceptance Criteria (BDD)\n` + generatedAC.map(ac => `- [ ] ${ac}`).join('\n');
    updateIssue(selectedIssue.id, {
      description: existingDesc.includes('AI Acceptance Criteria') ? existingDesc : existingDesc + acFormatted,
      acceptanceCriteria: generatedAC,
    } as Partial<Issue>);
    setAppended(true);
    setTimeout(() => setAppended(false), 2500);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content test-generator-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconCheckCircle size={20} /></span>
            <div>
              <h2 className="modal-title">{t('testWorkbenchTitle')}</h2>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body test-modal-body">
          {/* Issue Selector & Context Header */}
          <div className="test-issue-select-row">
            <label htmlFor="issue-select">{t('targetIssue')}:</label>
            <select
              id="issue-select"
              value={selectedIssue.id}
              onChange={(e) => setSelectedIssueId(e.target.value)}
              className="test-issue-dropdown"
            >
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  [{issue.key}] {issue.summary} ({issue.status.toUpperCase()})
                </option>
              ))}
            </select>
            <span className="test-sp-badge">{selectedIssue.storyPoints || 1} SP</span>
            <span className={`test-status-badge status-${selectedIssue.status}`}>{t(selectedIssue.status)}</span>
          </div>

          {/* Selected Issue Meta Card */}
          <div className="selected-issue-card">
            <div className="selected-issue-header">
              <span className={`issue-type-badge ${selectedIssue.type}`}>
                {selectedIssue.type.toUpperCase()}
              </span>
              <span className="selected-issue-key">{selectedIssue.key}</span>
              <span className="selected-issue-title">{selectedIssue.summary}</span>
            </div>
            <p className="selected-issue-desc">
              {selectedIssue.description || t('noIssueDescription')}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="test-tabs-bar">
            <button
              className={`test-tab-btn ${activeTab === 'ac' ? 'active' : ''}`}
              onClick={() => setActiveTab('ac')}
            >
              {t('acceptanceCriteria')} ({generatedAC.length})
            </button>
            <button
              className={`test-tab-btn ${activeTab === 'gherkin' ? 'active' : ''}`}
              onClick={() => setActiveTab('gherkin')}
            >
              {t('gherkinFeature')}
            </button>
            <button
              className={`test-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              {t('automatedTestStubs')}
            </button>
          </div>

          {/* Tab 1: Acceptance Criteria */}
          {activeTab === 'ac' && (
            <div className="ac-container">
              <div className="ac-list">
                {generatedAC.map((item, idx) => (
                  <div key={idx} className="ac-item-row">
                    <input type="checkbox" readOnly checked id={`ac-${idx}`} />
                    <label htmlFor={`ac-${idx}`}>{item}</label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Gherkin BDD Feature */}
          {activeTab === 'gherkin' && (
            <div className="gherkin-container">
              <div className="code-box-header">
                <span>{selectedIssue.key.toLowerCase()}_spec.feature</span>
                <button
                  className="btn-copy-small"
                  onClick={() => handleCopy(gherkinText, 'gherkin')}
                >
                  {copied === 'gherkin' ? <IconCheckCircle /> : <IconCopy />}
                  {copied === 'gherkin' ? ` ${t('copied')}` : ` ${t('copyFeature')}`}
                </button>
              </div>
              <pre className="code-pre">{gherkinText}</pre>
            </div>
          )}

          {/* Tab 3: Automated Test Code */}
          {activeTab === 'code' && (
            <div className="code-container">
              <div className="framework-selector-row">
                <label>{t('testFramework')}:</label>
                <div className="framework-buttons">
                  {(['playwright', 'cypress', 'vitest'] as const).map((fw) => (
                    <button
                      key={fw}
                      className={`fw-btn ${testFramework === fw ? 'active' : ''}`}
                      onClick={() => setTestFramework(fw)}
                    >
                      {fw.toUpperCase()}
                    </button>
                  ))}
                </div>
                <button
                  className="btn-copy-small margin-left-auto"
                  onClick={() => handleCopy(getTestCode(), 'code')}
                >
                  {copied === 'code' ? <IconCheckCircle /> : <IconCopy />}
                  {copied === 'code' ? ` ${t('copied')}` : ` ${t('copySpec')}`}
                </button>
              </div>
              <pre className="code-pre">{getTestCode()}</pre>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn-secondary"
            onClick={handleAppendToIssue}
            disabled={appended}
          >
            {appended ? t('appendedToIssue') : t('appendAcToIssue')}
          </button>
          <button
            className="btn-primary"
            onClick={() => handleCopy(activeTab === 'gherkin' ? gherkinText : getTestCode(), 'all')}
          >
            {copied === 'all' ? (
              <>
                <IconCheckCircle /> {t('copied')}
              </>
            ) : (
              <>
                <IconCopy /> {t('copyAction')} {activeTab === 'gherkin' ? 'Gherkin' : 'Test Suite'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
