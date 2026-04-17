import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const isActiveLink = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="clay-nav shadow-clay-card"
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%'
                }}>
                    {/* Logo area */}
                    <Link to={user ? "/app" : "/"} className="clay-logo">
                        <div className="clay-logo-icon">
                            <Zap size={20} fill="white" />
                        </div>
                        <span>SkillGap.ai</span>
                    </Link>

                    {/* Nav links */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)'
                    }}>
                        {user ? (
                            <>
                                <Link
                                    to="/app"
                                    className={`clay-nav-link ${isActiveLink('/app') ? 'active' : ''}`}
                                >
                                    <Sparkles size={16} />
                                    <span className="hidden sm:inline">Analyzer</span>
                                </Link>
                                {user.role === 'admin' ? (
                                    <Link
                                        to="/admin"
                                        className={`clay-nav-link ${isActiveLink('/admin') ? 'active' : ''}`}
                                    >
                                        Admin Hub
                                    </Link>
                                ) : (
                                    <Link
                                        to="/profile"
                                        className={`clay-nav-link ${isActiveLink('/profile') ? 'active' : ''}`}
                                    >
                                        <UserIcon size={16} />
                                        <span className="hidden sm:inline">Dashboard</span>
                                    </Link>
                                )}
                                <button
                                    onClick={() => setShowLogoutConfirm(true)}
                                    className="clay-btn clay-btn-ghost clay-btn-sm"
                                    style={{ marginLeft: 'var(--spacing-sm)' }}
                                >
                                    <LogOut size={16} />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`clay-nav-link ${isActiveLink('/login') ? 'active' : ''}`}
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/register"
                                    className="clay-btn clay-btn-primary clay-btn-sm shadow-clay-button"
                                    style={{ marginLeft: 'var(--spacing-sm)' }}
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </motion.nav>

            {/* Claymorphism Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="clay-overlay">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="clay-modal"
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, #FCA5A5, #EF4444)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto var(--spacing-md)',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                        }}>
                            <LogOut size={28} color="white" />
                        </div>
                        <h3 style={{
                            marginBottom: 'var(--spacing-sm)',
                            fontSize: '1.75rem',
                            textAlign: 'center',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 800
                        }}>
                            Sign Out
                        </h3>
                        <p style={{
                            color: 'var(--clay-muted)',
                            marginBottom: 'var(--spacing-xl)',
                            lineHeight: 1.6,
                            textAlign: 'center'
                        }}>
                            Are you sure you want to end your current session?
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="clay-btn clay-btn-secondary shadow-clay-button"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="clay-btn clay-btn-primary shadow-clay-button"
                                style={{ flex: 1, background: 'linear-gradient(135deg, #FCA5A5, #EF4444)' }}
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default Navbar;
