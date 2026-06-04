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
            className="navbar"
            style={{ 
                border: 'none', 
                boxShadow: 'var(--shadow-sm)',
                padding: 'var(--space-4) var(--space-8)',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 'var(--z-sticky)',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                width: '100%',
                maxWidth: '800px'
            }}>
                <Link 
                    to={user ? "/app" : "/"} 
                    style={{ 
                        textDecoration: 'none',
                        color: 'var(--color-neutral-900)',
                        fontWeight: 'var(--font-weight-bold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                    }}
                >
                    <Zap size={20} className="text-primary-600" fill="currentColor" />
                    <span>SkillGap.ai</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                    {user ? (
                        <>
                            <Link to="/app" style={{ 
                                textDecoration: 'none',
                                color: isActiveLink('/app') ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-1.5)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                transition: 'var(--transition-base)'
                            }}>
                                <Sparkles size={16} />
                                <span className="hidden sm:inline">Analyzer</span>
                            </Link>
                            <Link to="/jobs" style={{ 
                                textDecoration: 'none',
                                color: isActiveLink('/jobs') ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-1.5)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                transition: 'var(--transition-base)'
                            }}>
                                <Briefcase size={16} />
                                <span className="hidden sm:inline">Jobs</span>
                            </Link>
                            <Link to="/cover-letter" style={{ 
                                textDecoration: 'none',
                                color: isActiveLink('/cover-letter') ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-1.5)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                transition: 'var(--transition-base)'
                            }}>
                                <FileText size={16} />
                                <span className="hidden sm:inline">Cover Letter</span>
                            </Link>
                            <Link to="/settings" style={{ 
                                textDecoration: 'none',
                                color: isActiveLink('/settings') ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-1.5)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                transition: 'var(--transition-base)'
                            }}>
                                <Settings size={16} />
                                <span className="hidden sm:inline">Settings</span>
                            </Link>
                            {user.role === 'admin' ? (
                                <Link to="/admin" style={{ 
                                    textDecoration: 'none',
                                    color: isActiveLink('/admin') ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    transition: 'var(--transition-base)'
                                }}>
                                    Admin
                                </Link>
                            ) : (
                                <Link to="/profile" style={{ 
                                    textDecoration: 'none',
                                    color: isActiveLink('/profile') ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-1.5)',
                                    fontSize: 'var(--font-size-sm)',
                                    fontWeight: 'var(--font-weight-medium)',
                                    transition: 'var(--transition-base)'
                                }}>
                                    <UserIcon size={16} />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Link>
                            )}
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ 
                                textDecoration: 'none',
                                color: 'var(--color-neutral-600)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: 'var(--font-weight-medium)',
                                transition: 'var(--transition-base)'
                            }}>
                                Log In
                            </Link>
                            <Link to="/register" className="btn btn-primary" style={{ 
                                padding: 'var(--space-2) var(--space-4)',
                                minHeight: 'unset',
                                fontSize: 'var(--font-size-sm)'
                            }}>
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
