import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, ArrowRight, CheckCircle2, Sparkles, FileText, Briefcase, TrendingUp, Users, Shield, Rocket, Star } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Landing = () => {
    const features = [
        { icon: FileText, title: 'Resume Analysis', desc: 'AI-powered resume parsing and scoring', color: '#7C3AED' },
        { icon: Target, title: 'Skill Gap Detection', desc: 'Identify missing skills for your target role', color: '#0EA5E9' },
        { icon: BookOpen, title: 'Learning Roadmap', desc: 'Personalized curriculum to close gaps', color: '#22C55E' },
        { icon: Briefcase, title: 'Job Tracking', desc: 'Manage all your applications in one place', color: '#F59E0B' },
    ];

    const stats = [
        { value: '10K+', label: 'Resumes Analyzed' },
        { value: '500+', label: 'Job Roles Supported' },
        { value: '95%', label: 'User Satisfaction' },
        { value: '24/7', label: 'AI Assistance' },
    ];

    const testimonials = [
        { name: 'Sarah M.', role: 'Software Engineer at Google', text: 'Land my dream job! The roadmap was exactly what I needed.', avatar: 'S' },
        { name: 'James K.', role: 'Data Scientist at Meta', text: 'Finally understood what skills I was missing. Highly recommend!', avatar: 'J' },
        { name: 'Priya P.', role: 'Product Manager at Amazon', text: 'From resume to offer in 3 months. This tool is a game changer!', avatar: 'P' },
    ];

    return (
        <div style={{ minHeight: '100vh' }}>
            {/* Nav */}
            <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 'var(--spacing-lg) var(--spacing-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={20} fill="white" color="white" />
                    </div>
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem', fontFamily: 'var(--font-display)' }}>SkillGap.ai</span>
                </Link>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
                    <Link to="/login" style={{ padding: '10px 20px', color: 'var(--clay-foreground)', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
                    <Link to="/register" className="clay-btn clay-btn-primary shadow-clay-button">Get Started</Link>
                </div>
            </nav>

            {/* Hero */}
            <section style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px var(--spacing-xl) var(--spacing-xl)', position: 'relative', overflow: 'hidden' }}>
                {/* Background gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 20%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)', pointerEvents: 'none' }} />
                
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '900px', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <motion.div variants={fadeInUp}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(124, 58, 237, 0.1)', borderRadius: '50px', color: '#7C3AED', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--spacing-lg)' }}>
                            <Sparkles size={14} /> AI-Powered Career Platform
                        </span>
                    </motion.div>

                    <motion.h1 variants={fadeInUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, marginBottom: 'var(--spacing-lg)', lineHeight: 1.1, fontFamily: 'var(--font-display)' }}>
                        Land Your <span style={{ background: 'linear-gradient(135deg, #7C3AED, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dream Job</span> Faster
                    </motion.h1>

                    <motion.p variants={fadeInUp} style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-xl)', maxWidth: '600px', margin: '0 auto var(--spacing-xl)', lineHeight: 1.7 }}>
                        Analyze your resume, discover skill gaps, get personalized learning paths, and track your job applications — all in one AI-powered platform.
                    </motion.p>

                    <motion.div variants={fadeInUp} style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" className="clay-btn clay-btn-primary shadow-clay-button" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                            Start Free <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="clay-btn clay-btn-secondary" style={{ padding: '14px 32px', fontSize: '1.1rem' }}>
                            See How It Works
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats */}
            <section style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)', background: 'var(--clay-bg)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
                    {stats.map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#7C3AED', fontFamily: 'var(--font-display)' }}>{stat.value}</div>
                            <div style={{ color: 'var(--clay-muted)', fontWeight: 500 }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--spacing-sm)', fontFamily: 'var(--font-display)' }}>Everything You Need</h2>
                        <p style={{ color: 'var(--clay-muted)', fontSize: '1.1rem' }}>Complete toolkit to accelerate your career growth</p>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        {features.map((feature, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} whileHover={{ y: -5 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', background: `${feature.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--spacing-md)' }}>
                                    <feature.icon size={28} color={feature.color} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--clay-muted)', lineHeight: 1.6 }}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)', background: 'var(--clay-bg)' }}>
                <div className="container">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--spacing-sm)', fontFamily: 'var(--font-display)' }}>Loved by Job Seekers</h2>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-lg)' }}>
                        {testimonials.map((t, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)' }}>
                                <div style={{ display: 'flex', gap: '4px', marginBottom: 'var(--spacing-md)' }}>
                                    {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="#F59E0B" color="#F59E0B" />)}
                                </div>
                                <p style={{ fontSize: '1.1rem', lineHeight: 1.7, marginBottom: 'var(--spacing-lg)', fontStyle: 'italic' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>{t.avatar}</div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>{t.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--clay-muted)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)', textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 'var(--spacing-md)', fontFamily: 'var(--font-display)' }}>Ready to Accelerate Your Career?</h2>
                    <p style={{ color: 'var(--clay-muted)', fontSize: '1.1rem', marginBottom: 'var(--spacing-xl)' }}>Join thousands of job seekers who used SkillGap.ai to land their dream jobs.</p>
                    <Link to="/register" className="clay-btn clay-btn-primary shadow-clay-button" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
                        Get Started Free <Rocket size={20} />
                    </Link>
                </motion.div>
            </section>

            {/* Footer */}
            <footer style={{ padding: 'var(--spacing-xl) var(--spacing-xl)', borderTop: '1px solid var(--clay-border)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={16} fill="white" color="white" />
                    </div>
                    <span style={{ fontWeight: 'bold' }}>SkillGap.ai</span>
                </div>
                <p style={{ color: 'var(--clay-muted)', fontSize: '0.875rem' }}>© 2026 SkillGap.ai — All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;