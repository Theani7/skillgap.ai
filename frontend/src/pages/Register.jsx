import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../services/env';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, full_name: fullName })
            });

            const data = await res.json();

            if (res.ok) {
                navigate('/login');
            } else {
                const errorMsg = data.detail?.[0]?.msg || data.detail || 'Registration failed';
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
                            className="clay-icon clay-icon-pink"
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: 'var(--radius-lg)',
                                margin: '0 auto var(--spacing-md)'
                            }}
                        >
                            <UserPlus size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-xs)' }}>Create Account</h2>
                        <p style={{ color: 'var(--clay-muted)', margin: 0 }}>Start your career transformation</p>
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
                        {/* Full Name Input */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-xs)',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'var(--clay-foreground)'
                            }}>
                                Full Name
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
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    placeholder="Enter your full name"
                                    className="clay-input"
                                    style={{ paddingLeft: '48px' }}
                                />
                            </div>
                        </div>

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
                                    placeholder="Choose a username"
                                    className="clay-input"
                                    style={{ paddingLeft: '48px' }}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: 'var(--spacing-xs)',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                color: 'var(--clay-foreground)'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={20} style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 'var(--spacing-md)',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--clay-muted)',
                                    pointerEvents: 'none'
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Enter your email"
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
                                    placeholder="Create a password"
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
                                    Creating account...
                                </span>
                            ) : (
                                'Create Account'
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
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: 'var(--clay-accent)',
                                    textDecoration: 'none',
                                    fontWeight: 700
                                }}
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
