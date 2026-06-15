import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import {
  ArrowRight, UserPlus, Mail, Lock, User,
  Check, X, Eye, EyeOff, CheckCircle,
} from 'lucide-react';
import AuthShell from '../components/AuthShell';

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

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const navigate = useNavigate();

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return undefined;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const res = await fetch(`${API_URL}/api/auth/check-username/${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch (_err) {
        setUsernameStatus('idle');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') return;
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          full_name: `${firstName} ${lastName}`.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login', { state: { justRegistered: true } });
      } else {
        let msg = data.error || data.detail;
        if (Array.isArray(msg)) {
          msg = msg.map(e => e.msg || e).join('. ');
        } else if (!msg) {
          msg = 'Registration failed. Please check your details and try again.';
        }
        setError(msg);
      }
    } catch (_err) {
      setError('Unable to reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(password);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const canSubmit =
    username.length >= 3 &&
    usernameStatus === 'available' &&
    password.length >= 8 &&
    passwordsMatch &&
    firstName && lastName && email &&
    !loading;

  const footer = (
    <>
      Already have an account?{' '}
      <Link to="/login">Sign in →</Link>
    </>
  );

  const usernameBorderColor =
    usernameStatus === 'taken' ? 'var(--color-error)'
    : usernameStatus === 'available' ? 'var(--color-success)'
    : undefined;

  const confirmBorderColor =
    passwordsMatch ? 'var(--color-success)'
    : passwordsMismatch ? 'var(--color-error)'
    : undefined;

  return (
    <AuthShell
      eyebrow="Create account"
      title="Set up your workspace"
      subtitle="One account, free to use. Your analyses and progress history stay tied to this email."
      footer={footer}
    >
      {error && (
        <div className="auth-error" role="alert">
          <span className="auth-error-icon" aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>
        <div className="auth-row-2">
          <div className="auth-field">
            <label className="auth-field-label" htmlFor="reg-first">First name</label>
            <div className="auth-input-wrap">
              <input
                id="reg-first" type="text" value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required autoComplete="given-name"
                placeholder="First"
                className="auth-input has-icon"
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-light)', pointerEvents: 'none',
              }} />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field-label" htmlFor="reg-last">Last name</label>
            <div className="auth-input-wrap">
              <input
                id="reg-last" type="text" value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required autoComplete="family-name"
                placeholder="Last"
                className="auth-input has-icon"
                style={{ paddingLeft: '40px' }}
              />
              <User size={16} style={{
                position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-light)', pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-field-label" htmlFor="reg-username">
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
              id="reg-username" type="text" value={username}
              onChange={(e) => setUsername(e.target.value)}
              required minLength={3} autoComplete="username"
              placeholder="choose-a-handle"
              className="auth-input has-icon"
              style={{
                paddingLeft: '40px', paddingRight: usernameStatus === 'idle' ? '14px' : '40px',
                borderColor: usernameBorderColor,
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
          {usernameStatus === 'idle' && username.length > 0 && username.length < 3 && (
            <p className="auth-hint auth-hint-muted">Minimum 3 characters.</p>
          )}
        </div>

        <div className="auth-field">
          <label className="auth-field-label" htmlFor="reg-email">Email</label>
          <div className="auth-input-wrap">
            <input
              id="reg-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required autoComplete="email"
              placeholder="you@example.com"
              className="auth-input has-icon"
              style={{ paddingLeft: '40px' }}
            />
            <Mail size={16} style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-light)', pointerEvents: 'none',
            }} />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-field-label" htmlFor="reg-password">
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
              id="reg-password"
              type={showPasswords ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required minLength={8} autoComplete="new-password"
              placeholder="At least 8 characters"
              className="auth-input has-icon"
              style={{ paddingLeft: '40px' }}
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
          <label className="auth-field-label" htmlFor="reg-confirm">
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
              id="reg-confirm"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={8} autoComplete="new-password"
              placeholder="Re-enter your password"
              className="auth-input has-icon"
              style={{
                paddingLeft: '40px',
                paddingRight: (passwordsMatch || passwordsMismatch) ? '40px' : '14px',
                borderColor: confirmBorderColor,
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

        <button type="submit" className="auth-submit" disabled={!canSubmit}>
          {loading ? (
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

        <p className="auth-terms">
          By creating an account you agree to our Terms of Service and Privacy Policy. Free to use, no subscription, no card.
        </p>
      </form>
    </AuthShell>
  );
};

export default Register;
