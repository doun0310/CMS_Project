import React, { useState } from 'react';
import { signIn, signUp, signInWithGoogle, signInWithGithub, sendPasswordReset } from '../../services/authService';
import { isSupabaseConfigured } from '../../services/supabase';

type AuthMode = 'signin' | 'signup' | 'reset';

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const GithubIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const AetherLogo: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
    <rect width="36" height="36" rx="10" fill="url(#logo-grad)"/>
    <path d="M10 26L18 10L26 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 21H23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1"/>
        <stop offset="1" stopColor="#8B5CF6"/>
      </linearGradient>
    </defs>
  </svg>
);

interface AuthPageProps {
  /** Called when Supabase auth succeeds so the parent can show the main app */
  onAuthSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = () => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const clearMessages = () => { setError(null); setMessage(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: authError } = await signIn({ email, password });
        if (authError) setError(authError.message);
        // On success, AetherContext's onAuthStateChange fires automatically

      } else if (mode === 'signup') {
        if (!name.trim()) { setError('이름을 입력해주세요.'); setLoading(false); return; }
        if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); setLoading(false); return; }
        const { error: authError } = await signUp({ email, password, name });
        if (authError) {
          setError(authError.message);
        } else {
          setMessage('가입 확인 이메일이 발송되었습니다. 이메일을 확인해주세요.');
          setMode('signin');
        }

      } else if (mode === 'reset') {
        const { error: authError } = await sendPasswordReset(email);
        if (authError) {
          setError(authError.message);
        } else {
          setMessage('비밀번호 재설정 링크가 이메일로 발송되었습니다.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    clearMessages();
    setLoading(true);
    const { error: authError } = await signInWithGoogle();
    if (authError) { setError(authError.message); setLoading(false); }
    // On success, browser navigates to Google OAuth — loading stays true
  };

  const handleGithubSignIn = async () => {
    clearMessages();
    setLoading(true);
    const { error: authError } = await signInWithGithub();
    if (authError) { setError(authError.message); setLoading(false); }
    // On success, browser navigates to GitHub OAuth — loading stays true
  };

  const switchMode = (next: AuthMode) => {
    clearMessages();
    setMode(next);
  };

  const offlineMode = !isSupabaseConfigured;

  return (
    <div className="auth-page">
      <div className="auth-bg-shapes">
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
      </div>

      <div className="auth-card">
        {/* Branding */}
        <div className="auth-brand">
          <AetherLogo />
          <div>
            <h1 className="auth-brand-name">AetherPulse</h1>
            <p className="auth-brand-tagline">AI-Powered Agile Workspace</p>
          </div>
        </div>

        {/* Mode Title */}
        <div className="auth-header">
          <h2 className="auth-title">
            {mode === 'signin' && '로그인'}
            {mode === 'signup' && '새 계정 만들기'}
            {mode === 'reset' && '비밀번호 재설정'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'signin' && '계속하려면 계정에 로그인하세요'}
            {mode === 'signup' && '무료로 시작하세요. 신용카드 불필요'}
            {mode === 'reset' && '가입한 이메일 주소를 입력하세요'}
          </p>
        </div>

        {/* Offline Warning */}
        {offlineMode && (
          <div className="auth-banner auth-banner-warning">
            <span className="auth-banner-icon">⚠️</span>
            <span>Supabase 연결이 설정되지 않았습니다. <strong>.env</strong> 파일에 키를 추가하세요.</span>
          </div>
        )}

        {/* Error / Success Messages */}
        {error && (
          <div className="auth-banner auth-banner-error">
            <span className="auth-banner-icon">✕</span>
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="auth-banner auth-banner-success">
            <span className="auth-banner-icon">✓</span>
            <span>{message}</span>
          </div>
        )}

        {/* Social OAuth Buttons */}
        {mode !== 'reset' && (
          <>
            <div className="auth-social-row">
              <button
                className="auth-social-btn auth-google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading || offlineMode}
                type="button"
              >
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button
                className="auth-social-btn auth-github-btn"
                onClick={handleGithubSignIn}
                disabled={loading || offlineMode}
                type="button"
              >
                <GithubIcon />
                <span>GitHub</span>
              </button>
            </div>

            <div className="auth-divider">
              <span>또는 이메일로 계속</span>
            </div>
          </>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {mode === 'signup' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">이름</label>
              <input
                id="auth-name"
                className="auth-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="홍길동"
                required
                autoComplete="name"
                disabled={loading || offlineMode}
              />
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">이메일</label>
            <input
              id="auth-email"
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={loading || offlineMode}
            />
          </div>

          {mode !== 'reset' && (
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">비밀번호</label>
              <div className="auth-input-wrap">
                <input
                  id="auth-password"
                  className="auth-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? '6자 이상 입력' : '••••••••'}
                  required
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  disabled={loading || offlineMode}
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(p => !p)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              {mode === 'signin' && (
                <button
                  type="button"
                  className="auth-forgot"
                  onClick={() => switchMode('reset')}
                >
                  비밀번호를 잊으셨나요?
                </button>
              )}
            </div>
          )}

          <button
            className="auth-submit-btn"
            type="submit"
            disabled={loading || offlineMode}
          >
            {loading ? (
              <span className="auth-spinner" aria-hidden="true" />
            ) : (
              <>
                {mode === 'signin' && '로그인'}
                {mode === 'signup' && '계정 만들기'}
                {mode === 'reset' && '재설정 링크 보내기'}
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="auth-switch">
          {mode === 'signin' && (
            <span>계정이 없으신가요?{' '}
              <button type="button" className="auth-switch-btn" onClick={() => switchMode('signup')}>
                무료 가입
              </button>
            </span>
          )}
          {mode === 'signup' && (
            <span>이미 계정이 있으신가요?{' '}
              <button type="button" className="auth-switch-btn" onClick={() => switchMode('signin')}>
                로그인
              </button>
            </span>
          )}
          {mode === 'reset' && (
            <button type="button" className="auth-switch-btn" onClick={() => switchMode('signin')}>
              ← 로그인으로 돌아가기
            </button>
          )}
        </div>

        <p className="auth-footer-note">
          가입 시 <a href="#" className="auth-footer-link">이용약관</a>과{' '}
          <a href="#" className="auth-footer-link">개인정보처리방침</a>에 동의합니다.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
