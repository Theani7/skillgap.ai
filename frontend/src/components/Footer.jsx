import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Twitter, Github, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="clay-card shadow-clay-card" style={{
            margin: 'var(--spacing-md)',
            marginTop: 'auto',
            padding: 'var(--spacing-2xl) var(--spacing-xl)',
            borderRadius: 'var(--radius-2xl)',
            background: 'rgba(255, 255, 255, 0.7)'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 'var(--spacing-xl)',
                    marginBottom: 'var(--spacing-xl)'
                }}>
                    {/* Brand Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <div className="clay-icon clay-icon-purple" style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px'
                            }}>
                                <Zap size={20} fill="white" />
                            </div>
                            <span style={{
                                fontSize: '1.25rem',
                                fontWeight: 900,
                                color: 'var(--clay-foreground)',
                                letterSpacing: '-0.02em',
                                fontFamily: 'var(--font-display)'
                            }}>
                                SkillGap<span style={{ color: 'var(--clay-accent)' }}>.ai</span>
                            </span>
                        </div>
                        <p style={{
                            color: 'var(--clay-muted)',
                            fontSize: '0.9rem',
                            lineHeight: 1.7,
                            margin: 0
                        }}>
                            Your AI-Driven Career Catalyst. We map your skills, identify the gaps, and build the bridge to your next great opportunity.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                            <a href="#" style={{
                                color: 'var(--clay-muted)',
                                padding: '8px',
                                borderRadius: '12px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} className="hover:bg-purple-50 hover:text-purple-600">
                                <Twitter size={20} />
                            </a>
                            <a href="#" style={{
                                color: 'var(--clay-muted)',
                                padding: '8px',
                                borderRadius: '12px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} className="hover:bg-purple-50 hover:text-purple-600">
                                <Github size={20} />
                            </a>
                            <a href="#" style={{
                                color: 'var(--clay-muted)',
                                padding: '8px',
                                borderRadius: '12px',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }} className="hover:bg-purple-50 hover:text-purple-600">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <h4 style={{
                            color: 'var(--clay-foreground)',
                            fontSize: '1rem',
                            fontWeight: 800,
                            marginBottom: 'var(--spacing-xs)',
                            fontFamily: 'var(--font-display)'
                        }}>Product</h4>
                        <Link to="/app" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Analyzer</Link>
                        <Link to="/" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Features</Link>
                        <Link to="/" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Pricing</Link>
                    </div>

                    {/* Resources Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <h4 style={{
                            color: 'var(--clay-foreground)',
                            fontSize: '1rem',
                            fontWeight: 800,
                            marginBottom: 'var(--spacing-xs)',
                            fontFamily: 'var(--font-display)'
                        }}>Resources</h4>
                        <a href="#" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Documentation</a>
                        <a href="#" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Blog</a>
                        <a href="#" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">API (Coming Soon)</a>
                    </div>

                    {/* Legal Links */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        <h4 style={{
                            color: 'var(--clay-foreground)',
                            fontSize: '1rem',
                            fontWeight: 800,
                            marginBottom: 'var(--spacing-xs)',
                            fontFamily: 'var(--font-display)'
                        }}>Company</h4>
                        <a href="#" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">About Us</a>
                        <a href="#" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Privacy Policy</a>
                        <a href="#" style={{
                            color: 'var(--clay-muted)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            transition: 'color 0.2s'
                        }} className="hover:text-clay-accent">Terms of Service</a>
                    </div>
                </div>

                {/* Copyright */}
                <div style={{
                    borderTop: '1px solid rgba(124, 58, 237, 0.1)',
                    paddingTop: 'var(--spacing-lg)',
                    textAlign: 'center'
                }}>
                    <p style={{
                        color: 'var(--clay-muted)',
                        fontSize: '0.85rem',
                        margin: 0
                    }}>
                        &copy; {currentYear} SkillGap.ai Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
