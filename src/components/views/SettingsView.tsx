import React, { useEffect, useRef, useState } from 'react';
import { useAether } from '../../context/AetherContextValue';
import { useSubscription } from '../../context/SubscriptionContext';
import { openCustomerPortal, getPlan } from '../../services/stripeService';
import type { Language } from '../../i18n/translations';
import { IconDownload, IconUpload, IconReset, IconCheck, IconSettings, IconFolder, IconGlobe, IconPalette, IconDatabase, IconSun, IconMoon, IconLogout, IconShield, IconCreditCard, IconLink, IconAlertTriangle } from '../common/Icons';
import { can } from '../../utils/permissions';
import { signOut, getIdentities, linkIdentity, unlinkIdentity } from '../../services/authService';
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

  // Account Linking 상태
  const [identities, setIdentities] = useState<{ provider: string; identity_id: string }[]>([]);
  const [linkingProvider, setLinkingProvider] = useState<'github' | 'google' | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 현재 연결된 소셜 계정 목록 불러오기
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getIdentities().then(({ identities: ids }) => setIdentities(ids));
  }, []);

  const handleLinkIdentity = async (provider: 'github' | 'google') => {
    setLinkingProvider(provider);
    const { error } = await linkIdentity(provider);
    if (error) {
      setMsg({ text: `연동 실패: ${error.message}`, type: 'error' });
      setLinkingProvider(null);
    }
    // 성공 시 OAuth 리다이렉트로 페이지 이동 — 돌아오면 identities 자동 갱신
  };

  const handleUnlinkIdentity = async (identityId: string, provider: string) => {
    if (identities.length <= 1) {
      setMsg({ text: '마지막 로그인 수단은 해제할 수 없습니다. 먼저 다른 계정을 연동하세요.', type: 'error' });
      return;
    }
    if (!window.confirm(`${provider} 계정 연동을 해제하시겠습니까?`)) return;
    setUnlinkingId(identityId);
    const { error } = await unlinkIdentity(identityId);
    if (error) {
      setMsg({ text: `해제 실패: ${error.message}`, type: 'error' });
    } else {
      setIdentities(prev => prev.filter(id => id.identity_id !== identityId));
      setMsg({ text: `${provider} 계정 연동이 해제되었습니다.`, type: 'success' });
    }
    setUnlinkingId(null);
  };

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

          {/* ── Account Linking ───────────────────────────────── */}
          {isSupabaseConfigured && (
            <div style={{ marginTop: '20px' }}>
              <div className="settings-label" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconLink size={18} /> 소셜 계정 연동
              </div>
              <p className="card-desc" style={{ marginBottom: '14px' }}>
                여러 소셜 계정을 하나의 AetherPulse 계정에 연결하면, Google 또는 GitHub 어느 쪽으로도 동일한 계정으로 로그인할 수 있습니다.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* GitHub */}
                {(() => {
                  const ghIdentity = identities.find(id => id.provider === 'github');
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>GitHub</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {ghIdentity ? '연동됨' : '연동되지 않음'}
                          </div>
                        </div>
                      </div>
                      {ghIdentity ? (
                        <button
                          type="button"
                          className="btn-danger-outline"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          disabled={unlinkingId === ghIdentity.identity_id}
                          onClick={() => handleUnlinkIdentity(ghIdentity.identity_id, 'GitHub')}
                        >
                          {unlinkingId === ghIdentity.identity_id ? '해제 중...' : '연동 해제'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          disabled={linkingProvider === 'github'}
                          onClick={() => handleLinkIdentity('github')}
                        >
                          {linkingProvider === 'github' ? '연동 중...' : '연동하기'}
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Google */}
                {(() => {
                  const googleIdentity = identities.find(id => id.provider === 'google');
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Google</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {googleIdentity ? '연동됨' : '연동되지 않음'}
                          </div>
                        </div>
                      </div>
                      {googleIdentity ? (
                        <button
                          type="button"
                          className="btn-danger-outline"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          disabled={unlinkingId === googleIdentity.identity_id}
                          onClick={() => handleUnlinkIdentity(googleIdentity.identity_id, 'Google')}
                        >
                          {unlinkingId === googleIdentity.identity_id ? '해제 중...' : '연동 해제'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                          disabled={linkingProvider === 'google'}
                          onClick={() => handleLinkIdentity('google')}
                        >
                          {linkingProvider === 'google' ? '연동 중...' : '연동하기'}
                        </button>
                      )}
                    </div>
                  );
                })()}
              </div>

              <p className="card-desc" style={{ marginTop: '12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconAlertTriangle size={15} color="var(--accent-warning, #f59e0b)" style={{ flexShrink: 0 }} />
                마지막으로 연결된 계정은 해제할 수 없습니다. 최소 1개의 로그인 수단이 유지되어야 합니다.
              </p>

              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-primary)' }}>
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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconCreditCard size={18} color="var(--color-in-progress, #6366f1)" /> 요금제 및 청구</h3>
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
