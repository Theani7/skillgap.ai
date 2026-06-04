import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, ArrowRight, Star, Rocket, FileText, Briefcase } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const Landing = () => {
    const features = [
        { icon: FileText, title: 'Resume Analysis', desc: 'AI-powered resume parsing and scoring', color: 'var(--color-primary-600)' },
        { icon: Target, title: 'Skill Gap Detection', desc: 'Identify missing skills for your target role', color: 'var(--color-secondary-600)' },
        { icon: BookOpen, title: 'Learning Roadmap', desc: 'Personalized curriculum to close gaps', color: 'var(--color-success-600)' },
        { icon: Briefcase, title: 'Job Tracking', desc: 'Manage all your applications in one place', color: 'var(--color-warning-600)' },
    ];

    const stats = [
        { value: '10K+', label: 'Resumes Analyzed' },
        { value: '500+', label: 'Job Roles Supported' },
        { value: '95%', label: 'User Satisfaction' },
        { value: '24/7', label: 'AI Assistance' },
    ];

    const testimonials = [
        { name: 'Sarah M.', role: 'Software Engineer', text: 'Landed my dream job! The roadmap was exactly what I needed.', avatar: 'S' },
        { name: 'James K.', role: 'Data Scientist', text: 'Finally understood what skills I was missing. Highly recommend!', avatar: 'J' },
        { name: 'Priya P.', role: 'Product Manager', text: 'From resume to offer in 3 months. This tool is a game changer!', avatar: 'P' },
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-neutral-50)', color: 'var(--color-neutral-900)', fontFamily: 'var(--font-family-sans)' }}>
            {/* Minimal Nav */}
            <nav style={{ padding: 'var(--space-6) var(--space-8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', textDecoration: 'none', color: 'inherit' }}>
                    <Zap size={24} className="text-primary-600" fill="currentColor" />
                    <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-xl)', letterSpacing: 'var(--letter-spacing-tight)' }}>SkillGap.ai</span>
                </Link>
                <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                    <Link to="/login" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-neutral-600)', textDecoration: 'none' }}>Login</Link>
                    <Link to="/register" style={{ 
                        backgroundColor: 'var(--color-neutral-900)', 
                        color: 'white', 
                        padding: 'var(--space-2) var(--space-5)', 
                        borderRadius: 'var(--border-radius-full)', 
                        fontSize: 'var(--font-size-sm)', 
                        fontWeight: 'var(--font-weight-medium)',
                        textDecoration: 'none'
                    }}>
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ textAlign: 'center', padding: 'var(--space-24) var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <motion.div initial="hidden" animate="visible" variants={staggerContainer} style={{ maxWidth: '800px' }}>
                    <motion.h1 variants={fadeInUp} style={{ 
                        fontSize: 'clamp(2.5rem, 8vw, var(--font-size-5xl))', 
                        fontWeight: 'var(--font-weight-bold)', 
                        letterSpacing: 'var(--letter-spacing-tight)', 
                        lineHeight: 'var(--line-height-tight)',
                        marginBottom: 'var(--space-6)'
                    }}>
                        Close your skill gap. <br/> 
                        <span style={{ color: 'var(--color-primary-600)' }}>Land your dream role.</span>
                    </motion.h1>
                    
                    <motion.p variants={fadeInUp} style={{ 
                        fontSize: 'var(--font-size-lg)', 
                        color: 'var(--color-neutral-500)', 
                        marginBottom: 'var(--space-10)', 
                        maxWidth: '600px', 
                        marginInline: 'auto',
                        lineHeight: 'var(--line-height-relaxed)'
                    }}>
                        AI-powered resume analysis and personalized learning roadmaps designed to accelerate your career growth.
                    </motion.p>
                    
                    <motion.div variants={fadeInUp} style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                        <Link to="/register" style={{ 
                            backgroundColor: 'var(--color-primary-600)', 
                            color: 'white', 
                            padding: 'var(--space-4) var(--space-10)', 
                            borderRadius: 'var(--border-radius-lg)', 
                            fontSize: 'var(--font-size-base)', 
                            fontWeight: 'var(--font-weight-semibold)',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats */}
            <section style={{ padding: 'var(--space-16) var(--space-8)', borderTop: '1px solid var(--color-neutral-200)', borderBottom: '1px solid var(--color-neutral-200)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-12)' }}>
                    {stats.map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-neutral-900)' }}>{stat.value}</div>
                            <div style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginTop: 'var(--space-1)' }}>{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: 'var(--space-24) var(--space-8)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-16)' }}>
                        <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-4)' }}>Everything you need</h2>
                        <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-lg)' }}>A complete toolkit to accelerate your career growth</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-8)' }}>
                        {features.map((feature, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 20 }} 
                                whileInView={{ opacity: 1, y: 0 }} 
                                transition={{ delay: i * 0.1 }} 
                                viewport={{ once: true }}
                                style={{ 
                                    padding: 'var(--space-8)', 
                                    borderRadius: 'var(--border-radius-xl)', 
                                    backgroundColor: 'white',
                                    border: '1px solid var(--color-neutral-200)',
                                    transition: 'all var(--transition-duration-normal)'
                                }}
                            >
                                <div style={{ 
                                    width: 'var(--space-12)', 
                                    height: 'var(--space-12)', 
                                    borderRadius: 'var(--border-radius-lg)', 
                                    backgroundColor: `${feature.color}10`, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    marginBottom: 'var(--space-6)' 
                                }}>
                                    <feature.icon size={24} style={{ color: feature.color }} />
                                </div>
                                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-2)' }}>{feature.title}</h3>
                                <p style={{ color: 'var(--color-neutral-500)', lineHeight: 'var(--line-height-normal)' }}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section style={{ padding: 'var(--space-24) var(--space-8)', backgroundColor: 'var(--color-neutral-100)' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'var(--font-weight-bold)', textAlign: 'center', marginBottom: 'var(--space-16)' }}>Loved by job seekers</h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
                        {testimonials.map((t, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, scale: 0.95 }} 
                                whileInView={{ opacity: 1, scale: 1 }} 
                                viewport={{ once: true }}
                                style={{ 
                                    padding: 'var(--space-8)', 
                                    backgroundColor: 'white', 
                                    borderRadius: 'var(--border-radius-xl)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}
                            >
                                <div style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-4)' }}>
                                    {[1,2,3,4,5].map(s => <Star key={s} size={14} fill="var(--color-warning-500)" color="var(--color-warning-500)" />)}
                                </div>
                                <p style={{ fontSize: 'var(--font-size-base)', lineHeight: 'var(--line-height-relaxed)', marginBottom: 'var(--space-6)', fontStyle: 'italic', color: 'var(--color-neutral-700)' }}>"{t.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    <div style={{ 
                                        width: 'var(--space-10)', 
                                        height: 'var(--space-10)', 
                                        borderRadius: 'var(--border-radius-full)', 
                                        backgroundColor: 'var(--color-primary-100)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        color: 'var(--color-primary-700)', 
                                        fontWeight: 'var(--font-weight-bold)',
                                        fontSize: 'var(--font-size-sm)'
                                    }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-sm)' }}>{t.name}</div>
                                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-neutral-500)' }}>{t.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ padding: 'var(--space-32) var(--space-8)', textAlign: 'center' }}>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true }}
                    style={{ maxWidth: '600px', margin: '0 auto' }}
                >
                    <h2 style={{ fontSize: 'var(--font-size-4xl)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)' }}>Ready to accelerate your career?</h2>
                    <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-10)' }}>Join thousands of job seekers who used SkillGap.ai to land their dream jobs.</p>
                    <Link to="/register" style={{ 
                        backgroundColor: 'var(--color-neutral-900)', 
                        color: 'white', 
                        padding: 'var(--space-4) var(--space-12)', 
                        borderRadius: 'var(--border-radius-lg)', 
                        fontSize: 'var(--font-size-base)', 
                        fontWeight: 'var(--font-weight-semibold)',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                    }}>
                        Get Started Free <Rocket size={18} />
                    </Link>
                </motion.div>
            </section>

            {/* Minimal Footer */}
            <footer style={{ padding: 'var(--space-12) var(--space-8)', borderTop: '1px solid var(--color-neutral-200)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                    <Zap size={20} className="text-primary-600" fill="currentColor" />
                    <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>SkillGap.ai</span>
                </div>
                <p style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--font-size-xs)' }}>© 2026 SkillGap.ai — All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Landing;
