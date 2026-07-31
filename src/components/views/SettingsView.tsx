import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Language } from '../../i18n/translations';
import { IconDownload, IconReset, IconCheck, IconSettings } from '../common/Icons';
import { can } from '../../utils/permissions';

export const SettingsView: React.FC = () => {
  const {
    currentProject,
    currentUser,
    exportDataJSON,
    importDataJSON,
    resetDemoData,
    language,
    setLanguage,
    theme,
    toggleTheme,
    accentColor,
    setAccentColor,
    t
  } = useAether();
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);


  const colorOptions = [
    { name: 'Aether Indigo', hex: '#6366f1' },
    { name: 'Atlassian Blue', hex: '#0052cc' },
    { name: 'Emerald Tech', hex: '#10b981' },
    { name: 'Crimson Pulse', hex: '#ef4444' },
    { name: 'Violet Glow', hex: '#8b5cf6' }
  ];

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether-${currentProject.key.toLowerCase()}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ text: t('exportSuccess'), type: 'success' });
  };

  const handleImportSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importDataJSON(importText.trim());
    if (ok) {
      setMsg({ text: t('importSuccess'), type: 'success' });
      setImportText('');
    } else {
      setMsg({ text: t('importError'), type: 'error' });
    }
  };

  return (
    <div className="settings-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2 className="view-title-with-icon"><IconSettings size={20} /> {t('settings')}</h2>
        </div>
      </div>

      {msg && (
        <div className={`alert-banner ${msg.type} animate-fade-in`}>
          <span>{msg.text}</span>
        </div>
      )}

      <div className="settings-cards-grid">
        {/* Card 1: System Preferences & Theme */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>🌐 {t('systemPreferencesTheme')}</h3>
            <span className="card-badge">{t('appearance')}</span>
          </div>

          <div className="form-group">
            <label className="settings-label">{t('selectLanguage')}</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as Language)}
              className="settings-input-select"
            >
              <option value="ko">🇰🇷 {t('languageKo')}</option>
              <option value="en">🇺🇸 {t('languageEn')}</option>
              <option value="ja">🇯🇵 {t('languageJa')}</option>
              <option value="zh">🇨🇳 {t('languageZh')}</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="settings-label">{t('themeSetting')}</label>
            <button type="button" className="btn-secondary settings-theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? `🌙 ${t('darkTheme')}` : `☀️ ${t('lightTheme')}`}
            </button>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="settings-label">🎨 {t('accentTheme')}</label>
            <div className="color-swatches-row">
              {colorOptions.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  className={`color-swatch-btn ${accentColor === c.hex ? 'active' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                  aria-label={c.name}
                  onClick={() => setAccentColor(c.hex)}
                >
                  {accentColor === c.hex && <IconCheck size={12} color="#fff" />}
                </button>
              ))}
            </div>
            <span className="swatch-active-name">
              {t('activePalette')}: <strong>{colorOptions.find(c => c.hex === accentColor)?.name || t('customPalette')}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Project Profile */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>📁 {t('activeProjectProfile')}</h3>
            <span className="card-badge">{currentProject.key}</span>
          </div>

          <div className="settings-field-row">
            <div className="form-group flex-1">
              <label className="settings-label">{t('projectName')}</label>
              <input type="text" readOnly className="settings-input-readonly" value={currentProject.name} />
            </div>
            <div className="form-group flex-1">
              <label className="settings-label">{t('projectKey')}</label>
              <input type="text" readOnly className="settings-input-readonly" value={currentProject.key} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="settings-label">{t('category')}</label>
            <input type="text" readOnly className="settings-input-readonly" value={currentProject.category} />
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="settings-label">{t('description')}</label>
            <textarea readOnly rows={3} className="settings-input-readonly" value={currentProject.description} />
          </div>
        </div>

        {/* Card 3: Data Export & Import */}
        <div className="settings-card full-width-card">
          <div className="settings-card-header">
            <h3>💾 {t('dataBackup')}</h3>
            <span className="card-badge">{t('persistence')}</span>
          </div>
          <p className="card-desc">
            {t('exportImportDescription')}
          </p>

          <div className="actions-row">
            <button className="btn-primary" onClick={handleExport}>
              <IconDownload size={15} /> {t('exportData')}
            </button>
            {can(currentUser, 'team:manage') && <button
              className="btn-danger-outline"
              onClick={() => {
                if (window.confirm(t('resetDataConfirm'))) {
                  resetDemoData();
                  setMsg({ text: t('resetDataSuccess'), type: 'success' });
                }
              }}
            >
              <IconReset size={15} /> {t('resetData')}
            </button>}
          </div>

          {can(currentUser, 'team:manage') && <form onSubmit={handleImportSubmit} className="import-form">
            <label className="settings-label">{t('importPayload')}</label>
            <textarea
              rows={4}
              className="import-textarea"
              placeholder={t('importPlaceholder')}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="import-submit-row">
              <button type="submit" className="btn-secondary-sm">
                {t('restoreProjectData')}
              </button>
            </div>
          </form>}
        </div>
      </div>
    </div>
  );
};
