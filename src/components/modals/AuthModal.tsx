import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { useAether } from '../../context/AetherContextValue';
import { PROJECT_ROLES, type ProjectRole, type User } from '../../types/Aether';
import { IconX, IconCheckCircle, IconAlertTriangle } from '../common/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    isAuthLoading,
    currentUser,
    addSignedInAccount,
    signedInAccounts,
    updateAccountProjectRole,
    users,
    t
  } = useAether();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [projectRole, setProjectRole] = useState<ProjectRole>('Project Member');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setLoading(true);
    try {
      if (isSupabaseConfigured && mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim(), project_role: projectRole } }
        });
        if (error) throw error;

        if (data.session && data.user) {
          addSignedInAccount({
            id: data.user.id,
            name: name.trim() || email.split('@')[0],
            email: data.user.email || email,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            projectRole,
            role: 'Team Member'
          });
        }
        setSuccessMsg(data.session ? '계정이 생성되어 로그인되었습니다.' : '계정이 생성되었습니다. 이메일 인증 후 로그인해 주세요.');
        return;
      }

      if (isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        } else if (data.user) {
          const newAcc: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || email.split('@')[0],
            email: data.user.email || email,
            avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
            projectRole: data.user.user_metadata?.project_role as ProjectRole || 'Project Member',
            role: 'Enterprise Member'
          };
          addSignedInAccount(newAcc);
          setSuccessMsg(`Logged in: ${newAcc.name}!`);
          setTimeout(() => onClose(), 1200);
          return;
        }
      }

      // Add local signed-in account
      const newAcc: User = {
        id: `user-${Date.now()}`,
        name: name.trim() || email.split('@')[0] || 'Team Member',
        email: email.trim() || 'user@aetherpulse.io',
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        projectRole,
        role: 'Agile Team Member'
      };
      addSignedInAccount(newAcc);
      setSuccessMsg(`Added account: ${newAcc.name}`);
      setTimeout(() => onClose(), 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSupabaseConfigured) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    const googleUser: User = {
      id: `user-google-${Date.now()}`,
      name: 'Google User',
      email: 'user.google@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Google SSO Account'
    };
    addSignedInAccount(googleUser);
    setSuccessMsg(`Google Account: ${googleUser.name}`);
    setTimeout(() => onClose(), 1000);
  };

  const handleGitHubSignIn = async () => {
    if (isSupabaseConfigured) {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: { redirectTo: window.location.origin }
      });
      if (error) setErrorMsg(error.message);
      setLoading(false);
      return;
    }
    const githubUser: User = {
      id: `user-github-${Date.now()}`,
      name: 'GitHub Developer',
      email: 'dev.github@aetherpulse.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'GitHub SSO Account'
    };
    addSignedInAccount(githubUser);
    setSuccessMsg(`GitHub Account: ${githubUser.name}`);
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon">🔐</span>
            <div>
              <h2 className="modal-title">Sign In & Multi-Account Switcher</h2>
              <p className="modal-subtitle">
                {t('addAnotherAccount')}
              </p>
            </div>
          </div>
          <button className="btn-icon close-btn" onClick={onClose}>
            <IconX />
          </button>
        </div>

        <div className="modal-body auth-modal-body">
          {isAuthLoading ? (
            <div className="auth-alert">Supabase session 확인 중...</div>
          ) : (
            <>
              {/* Quick Social SSO Logins */}
              <div className="social-auth-row">
                <button type="button" className="btn-social google" onClick={handleGoogleSignIn}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>{t('googleSignIn')}</span>
                </button>

                <button type="button" className="btn-social github" onClick={handleGitHubSignIn}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                  <span>{t('githubSignIn')}</span>
                </button>
              </div>

              <div className="auth-divider">
                <span>OR SIGN IN WITH EMAIL</span>
              </div>

              <div className="auth-tab-row">
                <button
                  className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
                  onClick={() => setMode('signin')}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </button>
              </div>

              {errorMsg && (
                <div className="auth-alert error">
                  <IconAlertTriangle size={16} /> {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="auth-alert success">
                  <IconCheckCircle size={16} /> {successMsg}
                </div>
              )}

              <form onSubmit={handleAuth} className="auth-form">
                {mode === 'signup' && (
                  <div className="auth-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder={t('enterNamePlaceholder')}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="auth-form-group">
                    <label>프로젝트 권한</label>
                    <select value={projectRole} onChange={(e) => setProjectRole(e.target.value as ProjectRole)}>
                      {PROJECT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                )}

                <div className="auth-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder={t('enterEmailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="auth-form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                  {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In & Add Account' : 'Register & Add Account'}
                </button>
              </form>

              <section className="account-role-section" aria-label="프로젝트 권한 관리">
                <div className="account-role-heading">
                  <strong>계정별 프로젝트 권한</strong>
                  <p>직무와 별도로 프로젝트에서 수행할 수 있는 범위를 정합니다.</p>
                </div>
                <div className="account-role-list">
                  {signedInAccounts.map((account) => (
                    <div className="account-role-row" key={account.id}>
                      <img src={account.avatar} alt="" />
                      <div className="account-role-user">
                        <strong>{account.name}</strong>
                        <span>{account.email}</span>
                      </div>
                      <select
                        aria-label={`${account.name} 프로젝트 권한`}
                        value={account.projectRole || 'Project Member'}
                        onChange={async (e) => {
                          const saved = await updateAccountProjectRole(account.id, e.target.value as ProjectRole);
                          if (saved) setSuccessMsg(`${account.name}의 프로젝트 권한을 저장했습니다.`);
                        }}
                      >
                        {PROJECT_ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </section>

              {/* Demo Quick Account Switcher */}
              <div className="demo-users-section">
                <span>Or select team member account:</span>
                <div className="demo-user-chips">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      className={`demo-user-chip ${u.id === currentUser.id ? 'active' : ''}`}
                      onClick={() => {
                        addSignedInAccount(u);
                        onClose();
                      }}
                    >
                      <img src={u.avatar} alt={u.name} className="chip-avatar" />
                      <span>{u.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
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
