import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import { useAether } from '../../context/AetherContextValue';
import { IconX, IconCheckCircle, IconAlertTriangle } from '../common/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { authUser, isAuthLoading, currentUser, setCurrentUser, users } = useAether();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase credentials not configured in .env file.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        setSuccessMsg(`Welcome back, ${data.user.email}!`);
        setTimeout(() => onClose(), 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase credentials not configured in .env file.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split('@')[0] },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user) {
        setSuccessMsg('Account created successfully! Check your email for confirmation link.');
        setTimeout(() => onClose(), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign up.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="release-icon">🔐</span>
            <div>
              <h2 className="modal-title">Supabase Authentication & Account</h2>
              <p className="modal-subtitle">
                {authUser ? `Signed in as ${authUser.email}` : 'Sign in to access your team workspace'}
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
          ) : authUser ? (
            /* Signed in user view */
            <div className="signed-in-box">
              <img src={authUser.avatar} alt={authUser.name} className="signed-in-avatar" />
              <div className="signed-in-info">
                <h3>{authUser.name}</h3>
                <span className="signed-in-email">{authUser.email}</span>
                <span className="signed-in-role-badge">{authUser.role}</span>
              </div>
              <button className="btn-danger-sm" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          ) : (
            /* Auth Form (Sign In / Sign Up) */
            <>
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

              <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="auth-form">
                {mode === 'signup' && (
                  <div className="auth-form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Rivera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="auth-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
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
                  {loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Supabase Account'}
                </button>
              </form>

              {/* Demo Quick User Switcher */}
              <div className="demo-users-section">
                <span>Or switch active profile:</span>
                <div className="demo-user-chips">
                  {users.map((u) => (
                    <button
                      key={u.id}
                      className={`demo-user-chip ${u.id === currentUser.id ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentUser(u);
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
