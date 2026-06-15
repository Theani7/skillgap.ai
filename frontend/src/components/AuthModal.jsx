import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Lock, Mail, UserPlus, LogIn, ArrowRight, Check, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { API_URL } from '../services/env';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const getStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  return Math.min(score, 5);
};

const strengthLabel = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', 'var(--color-error)', 'var(--color-error)', 'var(--color-warning)', 'var(--color-primary)', 'var(--color-success)'];

const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('idle');

  // Reset form when tab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setLoginUsername('');
      setLoginPassword('');
      setLoginError('');
      setFirstName('');
      setLastName('');
      setRegUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRegError('');
      setUsernameStatus('idle');
    }
  }, [isOpen, initialTab]);

  // Username availability check
  useEffect(() => {
    if (regUsername.length < 3) {
      setUsernameStatus('idle');
      return undefined;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const res = await fetch(`${API_URL}/api/auth/check-username/${encodeURIComponent(regUsername)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch (_err) {
        setUsernameStatus('idle');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [regUsername]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', loginUsername);
    formData.append('password', loginPassword);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await res.json();
      if (res.ok) {
        await login();
        onClose();
        navigate('/app');
      } else {
        setLoginError(data.detail?.[0]?.msg || data.detail || 'Invalid username or password.');
      }
    } catch (_err) {
      setLoginError('Unable to reach the server. Check your connection and try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') return;
    if (password !== confirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }
    setRegError('');
    setRegLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          email,
          password,
          full_name: `${firstName} ${lastName}`.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        await login();
        onClose();
        navigate('/app');
      } else {
        let msg = data.error || data.detail;
        if (Array.isArray(msg)) {
          msg = msg.map(e => e.msg || e).join('. ');
        } else if (!msg) {
          msg = 'Registration failed. Please check your details and try again.';
        }
        setRegError(msg);
      }
    } catch (_err) {
      setRegError('Unable to reach the server. Check your connection and try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const strength = getStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canRegister =
    regUsername.length >= 3 &&
    usernameStatus === 'available' &&
    password.length >= 8 &&
    passwordsMatch &&
    firstName && email &&
    !regLoading;

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label={activeTab === 'login' ? 'Sign in' : 'Create account'}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        
        <div className="auth-modal-body">
          <div className="auth-modal-tabs">
            <button
              className={`auth-modal-tab ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button
              className={`auth-modal-tab ${activeTab === 'register' ? 'active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Create account
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="auth-modal-form" noValidate>
              {loginError && (
                <div className="auth-modal-error" role="alert">
                  <span className="auth-modal-error-icon" aria-hidden="true">!</span>
                  <span>{loginError}</span>
                </div>
              )}

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="modal-login-username">Username</label>
                <div className="auth-input-wrap">
                  <input
                    id="modal-login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="your-username"
                    className="auth-input has-icon"
                  />
                  <User size={16} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)', pointerEvents: 'none',
                  }} />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="modal-login-password">Password</label>
                <div className="auth-input-wrap">
                  <input
                    id="modal-login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="auth-input has-icon"
                  />
                  <Lock size={16} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)', pointerEvents: 'none',
                  }} />
                </div>
              </div>

              <button type="submit" className="auth-modal-submit" disabled={loginLoading || !loginUsername || !loginPassword}>
                {loginLoading ? (
                  <>
                    <span className="spinner-btn" aria-hidden="true" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Sign in
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="auth-modal-footer">
                New here?{' '}
                <span className="auth-modal-footer-link" onClick={() => setActiveTab('register')}>
                  Create an account
                </span>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-modal-form">
              {regError && (
                <div className="auth-modal-error" role="alert">
                  <span className="auth-modal-error-icon" aria-hidden="true">!</span>
                  <span>{regError}</span>
                </div>
              )}

              <div className="auth-row-2">
                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="modal-reg-first">First name</label>
                  <div className="auth-input-wrap">
                    <input
                      id="modal-reg-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                      placeholder="First"
                      className="auth-input has-icon"
                    />
                    <User size={16} style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-light)', pointerEvents: 'none',
                    }} />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-field-label" htmlFor="modal-reg-last">Last name <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span></label>
                  <div className="auth-input-wrap">
                    <input
                      id="modal-reg-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      placeholder="Last"
                      className="auth-input has-icon"
                    />
                    <User size={16} style={{
                      position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-light)', pointerEvents: 'none',
                    }} />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="modal-reg-username">
                  Username
                  {usernameStatus === 'available' && (
                    <span className="auth-hint auth-hint-success" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={11} /> Available
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="auth-hint auth-hint-error" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <X size={11} /> Taken
                    </span>
                  )}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="modal-reg-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    minLength={3}
                    autoComplete="username"
                    placeholder="choose-a-handle"
                    className="auth-input has-icon"
                    style={{
                      paddingRight: usernameStatus === 'idle' ? '14px' : '40px',
                    }}
                  />
                  <span style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)', pointerEvents: 'none', fontWeight: 600, fontSize: '14px',
                  }}>@</span>
                  <div className="auth-input-status">
                    {usernameStatus === 'checking' && <span className="spinner" />}
                    {usernameStatus === 'available' && <Check size={16} color="var(--color-success)" />}
                    {usernameStatus === 'taken' && <X size={16} color="var(--color-error)" />}
                  </div>
                </div>
                {usernameStatus === 'idle' && regUsername.length > 0 && regUsername.length < 3 && (
                  <p className="auth-hint auth-hint-muted">Minimum 3 characters.</p>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="modal-reg-email">Email</label>
                <div className="auth-input-wrap">
                  <input
                    id="modal-reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="auth-input has-icon"
                  />
                  <Mail size={16} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)', pointerEvents: 'none',
                  }} />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="modal-reg-password">
                  Password
                  <button
                    type="button"
                    onClick={() => setShowPasswords((s) => !s)}
                    className="auth-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    tabIndex={-1}
                  >
                    {showPasswords ? <EyeOff size={12} /> : <Eye size={12} />}
                    {showPasswords ? 'Hide' : 'Show'}
                  </button>
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="modal-reg-password"
                    type={showPasswords ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="auth-input has-icon"
                  />
                  <Lock size={16} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)', pointerEvents: 'none',
                  }} />
                </div>

                {password.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <div className="auth-password-strength">
                      <div
                        className="auth-password-strength-bar"
                        style={{
                          width: `${(strength / 5) * 100}%`,
                          background: strengthColor[strength],
                        }}
                      />
                    </div>
                    <p className="auth-hint" style={{ color: strengthColor[strength] || 'var(--color-text-light)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {strength >= 4 ? <CheckCircle size={12} /> : null}
                      {strengthLabel[strength]}
                      {strength < 5 && strength > 0 && (
                        <span className="auth-hint-muted">- try mixing uppercase, numbers, and symbols.</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label className="auth-field-label" htmlFor="modal-reg-confirm">
                  Confirm password
                  {passwordsMatch && (
                    <span className="auth-hint auth-hint-success" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={11} /> Matches
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="auth-hint auth-hint-error" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <X size={11} /> Doesn't match
                    </span>
                  )}
                </label>
                <div className="auth-input-wrap">
                  <input
                    id="modal-reg-confirm"
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    className="auth-input has-icon"
                    style={{
                      paddingRight: (passwordsMatch || passwordsMismatch) ? '40px' : '14px',
                    }}
                  />
                  <Lock size={16} style={{
                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--color-text-light)', pointerEvents: 'none',
                  }} />
                  <div className="auth-input-status">
                    {passwordsMatch && <Check size={16} color="var(--color-success)" />}
                    {passwordsMismatch && <X size={16} color="var(--color-error)" />}
                  </div>
                </div>
                {passwordsMismatch && (
                  <p className="auth-hint auth-hint-error">Passwords do not match - please re-enter.</p>
                )}
              </div>

              <button type="submit" className="auth-modal-submit" disabled={!canRegister}>
                {regLoading ? (
                  <>
                    <span className="spinner-btn" aria-hidden="true" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    Create account
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="auth-modal-footer">
                Already have an account?{' '}
                <span className="auth-modal-footer-link" onClick={() => setActiveTab('login')}>
                  Sign in
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
