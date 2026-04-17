import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Zap } from 'lucide-react';

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
                body: formData.toString()
            });

            const data = await res.json();

            if (res.ok) {
                login(data.access_token, data.role, data.username, data.full_name);
                navigate('/app');
            } else {
                const errorMsg = data.detail?.[0]?.msg || data.detail || 'Login failed';
                setError(errorMsg);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Unable to connect to server. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="clay-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)' }}>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                style={{ width: '100%', maxWidth: '420px' }}
            >
                <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-2xl)' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                        <div
                            className="clay-icon clay-icon-purple"
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: 'var(--radius-lg)',
                                margin: '0 auto var(--spacing-md)'
                            }}
                        >
                            <Zap size={32} fill="white" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-xs)' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--clay-muted)', margin: 0 }}>Sign in to continue your journey</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            color: '#DC2626',
                            marginBottom: 'var(--spacing-md)',
                            textAlign: 'center',
                            background: 'rgba(220, 38, 38, 0.08)',
                            padding: 'var(--spacing-sm) var(--spacing-md)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.9rem',
                            fontWeight: 500
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {/* Username Input */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-xs)',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'var(--clay-foreground)'
                            }}>
                                Username
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={20} style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 'var(--spacing-md)',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--clay-muted)',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter your username"
                                    className="clay-input"
                                    style={{ paddingLeft: '48px' }}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-xs)',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'var(--clay-foreground)'
                            }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={20} style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 'var(--spacing-md)',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--clay-muted)',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter your password"
                                    className="clay-input"
                                    style={{ paddingLeft: '48px' }}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="clay-btn clay-btn-primary shadow-clay-button"
                            disabled={loading}
                            style={{ width: '100%', marginTop: 'var(--spacing-sm)' }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                    <span className="animate-spin" style={{
                                        width: '20px',
                                        height: '20px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%'
                                    }} />
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Footer Link */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: 'var(--spacing-md)',
                            marginBottom: 0,
                            color: 'var(--clay-muted)',
                            fontSize: '0.95rem'
                        }}>
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: 'var(--clay-accent)',
                                    textDecoration: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Register here
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
