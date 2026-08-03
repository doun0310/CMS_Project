import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconPlus, IconCheckCircle, IconSettings } from '../common/Icons';
import type { CustomFieldDef } from '../../types/Aether';

interface CustomFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomFieldModal: React.FC<CustomFieldModalProps> = ({ isOpen, onClose }) => {
  const { currentProject, issues, updateIssue, t } = useAether();

  // Default pre-loaded custom fields
  const [fields, setFields] = useState<CustomFieldDef[]>([
    {
      id: 'cf-env',
      name: 'Deployment Environment',
      type: 'select',
      options: ['Staging', 'Production', 'Dev Sandbox', 'QA Cluster'],
      defaultValue: 'Production',
    },
    {
      id: 'cf-tier',
      name: 'Customer Impact Tier',
      type: 'badge',
      options: ['VIP Enterprise', 'Growth', 'Free Tier', 'Internal'],
      defaultValue: 'VIP Enterprise',
    },
    {
      id: 'cf-pr',
      name: 'GitHub PR Link',
      type: 'url',
      defaultValue: 'https://github.com/doun0310/CMS_Project',
    },
    {
      id: 'cf-security',
      name: 'Security Audit Gate',
      type: 'select',
      options: ['Passed', 'Pending Review', 'Exempt'],
      defaultValue: 'Passed',
    },
  ]);

  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'select' | 'url' | 'badge'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [targetIssueId, setTargetIssueId] = useState<string>(issues[0]?.id || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedIssue = issues.find(i => i.id === targetIssueId) || issues[0] || null;
  const [issueFields, setIssueFields] = useState<Record<string, string>>(() => {
    return selectedIssue?.customFields || {
      'Deployment Environment': 'Production',
      'Customer Impact Tier': 'VIP Enterprise',
      'GitHub PR Link': 'https://github.com/doun0310/CMS_Project',
      'Security Audit Gate': 'Passed',
    };
  });

  if (!isOpen) return null;

  const handleAddField = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;

    const optionsArray = newFieldOptions
      ? newFieldOptions.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    const newDef: CustomFieldDef = {
      id: `cf-${Date.now()}`,
      name: newFieldName.trim(),
      type: newFieldType,
      options: optionsArray,
      defaultValue: optionsArray ? optionsArray[0] : '',
    };

    setFields((prev) => [...prev, newDef]);
    setNewFieldName('');
    setNewFieldOptions('');
  };

  const handleDeleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveIssueFields = () => {
    if (!selectedIssue) return;
    updateIssue(selectedIssue.id, {
      customFields: issueFields,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content custom-field-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon"><IconSettings size={20} /></span>
            <div>
              <h2 className="modal-title">{t('customFieldWorkbenchTitle')}</h2>
              <p className="modal-subtitle">
                {t('customFieldWorkbenchSubtitle')} [{currentProject.key}] {currentProject.name}
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body cf-modal-body">
          {/* AI Preset Schema Recommendations */}
          <div className="ai-preset-card">
            <div className="ai-preset-header">
              <span>{t('aiPresetSchemaTitle')}</span>
              <span className="preset-hint">{t('presetHint')}</span>
            </div>
            <div className="preset-buttons-row">
              <button
                type="button"
                className="btn-preset-sm"
                onClick={() => {
                  setFields([
                    { id: 'cf-env', name: 'Deployment Environment', type: 'select', options: ['Staging', 'Production', 'QA Cluster'], defaultValue: 'Production' },
                    { id: 'cf-pr', name: 'GitHub PR Link', type: 'url', defaultValue: 'https://github.com/doun0310/CMS_Project' },
                    { id: 'cf-artifact', name: 'Build Artifact Hash', type: 'text', defaultValue: 'sha256:a91f82' },
                  ]);
                }}
              >
                {t('presetDevops')}
              </button>

              <button
                type="button"
                className="btn-preset-sm"
                onClick={() => {
                  setFields([
                    { id: 'cf-security', name: 'Security Audit Gate', type: 'select', options: ['Passed', 'Pending Review', 'Exempt'], defaultValue: 'Passed' },
                    { id: 'cf-privacy', name: 'Data Privacy Tag', type: 'badge', options: ['PII Sensitive', 'Internal Only', 'Public'], defaultValue: 'Internal Only' },
                    { id: 'cf-soc2', name: 'SOC2 Scope', type: 'select', options: ['In-Scope', 'Out-of-Scope'], defaultValue: 'In-Scope' },
                  ]);
                }}
              >
                {t('presetSecurity')}
              </button>

              <button
                type="button"
                className="btn-preset-sm"
                onClick={() => {
                  setFields([
                    { id: 'cf-tier', name: 'Customer Impact Tier', type: 'badge', options: ['VIP Enterprise', 'Growth', 'Free Tier'], defaultValue: 'VIP Enterprise' },
                    { id: 'cf-arr', name: 'Affected ARR ($)', type: 'text', defaultValue: '$250,000' },
                    { id: 'cf-sla', name: 'SLA Response Tier', type: 'badge', options: ['4h SLA', '24h SLA', '48h SLA'], defaultValue: '4h SLA' },
                  ]);
                }}
              >
                {t('presetCustomerImpact')}
              </button>
            </div>
          </div>

          {/* Section 1: Manage Field Definitions */}
          <div className="cf-section">
            <h3 className="cf-section-title">{t('activeFieldDefinitions')}</h3>
            <div className="cf-schema-grid">
              {fields.map((field) => (
                <div key={field.id} className="cf-schema-card">
                  <div className="cf-card-header">
                    <span className="cf-field-name">{field.name}</span>
                    <span className={`cf-type-badge ${field.type}`}>{field.type.toUpperCase()}</span>
                    <button
                      className="btn-icon-danger"
                      onClick={() => handleDeleteField(field.id)}
                      title={t('deleteFieldSchema')}
                    >
                      <IconX />
                    </button>
                  </div>
                  {field.options && field.options.length > 0 && (
                    <div className="cf-options-chips">
                      {field.options.map((opt, i) => (
                        <span key={i} className="cf-opt-chip">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Field Form */}
            <form onSubmit={handleAddField} className="add-cf-form">
              <div className="form-row-three">
                <input
                  type="text"
                  placeholder={t('fieldNamePlaceholder')}
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  required
                />
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                >
                  <option value="text">{t('typeTextInput')}</option>
                  <option value="select">{t('typeSelectDropdown')}</option>
                  <option value="badge">{t('typeBadgePill')}</option>
                  <option value="url">{t('typeUrlLink')}</option>
                </select>
                <input
                  type="text"
                  placeholder={t('optionsPlaceholder')}
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                  disabled={newFieldType === 'text' || newFieldType === 'url'}
                />
              </div>
              <button type="submit" className="btn-secondary add-cf-btn">
                <IconPlus /> {t('addSchemaField')}
              </button>
            </form>
          </div>

          <hr className="cf-divider" />

          {/* Section 2: Quick Assign Field Values to Issue */}
          {selectedIssue && (
            <div className="cf-section">
              <div className="cf-assign-header">
                <h3 className="cf-section-title">{t('assignMetadataTitle')}</h3>
                <select
                  value={selectedIssue.id}
                  onChange={(e) => {
                    setTargetIssueId(e.target.value);
                    const target = issues.find((i) => i.id === e.target.value);
                    if (target) {
                      setIssueFields(target.customFields || {});
                    }
                  }}
                  className="cf-issue-select"
                >
                  {issues.map((i) => (
                    <option key={i.id} value={i.id}>
                      [{i.key}] {i.summary}
                    </option>
                  ))}
                </select>
              </div>

              <div className="cf-values-form">
                {fields.map((f) => (
                  <div key={f.id} className="cf-value-input-row">
                    <label>{f.name}:</label>
                    {f.type === 'select' || f.type === 'badge' ? (
                      <select
                        value={issueFields[f.name] || f.defaultValue || ''}
                        onChange={(e) =>
                          setIssueFields({ ...issueFields, [f.name]: e.target.value })
                        }
                      >
                        {(f.options || ['Default']).map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={f.type === 'url' ? 'url' : 'text'}
                        value={issueFields[f.name] || f.defaultValue || ''}
                        onChange={(e) =>
                          setIssueFields({ ...issueFields, [f.name]: e.target.value })
                        }
                        placeholder={f.type === 'url' ? 'https://...' : 'Enter value'}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="btn-primary" onClick={handleSaveIssueFields}>
            {savedSuccess ? (
              <>
                <IconCheckCircle /> {t('savedSchemaSuccess')}
              </>
            ) : (
              t('saveMetadata')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
