import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { useAuth } from '../context/AuthContext';
import { Lock, Zap } from 'lucide-react';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text)',
  background: 'var(--color-surface)',
  outline: 'none',
  transition: 'border-color 150ms ease',
  height: '44px',
  boxSizing: 'border-box',
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await res.json();
      if (res.ok) {
        await login(data.access_token, data.refresh_token);
        navigate('/app');
      } else {
        setError(data.detail?.[0]?.msg || data.detail || 'Login failed');
      }
    } catch {
      setError('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
            <Link to="/register" style={{
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)',
              color: 'white', background: 'var(--color-text)',
              padding: '8px 18px', borderRadius: 'var(--radius-lg)', textDecoration: 'none',
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div className="card" style={{ padding: '40px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 style={{
                fontSize: '22px', fontWeight: 700, color: 'var(--color-text)',
                margin: '0 0 4px',
              }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
                Sign in to your account
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', height: '44px', padding: '0 20px',
                borderRadius: 'var(--radius-lg)', border: 'none',
                background: loading ? 'var(--color-text-light)' : 'var(--color-text)',
                color: 'white', fontWeight: 600, fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 150ms ease',
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
                  Signing in...
                </span>
              ) : (
                <><Lock size={15} /> Sign In</>
              )}
            </button>

            <p style={{
              textAlign: 'center', fontSize: '13px',
              color: 'var(--color-text-muted)', margin: '4px 0 0',
            }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
