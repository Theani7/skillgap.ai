import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, LogIn, AlertCircle, Lock, User } from 'lucide-react';
import AuthShell from '../components/AuthShell';

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
        credentials: 'include',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await res.json();
      if (res.ok) {
        await login();
        navigate('/app');
      } else {
        setError(data.detail?.[0]?.msg || data.detail || 'Invalid username or password.');
      }
    } catch (_err) {
      setError('Unable to reach the server. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      New here?{' '}
      <Link to="/register">Create an account →</Link>
    </>
  );

  return (
    <AuthShell
      eyebrow="Sign in"
      title="Welcome back"
      subtitle="Pick up where you left off — your analyses, applications, and roadmaps are waiting."
      footer={footer}
    >
      {error && (
        <div className="auth-error" role="alert">
          <span className="auth-error-icon" aria-hidden="true">!</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-stack" noValidate>
        <div className="auth-field">
          <label className="auth-field-label" htmlFor="login-username">Username</label>
          <div className="auth-input-wrap">
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="your-username"
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
          <label className="auth-field-label" htmlFor="login-password">
            Password
          </label>
          <div className="auth-input-wrap">
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="auth-input has-icon"
              style={{ paddingLeft: '40px' }}
            />
            <Lock size={16} style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-light)', pointerEvents: 'none',
            }} />
          </div>
        </div>

        <button type="submit" className="auth-submit" disabled={loading || !username || !password}>
          {loading ? (
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
      </form>
    </AuthShell>
  );
};

export default Login;
