import React, { useState } from 'react';
import { useJira } from '../../context/JiraContext';
import { IconDownload, IconReset } from '../common/Icons';

export const SettingsView: React.FC = () => {
  const { currentProject, exportDataJSON, importDataJSON, resetDemoData, language, setLanguage, theme, toggleTheme, t } = useJira();
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jiraverse-${currentProject.key}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg({ text: 'Data exported successfully as JSON file!', type: 'success' });
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;
    const ok = importDataJSON(importText.trim());
    if (ok) {
      setMsg({ text: 'Project data imported successfully!', type: 'success' });
      setImportText('');
    } else {
      setMsg({ text: 'Invalid JSON format! Please check file content.', type: 'error' });
    }
  };

  return (
    <div className="settings-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2>{t('settings')}</h2>
          <p className="subtext">Manage system language, theme preferences, and data backups</p>
        </div>
      </div>

      {msg && (
        <div className={`alert-banner ${msg.type} animate-fade-in`}>
          <span>{msg.text}</span>
        </div>
      )}

      <div className="settings-cards-grid">
        {/* System Preferences Card */}
        <div className="settings-card">
          <h3>🌐 {t('languageSetting')}</h3>
          <div className="form-group">
            <label>{t('selectLanguage')}</label>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="settings-select"
            >
              <option value="ko">🇰🇷 한국어 (Korean)</option>
              <option value="en">🇺🇸 English (US)</option>
              <option value="ja">🇯🇵 日本語 (Japanese)</option>
              <option value="zh">🇨🇳 中文 (Chinese)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label>{t('themeSetting')}</label>
            <button className="btn-secondary" onClick={toggleTheme}>
              {theme === 'dark' ? `🌙 ${t('darkTheme')}` : `☀️ ${t('lightTheme')}`}
            </button>
          </div>
        </div>

        {/* Project Profile Card */}
        <div className="settings-card">
          <h3>Project Details</h3>
          <div className="form-group">
            <label>Project Name</label>
            <input type="text" readOnly value={currentProject.name} />
          </div>
          <div className="form-group">
            <label>Project Key</label>
            <input type="text" readOnly value={currentProject.key} />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" readOnly value={currentProject.category} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea readOnly rows={3} value={currentProject.description} />
          </div>
        </div>

        {/* Data Persistence & Export/Import */}
        <div className="settings-card">
          <h3>Data Export & Import</h3>
          <p className="card-desc">Backup your entire board, sprint commitments, and issues to JSON.</p>

          <div className="actions-row">
            <button className="btn-primary" onClick={handleExport}>
              <IconDownload size={16} /> Export Project JSON
            </button>
            <button
              className="btn-danger"
              onClick={() => {
                if (window.confirm('Reset all issues and sprints to initial default demo dataset?')) {
                  resetDemoData();
                  setMsg({ text: 'Demo data restored to defaults!', type: 'success' });
                }
              }}
            >
              <IconReset size={16} /> Reset to Demo Data
            </button>
          </div>

          <form onSubmit={handleImportSubmit} className="import-form">
            <label>Paste JSON data to import:</label>
            <textarea
              rows={4}
              placeholder="Paste exported JSON here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <button type="submit" className="btn-secondary">Import JSON</button>
          </form>
        </div>
      </div>
    </div>
  );
};
