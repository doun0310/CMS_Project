import React, { useRef, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { useSubscription } from '../../context/SubscriptionContext';
import { openCustomerPortal, getPlan } from '../../services/stripeService';
import type { Language } from '../../i18n/translations';
import { IconDownload, IconUpload, IconReset, IconCheck, IconSettings, IconFolder, IconGlobe, IconPalette, IconDatabase, IconSun, IconMoon, IconLogout, IconShield } from '../common/Icons';
import { can } from '../../utils/permissions';
import { signOut } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabase';

export const SettingsView: React.FC = () => {
  const {
    currentProject,
    currentUser,
    authUser,
    exportDataJSON,
    importDataJSON,
    resetDemoData,
    language,
    setLanguage,
    theme,
    toggleTheme,
    accentColor,
    setAccentColor,
    setViewMode,
    t
  } = useAether();

  const { subscription, planId, isFree } = useSubscription();
  const activePlan = getPlan(planId);

  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importDataJSON(content);
        if (ok) {
          setMsg({ text: t('importSuccess'), type: 'success' });
          setImportText('');
        } else {
          setMsg({ text: t('importError'), type: 'error' });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };


  const colorOptions = [
    { name: 'Aether Indigo', hex: '#6366f1' },
    { name: 'Atlassian Blue', hex: '#0052cc' },
    { name: 'Emerald Tech', hex: '#10b981' },
    { name: 'Crimson Pulse', hex: '#ef4444' },
    { name: 'Violet Glow', hex: '#8b5cf6' }
  ];

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await signOut();
      // AuthGate in App.tsx detects the auth state change and shows login page
    }
  };

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

  return (
    <div className="settings-view animate-fade-in">
      <div className="view-header-bar">
        <div>
          <h2 className="view-title-with-icon"><IconSettings size={20} color="var(--color-in-progress, #6366f1)" /> {t('settings')}</h2>
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconGlobe size={18} color="var(--color-in-progress, #6366f1)" /> {t('systemPreferencesTheme')}</h3>
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
            <div className="theme-segmented-group">
              <button
                type="button"
                className={`theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              >
                <IconMoon size={16} />
                <span>{t('darkTheme')}</span>
              </button>
              <button
                type="button"
                className={`theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => { if (theme !== 'light') toggleTheme(); }}
              >
                <IconSun size={16} />
                <span>{t('lightTheme')}</span>
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="settings-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconPalette size={16} color="var(--color-in-progress, #6366f1)" /> {t('accentTheme')}</label>
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconFolder size={18} color="var(--color-in-progress, #6366f1)" /> {t('activeProjectProfile')}</h3>
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconDatabase size={18} color="var(--color-in-progress, #6366f1)" /> {t('dataBackup')}</h3>
            <span className="card-badge">{t('persistence')}</span>
          </div>
          <p className="card-desc">
            {t('exportImportDescription')}
          </p>

          <div className="actions-row">
            <button type="button" className="btn-primary" onClick={handleExport}>
              <IconDownload size={15} /> {t('exportData')}
            </button>
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button type="button" className="btn-danger-outline" onClick={() => fileInputRef.current?.click()}>
              <IconUpload size={15} /> {t('restoreProjectData')}
            </button>
            {can(currentUser, 'team:manage') && <button
              type="button"
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

          <div className="import-form">
            <label className="settings-label">{t('importPayload')}</label>
            <textarea
              rows={4}
              className="import-textarea"
              placeholder={t('importPlaceholder')}
              value={importText}
              onChange={e => {
                const val = e.target.value;
                setImportText(val);
                if (val.trim().startsWith('{') && val.trim().endsWith('}')) {
                  const ok = importDataJSON(val.trim());
                  if (ok) {
                    setMsg({ text: t('importSuccess'), type: 'success' });
                    setImportText('');
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Card 4: Account & Security */}
        <div className="settings-card full-width-card">
          <div className="settings-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconShield size={18} color="var(--color-in-progress, #6366f1)" /> 계정 및 보안</h3>
            <span className="card-badge">{isSupabaseConfigured ? '클라우드 연결됨' : '로컬 모드'}</span>
          </div>

          <div className="account-info-row">
            <div className="account-avatar-circle" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="account-info-text">
              <div className="account-info-name">{currentUser.name}</div>
              <div className="account-info-email">{currentUser.email}</div>
              <div className="account-info-role">
                <span className="card-badge" style={{ fontSize: '0.72rem' }}>{currentUser.projectRole ?? currentUser.role}</span>
              </div>
            </div>
          </div>

          {isSupabaseConfigured && (
            <div style={{ marginTop: '16px' }}>
              <p className="card-desc" style={{ marginBottom: '12px' }}>
                Supabase 인증으로 연결되어 있습니다. 데이터가 클라우드에 안전하게 저장됩니다.
              </p>
              <button
                type="button"
                className="btn-danger-outline"
                onClick={handleLogout}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <IconLogout size={15} />
                로그아웃
              </button>
            </div>
          )}
          {!isSupabaseConfigured && (
            <p className="card-desc" style={{ marginTop: '12px' }}>
              현재 로컬 저장 모드로 실행 중입니다. 클라우드 연동을 위해 <code>.env</code> 파일에 Supabase 키를 설정하세요.
            </p>
          )}
        </div>

        {/* Card 5: Subscription & Billing */}
        <div className="settings-card full-width-card">
          <div className="settings-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>💳 요금제 및 청구</h3>
            <span className="card-badge" style={{ backgroundColor: isFree ? 'var(--bg-tertiary)' : '#6366f1', color: isFree ? 'var(--text-secondary)' : '#fff' }}>
              {isFree ? 'FREE 플랜' : `${planId.toUpperCase()} (활성)`}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '8px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                현재 플랜: {activePlan.name}
              </div>
              <p className="card-desc" style={{ marginTop: '4px', marginBottom: 0 }}>
                {activePlan.description}
                {subscription.currentPeriodEnd && (
                  <span style={{ display: 'block', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-tertiary)' }}>
                    다음 결제/만료일: {new Date(subscription.currentPeriodEnd).toLocaleDateString('ko-KR')}
                  </span>
                )}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setViewMode('pricing')}
              >
                플랜 변경 / 업그레이드
              </button>
              {!isFree && (
                <button
                  type="button"
                  className="btn-danger-outline"
                  disabled={portalLoading}
                  onClick={async () => {
                    setPortalLoading(true);
                    try {
                      const url = await openCustomerPortal(authUser?.id ?? currentUser.id);
                      window.location.href = url;
                    } catch (e) {
                      setMsg({ text: (e as Error).message || 'Stripe 포털을 열 수 없습니다.', type: 'error' });
                    } finally {
                      setPortalLoading(false);
                    }
                  }}
                >
                  {portalLoading ? '로딩 중...' : '구독 관리 (Stripe Portal)'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
