import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Zap, Sparkles, Briefcase, FileText, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { user } = useAuth();
    const location = useLocation();
    
    const isActiveLink = (path) => location.pathname === path;

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="clay-nav shadow-clay-card"
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Link to={user ? "/app" : "/"} className="clay-logo">
                    <div className="clay-logo-icon">
                        <Zap size={20} fill="white" />
                    </div>
                    <span>SkillGap.ai</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    {user ? (
                        <>
                            <Link to="/app" className={`clay-nav-link ${isActiveLink('/app') ? 'active' : ''}`}>
                                <Sparkles size={16} />
                                <span className="hidden sm:inline">Analyzer</span>
                            </Link>
                            <Link to="/jobs" className={`clay-nav-link ${isActiveLink('/jobs') ? 'active' : ''}`}>
                                <Briefcase size={16} />
                                <span className="hidden sm:inline">Jobs</span>
                            </Link>
                            <Link to="/cover-letter" className={`clay-nav-link ${isActiveLink('/cover-letter') ? 'active' : ''}`}>
                                <FileText size={16} />
                                <span className="hidden sm:inline">Cover Letter</span>
                            </Link>
                            <Link to="/settings" className={`clay-nav-link ${isActiveLink('/settings') ? 'active' : ''}`}>
                                <Settings size={16} />
                                <span className="hidden sm:inline">Settings</span>
                            </Link>
                            {user.role === 'admin' ? (
                                <Link to="/admin" className={`clay-nav-link ${isActiveLink('/admin') ? 'active' : ''}`}>
                                    Admin Hub
                                </Link>
                            ) : (
                                <Link to="/profile" className={`clay-nav-link ${isActiveLink('/profile') ? 'active' : ''}`}>
                                    <UserIcon size={16} />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`clay-nav-link ${isActiveLink('/login') ? 'active' : ''}`}>
                                Log In
                            </Link>
                            <Link to="/register" className="clay-btn clay-btn-primary clay-btn-sm shadow-clay-button" style={{ marginLeft: 'var(--spacing-sm)' }}>
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;