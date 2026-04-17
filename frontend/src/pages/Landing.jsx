import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Target, BookOpen, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
};

const cardHover = {
    rest: { y: 0, scale: 1 },
    hover: { y: -12, scale: 1.02, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }
};

const Landing = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Hero Section */}
            <section className="clay-section" style={{ paddingTop: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    style={{ maxWidth: '850px', zIndex: 10, position: 'relative' }}
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp}>
                        <span className="clay-badge clay-badge-primary" style={{ marginBottom: '2rem', display: 'inline-flex' }}>
                            <Sparkles size={14} />
                            Welcome to SkillGap.ai 2.0
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        style={{
                            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
                            lineHeight: '1.05',
                            fontWeight: 900,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.03em',
                            fontFamily: 'var(--font-display)'
                        }}
                    >
                        Your Career Catalyst
                        <br />
                        <span className="clay-text-gradient">On Demand</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        variants={fadeInUp}
                        style={{
                            color: 'var(--clay-muted)',
                            fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                            maxWidth: '650px',
                            margin: '0 auto 2.5rem auto',
                            fontWeight: 500,
                            lineHeight: 1.7
                        }}
                    >
                        Stop guessing what recruiters want. We analyze your resume, pinpoint exact skill gaps, and provide curated courses to launch the career you actually deserve.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        variants={fadeInUp}
                        style={{
                            display: 'flex',
                            gap: 'var(--spacing-md)',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}
                    >
                        <Link
                            to="/register"
                            className="clay-btn clay-btn-primary shadow-clay-button clay-btn-lg"
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/app"
                            className="clay-btn clay-btn-secondary shadow-clay-button clay-btn-lg"
                        >
                            Try Analyzer
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Decorative floating elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{
                        position: 'absolute',
                        top: '15%',
                        right: '10%',
                        width: '80px',
                        height: '80px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #C4B5FD, #8B5CF6)',
                        boxShadow: '0 20px 40px rgba(139, 92, 246, 0.3)',
                        zIndex: 5
                    }}
                    className="animate-clay-float hidden lg:block"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    style={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '8%',
                        width: '60px',
                        height: '60px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #6EE7B7, #10B981)',
                        boxShadow: '0 16px 32px rgba(16, 185, 129, 0.3)',
                        zIndex: 5
                    }}
                    className="animate-clay-float-delayed hidden lg:block"
                />
            </section>

            {/* Features Section */}
            <section className="clay-section">
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: '4rem' }}
                    >
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>
                            How SkillGap Operates
                        </h2>
                        <p style={{ color: 'var(--clay-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                            Three powerful pillars to elevate your professional trajectory.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: 'var(--spacing-lg)'
                        }}
                    >
                        {/* Feature Card 1 */}
                        <motion.div
                            variants={fadeInUp}
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                        >
                            <motion.div
                                variants={cardHover}
                                className="clay-card shadow-clay-card"
                                style={{ padding: 'var(--spacing-xl)', height: '100%' }}
                            >
                                <div className="clay-icon clay-icon-purple" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <Zap size={24} fill="white" />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Deep Analysis</h3>
                                <p style={{ color: 'var(--clay-muted)', lineHeight: 1.7, margin: 0 }}>
                                    Our proprietary engine scans your resume against thousands of industry descriptions to calculate your exact match score.
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Feature Card 2 */}
                        <motion.div
                            variants={fadeInUp}
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                        >
                            <motion.div
                                variants={cardHover}
                                className="clay-card shadow-clay-card"
                                style={{ padding: 'var(--spacing-xl)', height: '100%' }}
                            >
                                <div className="clay-icon clay-icon-pink" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <Target size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Gap Mapping</h3>
                                <p style={{ color: 'var(--clay-muted)', lineHeight: 1.7, margin: 0 }}>
                                    We identify the exact keywords, technologies, and soft skills you are missing to land jobs in your predicted field.
                                </p>
                            </motion.div>
                        </motion.div>

                        {/* Feature Card 3 */}
                        <motion.div
                            variants={fadeInUp}
                            whileHover="hover"
                            initial="rest"
                            animate="rest"
                        >
                            <motion.div
                                variants={cardHover}
                                className="clay-card shadow-clay-card"
                                style={{ padding: 'var(--spacing-xl)', height: '100%' }}
                            >
                                <div className="clay-icon clay-icon-blue" style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <BookOpen size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-sm)' }}>Curated Growth</h3>
                                <p style={{ color: 'var(--clay-muted)', lineHeight: 1.7, margin: 0 }}>
                                    Don't just know what's missing. We provide direct links to the best online courses to fill your specific gaps immediately.
                                </p>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Social Proof / Trust Section */}
            <section className="clay-section" style={{ paddingBottom: 'var(--spacing-2xl)' }}>
                <div className="container">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                        className="clay-card shadow-clay-card"
                        style={{
                            maxWidth: '900px',
                            margin: '0 auto',
                            textAlign: 'center',
                            padding: 'var(--spacing-2xl)',
                            background: 'rgba(255, 255, 255, 0.8)'
                        }}
                    >
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 'var(--spacing-xl)' }}>
                            Built for the Modern Professional
                        </h2>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: 'var(--spacing-lg) var(--spacing-xl)'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                color: 'var(--clay-muted)',
                                fontWeight: 600
                            }}>
                                <div className="clay-icon clay-icon-green" style={{ width: '36px', height: '36px', borderRadius: '12px' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <span>Instant PDF Parsing</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                color: 'var(--clay-muted)',
                                fontWeight: 600
                            }}>
                                <div className="clay-icon clay-icon-purple" style={{ width: '36px', height: '36px', borderRadius: '12px' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <span>Bank-grade Security</span>
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                color: 'var(--clay-muted)',
                                fontWeight: 600
                            }}>
                                <div className="clay-icon clay-icon-amber" style={{ width: '36px', height: '36px', borderRadius: '12px' }}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <span>Machine Learning Insights</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="clay-section" style={{ background: 'rgba(255, 255, 255, 0.4)' }}>
                <div className="container">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: 'var(--spacing-lg)',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}
                    >
                        <motion.div variants={fadeInUp} className="clay-stat">
                            <div className="clay-stat-value clay-text-gradient">10K+</div>
                            <div className="clay-stat-label">Resumes Analyzed</div>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="clay-stat">
                            <div className="clay-stat-value" style={{ color: 'var(--clay-accent-alt)' }}>95%</div>
                            <div className="clay-stat-label">Accuracy Rate</div>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="clay-stat">
                            <div className="clay-stat-value" style={{ color: 'var(--clay-success)' }}>500+</div>
                            <div className="clay-stat-label">Career Paths</div>
                        </motion.div>
                        <motion.div variants={fadeInUp} className="clay-stat">
                            <div className="clay-stat-value" style={{ color: 'var(--clay-accent-tertiary)' }}>24/7</div>
                            <div className="clay-stat-label">AI Support</div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
};

export default Landing;
