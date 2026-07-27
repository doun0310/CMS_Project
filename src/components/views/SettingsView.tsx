import React, { useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import type { Language } from '../../i18n/translations';
import { IconDownload, IconReset, IconCheck } from '../common/Icons';

export const SettingsView: React.FC = () => {
  const {
    currentProject,
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
    setMsg({ text: 'Project data exported successfully as JSON!', type: 'success' });
  };

  const handleImportSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importDataJSON(importText.trim());
    if (ok) {
      setMsg({ text: 'Project data restored successfully from JSON!', type: 'success' });
      setImportText('');
    } else {
      setMsg({ text: 'Invalid JSON payload! Please verify the format.', type: 'error' });
    }
  };

  return (
    <div className="settings-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2>⚙️ {t('settings')}</h2>
          <p className="subtext">Configure system language, brand theme colors, project profiles, and data backups.</p>
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
            <h3>🌐 System Preferences & Theme</h3>
            <span className="card-badge">Appearance</span>
          </div>

          <div className="form-group">
            <label className="settings-label">{t('selectLanguage')}</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as Language)}
              className="settings-input-select"
            >
              <option value="ko">🇰🇷 한국어 (Korean)</option>
              <option value="en">🇺🇸 English (US)</option>
              <option value="ja">🇯🇵 日本語 (Japanese)</option>
              <option value="zh">🇨🇳 中文 (Chinese)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="settings-label">{t('themeSetting')}</label>
            <button type="button" className="btn-secondary settings-theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? `🌙 ${t('darkTheme')}` : `☀️ ${t('lightTheme')}`}
            </button>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="settings-label">🎨 Brand Accent Color Theme</label>
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
              Active Palette: <strong>{colorOptions.find(c => c.hex === accentColor)?.name || 'Custom'}</strong>
            </span>
          </div>
        </div>

        {/* Card 2: Project Profile */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>📁 Active Project Profile</h3>
            <span className="card-badge">{currentProject.key}</span>
          </div>

          <div className="settings-field-row">
            <div className="form-group flex-1">
              <label className="settings-label">Project Name</label>
              <input type="text" readOnly className="settings-input-readonly" value={currentProject.name} />
            </div>
            <div className="form-group flex-1">
              <label className="settings-label">Project Key</label>
              <input type="text" readOnly className="settings-input-readonly" value={currentProject.key} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="settings-label">Category</label>
            <input type="text" readOnly className="settings-input-readonly" value={currentProject.category} />
          </div>

          <div className="form-group" style={{ marginTop: '10px' }}>
            <label className="settings-label">Description</label>
            <textarea readOnly rows={3} className="settings-input-readonly" value={currentProject.description} />
          </div>
        </div>

        {/* Card 3: Data Export & Import */}
        <div className="settings-card full-width-card">
          <div className="settings-card-header">
            <h3>💾 Data Backup, Export & Import</h3>
            <span className="card-badge">Persistence</span>
          </div>
          <p className="card-desc">
            Export your entire workspace (issues, sprints, epics, rules, and retrospective items) to a JSON file or restore from a previous backup.
          </p>

          <div className="actions-row">
            <button className="btn-primary" onClick={handleExport}>
              <IconDownload size={15} /> Export Project JSON
            </button>
            <button
              className="btn-danger-outline"
              onClick={() => {
                if (window.confirm('Reset all issues and sprints to initial default demo dataset?')) {
                  resetDemoData();
                  setMsg({ text: 'Demo dataset restored successfully!', type: 'success' });
                }
              }}
            >
              <IconReset size={15} /> Reset Demo Data
            </button>
          </div>

          <form onSubmit={handleImportSubmit} className="import-form">
            <label className="settings-label">Import Payload (JSON):</label>
            <textarea
              rows={4}
              className="import-textarea"
              placeholder="Paste exported JSON payload here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="import-submit-row">
              <button type="submit" className="btn-secondary-sm">
                Restore Project Data
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
