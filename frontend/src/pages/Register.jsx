import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { UserPlus, Zap, Eye, EyeOff, Check, X, Loader } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color 150ms ease, box-shadow 150ms ease',
  height: '44px',
  boxSizing: 'border-box',
};

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
const strengthColor = ['', 'var(--color-error)', 'var(--color-error)', 'var(--color-warning)', '#4F46E5', 'var(--color-success)'];

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle | checking | available | taken
  const navigate = useNavigate();

  // Debounced username check
  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus('idle');
      return;
    }
    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const res = await fetch(`${API_URL}/api/auth/check-username/${encodeURIComponent(username)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus('idle');
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (usernameStatus === 'taken') return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
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
        navigate('/login');
      } else {
        setError(data.detail?.[0]?.msg || data.detail || 'Registration failed');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(password);
  const canSubmit = username.length >= 3 && usernameStatus === 'available' && password.length >= 6 && firstName && lastName && email;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--color-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px', width: '400px', height: '400px',
        borderRadius: '50%', opacity: 0.08, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-120px', left: '-120px', width: '400px', height: '400px',
        borderRadius: '50%', opacity: 0.06, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      {/* Top bar */}
      <div style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div className="container flex items-center justify-between" style={{ height: '56px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '5px',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={13} color="white" />
            </div>
            <span style={{ fontWeight: 'var(--font-extrabold)', fontSize: '15px', color: 'var(--color-text)', letterSpacing: 'var(--tracking-tight)' }}>
              SkillGap.ai
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/login" style={{
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)',
              color: 'white', background: 'var(--color-text)',
              padding: '8px 18px', borderRadius: 'var(--radius-lg)', textDecoration: 'none',
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div className="card" style={{ padding: '36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{
                fontSize: '22px', fontWeight: 700, color: 'var(--color-text)',
                margin: '0 0 4px',
              }}>
                Create account
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                Start your career transformation
              </p>
            </div>

            {error && (
              <div style={{
                background: 'var(--color-error-light)',
                color: 'var(--color-error)',
                fontSize: '13px', fontWeight: 500,
                padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                marginBottom: '20px', textAlign: 'center',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* First + Last Name */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="First"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Last"
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
              </div>

              {/* Username with availability */}
              <div>
                <label className="label">Username</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    placeholder="Choose a username"
                    style={{
                      ...inputStyle,
                      paddingRight: '40px',
                      borderColor: usernameStatus === 'taken' ? 'var(--color-error)' :
                                   usernameStatus === 'available' ? 'var(--color-success)' :
                                   username.length >= 3 && usernameStatus === 'idle' ? 'var(--color-border)' : 'var(--color-border)',
                    }}
                    onFocus={(e) => {
                      if (usernameStatus !== 'taken' && usernameStatus !== 'available') {
                        e.target.style.borderColor = 'var(--color-primary)';
                      }
                    }}
                    onBlur={(e) => {
                      if (usernameStatus !== 'taken' && usernameStatus !== 'available') {
                        e.target.style.borderColor = 'var(--color-border)';
                      }
                    }}
                  />
                  {/* Status icon */}
                  <div style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}>
                    {usernameStatus === 'checking' && (
                      <Loader size={16} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--color-text-light)' }} />
                    )}
                    {usernameStatus === 'available' && (
                      <Check size={16} color="var(--color-success)" />
                    )}
                    {usernameStatus === 'taken' && (
                      <X size={16} color="var(--color-error)" />
                    )}
                  </div>
                </div>
                {usernameStatus === 'taken' && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-error)' }}>
                    Username is already taken
                  </p>
                )}
                {usernameStatus === 'available' && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-success)' }}>
                    Username is available
                  </p>
                )}
                {username.length > 0 && username.length < 3 && usernameStatus === 'idle' && (
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-light)' }}>
                    Minimum 3 characters
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              {/* Password with strength */}
              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Create a password"
                    style={{
                      ...inputStyle,
                      paddingRight: '40px',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--color-text-light)', padding: '4px',
                      display: 'flex', alignItems: 'center',
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{
                      height: '4px', borderRadius: '2px', background: 'var(--color-border)',
                      overflow: 'hidden', marginBottom: '4px',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${(strength / 5) * 100}%`,
                        background: strengthColor[strength],
                        transition: 'width 200ms ease, background 200ms ease',
                      }} />
                    </div>
                    <p style={{
                      margin: 0, fontSize: '11px', fontWeight: 500,
                      color: strengthColor[strength] || 'var(--color-text-light)',
                    }}>
                      {strengthLabel[strength]}
                      {strength < 5 && strength > 0 && ` — add uppercase, numbers, or symbols for a stronger password`}
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !canSubmit}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', height: '44px', padding: '0 20px',
                  borderRadius: 'var(--radius-lg)', border: 'none',
                  background: !canSubmit ? 'var(--color-border)' :
                              loading ? 'var(--color-text-light)' : 'var(--color-text)',
                  color: !canSubmit ? 'var(--color-text-light)' : 'white',
                  fontWeight: 600, fontSize: '14px',
                  cursor: !canSubmit || loading ? 'not-allowed' : 'pointer',
                  transition: 'background 150ms ease',
                  marginTop: '4px',
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '14px', height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white', borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    Creating account...
                  </span>
                ) : (
                  <><UserPlus size={15} /> Create Account</>
                )}
              </button>

              <p style={{
                textAlign: 'center', fontSize: '13px',
                color: 'var(--color-text-muted)', margin: '4px 0 0',
              }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
