import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle, Zap, Upload, Target, BookOpen,
  Shield, Sparkles, FileText, Map, Brain,
  Lock, Clock, Rocket,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const launch = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: (i = 0) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const VIEW = { once: true, margin: '-80px' };

const matchSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'REST APIs'];
const gapSkills = ['Kubernetes', 'Terraform'];

const features = [
  {
    icon: FileText,
    title: 'Resume analysis in seconds',
    body: 'Drop a PDF or DOCX. We extract every skill, project, and signal, then score your fit against the role you want.',
    status: 'ACTIVE',
  },
  {
    icon: Target,
    title: 'Skill gap detection',
    body: 'See exactly which skills you are missing, ranked by how much each one moves your match score.',
    status: 'SCANNING',
  },
  {
    icon: BookOpen,
    title: 'Personalized learning roadmap',
    body: 'A step-by-step plan with courses, projects, and resources to close each gap.',
    status: 'READY',
  },
  {
    icon: Sparkles,
    title: 'Role-fit recommendations',
    body: 'See job-role matches based on your current skills and the gaps that matter most.',
    status: 'ANALYZING',
  },
  {
    icon: Clock,
    title: 'Progress history',
    body: 'Track resume scores over time and revisit earlier analyses whenever you need.',
    status: 'TRACKING',
  },
  {
    icon: Shield,
    title: 'Private by default',
    body: 'Your resume stays in your account. We never sell your data, and you can delete everything in one click.',
    status: 'SECURED',
  },
];

const steps = [
  { num: '01', icon: Upload, title: 'Upload your resume', body: 'PDF or DOCX. We parse it locally first, then enrich with AI when needed.' },
  { num: '02', icon: Brain, title: 'Pick a target role', body: 'Choose from a list or write your own. We benchmark your skills against it.' },
  { num: '03', icon: Map, title: 'Get your roadmap', body: 'A personalized plan with the exact skills to learn, in what order, with what resources.' },
  { num: '04', icon: CheckCircle, title: 'Measure progress', body: 'Upload again later and compare your new score, gaps, and recommendations.' },
];

const Landing = ({ openAuthModal }) => {
  return (
    <div className="landing-root">
      <style>{`
        .landing-root {
          background: var(--color-bg);
          font-family: var(--font-body);
        }
        .landing-root h1, .landing-root h2, .landing-root h3, .landing-root h4 {
          font-family: var(--font-display);
        }

        /* Mission Control Grid Lines */
        .mc-grid-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(10, 22, 40, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10, 22, 40, 0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 30%, black 0%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 30%, black 0%, transparent 80%);
          opacity: 0.6;
        }

        .mc-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: var(--font-display);
        }
        .mc-status-active {
          background: var(--green-50);
          color: var(--color-success);
          border: 1px solid var(--green-100);
        }
        .mc-status-active::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-success);
          animation: mc-pulse 2s infinite;
        }
        @keyframes mc-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .mc-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          position: relative;
          overflow: hidden;
          transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--color-secondary), var(--color-success));
          opacity: 0;
          transition: opacity 300ms ease;
        }
        .mc-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-card-hover);
          border-color: var(--navy-200);
        }
        .mc-card:hover::before {
          opacity: 1;
        }

        .mc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: var(--navy-950);
          border-bottom: 1px solid var(--navy-800);
        }
        .mc-header-dots {
          display: flex;
          gap: 6px;
        }
        .mc-header-dots span {
          width: 10px; height: 10px;
          border-radius: 50%;
        }
        .mc-header-dots span:nth-child(1) { background: #ef4444; }
        .mc-header-dots span:nth-child(2) { background: #f59e0b; }
        .mc-header-dots span:nth-child(3) { background: #22c55e; }
        .mc-header-title {
          font-family: var(--font-display);
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .mc-header-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 10px; color: var(--color-success); font-weight: 600;
        }
        .mc-header-status::before {
          content: '';
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--color-success);
          animation: mc-pulse 2s infinite;
        }

        .mc-gradient {
          background: linear-gradient(135deg, var(--color-secondary) 0%, #ff8a5c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .mc-step {
          position: relative;
          padding: 24px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          transition: all 300ms ease;
        }
        .mc-step:hover {
          border-color: var(--navy-200);
          box-shadow: var(--shadow-md);
        }
        .mc-step-num {
          font-family: var(--font-display);
          font-size: 40px; font-weight: 700;
          color: var(--navy-100); line-height: 1;
          margin-bottom: 16px;
        }
        .mc-step:hover .mc-step-num {
          color: var(--orange-300);
        }

        .mc-bento {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 720px) {
          .mc-bento { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .mc-bento { grid-template-columns: repeat(3, 1fr); }
        }

        .mc-feature {
          padding: 24px;
          position: relative;
        }
        .mc-feature-icon {
          width: 48px; height: 48px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          background: var(--navy-950);
          color: var(--orange-400);
        }
        .mc-feature-status {
          position: absolute;
          top: 16px; right: 16px;
          font-family: var(--font-display);
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--navy-300);
          text-transform: uppercase;
        }

        .mc-btn {
          display: inline-flex;
          align-items: center; gap: 10px;
          padding: 16px 28px;
          background: var(--color-secondary);
          color: white;
          border-radius: var(--radius-xl);
          font-family: var(--font-display);
          font-weight: 700; font-size: 15px;
          text-decoration: none;
          transition: all 300ms cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: var(--shadow-button);
          border: none; cursor: pointer;
        }
        .mc-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 8px 24px rgba(255, 107, 53, 0.4);
          color: white;
        }
        .mc-btn-secondary {
          background: var(--color-surface);
          color: var(--color-text);
          border: 2px solid var(--color-border);
          box-shadow: none;
        }
        .mc-btn-secondary:hover {
          background: var(--navy-50);
          border-color: var(--navy-200);
          box-shadow: none;
          color: var(--color-text);
        }

        .mc-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        @media (min-width: 640px) {
          .mc-stats { grid-template-columns: repeat(4, 1fr); }
        }
        .mc-stat {
          padding: 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          text-align: center;
        }
        .mc-stat-value {
          font-family: var(--font-display);
          font-size: 28px; font-weight: 700;
          color: var(--color-text); line-height: 1;
        }
        .mc-stat-label {
          font-size: 11px; color: var(--color-text-muted);
          text-transform: uppercase; letter-spacing: 0.08em;
          margin-top: 4px;
        }

        .mc-mock {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .mc-faq {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }
        .mc-faq-item {
          border-bottom: 1px solid var(--color-border);
        }
        .mc-faq-item:last-child {
          border-bottom: none;
        }
        .mc-faq-trigger {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 20px 24px;
          background: none; border: none;
          text-align: left; cursor: pointer;
          font-family: var(--font-body); font-weight: 600;
          color: var(--color-text);
          transition: background 200ms ease;
        }
        .mc-faq-trigger:hover {
          background: var(--navy-50);
        }
        .mc-faq-content {
          max-height: 0; overflow: hidden;
          transition: max-height 300ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mc-faq-content-inner {
          padding: 0 24px 20px;
          color: var(--color-text-muted);
          font-size: 15px; line-height: 1.7;
        }

        .mc-float {
          position: absolute;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 12px 16px;
          box-shadow: var(--shadow-lg);
          display: flex; align-items: center; gap: 10px;
          font-size: 12px;
        }

        .mc-doodle {
          position: absolute;
          font-family: 'Comic Sans MS', cursive;
          color: var(--color-secondary);
          font-size: 12px;
          transform: rotate(-5deg);
          opacity: 0;
          transition: opacity 300ms ease;
          pointer-events: none;
        }
        .mc-card:hover .mc-doodle {
          opacity: 1;
        }

        .mc-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .mc-hero-grid { grid-template-columns: 1.1fr 0.9fr; gap: 64px; }
        }

        .mc-cta {
          position: relative;
          background: var(--navy-950);
          border-radius: var(--radius-3xl);
          padding: 64px 32px;
          overflow: hidden;
          color: white;
        }
        .mc-cta::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(600px circle at 20% 30%, rgba(255, 107, 53, 0.15), transparent 50%),
            radial-gradient(400px circle at 80% 70%, rgba(34, 197, 94, 0.1), transparent 50%);
          pointer-events: none;
        }
        .mc-cta > * {
          position: relative;
        }

        .mc-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-border), transparent);
        }

        .mc-pill {
          display: inline-flex;
          align-items: center; gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          font-size: 13px; font-weight: 500;
          color: var(--color-text-muted);
        }
      `}</style>

      {/* HERO */}
      <section style={{ padding: '80px 0 96px', position: 'relative', overflow: 'hidden' }}>
        <div className="mc-grid-bg" />
        <div style={{
          position: 'absolute', top: '-200px', right: '-150px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 107, 53, 0.12), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-200px', left: '-150px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10, 22, 40, 0.08), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="mc-hero-grid">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(42px, 6vw, 76px)',
                  fontWeight: 700,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: 'var(--color-text)',
                  marginBottom: '24px',
                }}
              >
                Know exactly{' '}
                <span className="mc-gradient">what stands</span>
                <br />
                between you and the role.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(16px, 1.4vw, 18px)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.7,
                  maxWidth: '500px',
                  marginBottom: '32px',
                }}
              >
                SkillGap.ai reads your resume, compares it to a target role, and
                hands you a clear, personalized plan to close the gap.
              </motion.p>

              <motion.div
                variants={fadeUp}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}
              >
                <button onClick={() => openAuthModal('register')} className="mc-btn">
                  <Rocket size={18} />
                  Launch Your Analysis
                </button>
                <button onClick={() => openAuthModal('login')} className="mc-btn mc-btn-secondary">
                  Sign In
                </button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}
              >
                <span className="mc-pill">
                  <Zap size={14} color="var(--color-secondary)" />
                  Powered by Gemini
                </span>
                <span className="mc-pill">
                  <Lock size={14} />
                  Private by default
                </span>
                <span className="mc-pill">
                  <Clock size={14} />
                  ~30 seconds
                </span>
              </motion.div>
            </motion.div>

            {/* Hero Dashboard Mock */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative' }}
            >
              <div className="mc-mock" style={{ transform: 'rotate(-1deg)' }}>
                <div className="mc-header">
                  <div className="mc-header-dots">
                    <span /><span /><span />
                  </div>
                  <span className="mc-header-title">skillgap.ai / analyzer</span>
                  <span className="mc-header-status">LIVE</span>
                </div>
                <div style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Target Role
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginTop: '4px' }}>
                        Senior Frontend Engineer
                      </div>
                    </div>
                    <span className="mc-status mc-status-active" style={{ fontSize: '9px', padding: '4px 10px' }}>
                      <CheckCircle size={10} /> Analyzed
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                        <motion.circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="var(--color-secondary)" strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="264"
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * 0.82) }}
                          transition={{ duration: 1.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text)' }}>82</span>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
                        Match Score
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                        Strong fit. Two skills are pulling the score down.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Matched Skills</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success)' }}>6/8</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {matchSkills.map(s => (
                          <span key={s} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            padding: '3px 8px', borderRadius: 'var(--radius-full)',
                            fontSize: '10px', fontWeight: 600,
                            background: 'var(--green-50)', color: 'var(--color-success)',
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Skill Gaps</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-error)' }}>2/8</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {gapSkills.map(s => (
                          <span key={s} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                            padding: '3px 8px', borderRadius: 'var(--radius-full)',
                            fontSize: '10px', fontWeight: 600,
                            background: 'var(--color-error-light)', color: 'var(--color-error)',
                          }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--navy-950)', borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}>
                    <Rocket size={16} color="var(--color-secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-secondary)', marginBottom: '2px' }}>
                        Next Launch
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>
                        Learn Kubernetes - closes your biggest gap.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Score Badge */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mc-float"
                style={{ right: '-20px', top: '35%', transform: 'rotate(3deg)' }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'var(--green-50)', color: 'var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>+12 score</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>after learning K8s</div>
                </div>
              </motion.div>

              {/* Hand-drawn doodle */}
              <div className="mc-doodle" style={{ bottom: '20px', left: '-40px' }}>
                ← so cool!
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mc-divider" />

      {/* STATS BAND */}
      <section style={{ padding: '48px 0' }}>
        <div className="container">
          <motion.div
            className="mc-stats"
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
          >
            {[
              { value: '2,847', label: 'Resumes Analyzed' },
              { value: '82%', label: 'Avg Match Score' },
              { value: '<30s', label: 'Analysis Time' },
              { value: '100%', label: 'Free Forever' },
            ].map((s) => (
              <motion.div key={s.label} variants={fadeUp} className="mc-stat">
                <div className="mc-stat-value">{s.value}</div>
                <div className="mc-stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="mc-divider" />

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '640px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '16px' }}>
              <span className="mc-status mc-status-active">System Status</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700,
              letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              Mission Control Dashboard,
              <br />
              <span className="mc-gradient">for your career.</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.7, margin: 0,
            }}>
              Every tool you need to analyze, plan, and track your job search - 
              all in one place. No subscription, no paywall.
            </motion.p>
          </motion.div>

          <motion.div
            className="mc-bento"
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={launch}
                  custom={i}
                  className="mc-card mc-feature"
                >
                  <span className="mc-feature-status">{f.status}</span>
                  <div className="mc-feature-icon">
                    <Icon size={24} />
                  </div>
                  <h3 style={{
                    fontSize: '18px', fontWeight: 700, color: 'var(--color-text)',
                    marginBottom: '8px', letterSpacing: '-0.01em',
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontSize: '14px', color: 'var(--color-text-muted)',
                    lineHeight: 1.6, margin: 0,
                  }}>
                    {f.body}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section" style={{ background: 'var(--navy-950)', color: 'white' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '560px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '16px' }}>
              <span className="mc-status" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-secondary)', border: '1px solid rgba(255,255,255,0.12)' }}>
                Launch Sequence
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700,
              letterSpacing: '-0.03em', color: 'white', marginBottom: '12px',
            }}>
              Four steps to launch.
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0,
            }}>
              From a fresh PDF to a tracked application, with a real plan in between.
            </motion.p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEW}
                  transition={{ delay: i * 0.12 }}
                  className="mc-step"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="mc-step-num">{s.num}</div>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'var(--color-secondary)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '16px',
                  }}>
                    <Icon size={20} />
                  </div>
                  <h3 style={{
                    fontSize: '17px', fontWeight: 700,
                    color: 'white', marginBottom: '8px',
                  }}>
                    {s.title}
                  </h3>
                  <p style={{
                    fontSize: '14px', color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.6, margin: 0,
                  }}>
                    {s.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY SKILLGAP.AI */}
      <section id="why-skillgap" className="section">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '16px' }}>
              <span className="mc-status mc-status-active">Mission Brief</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 700,
              letterSpacing: '-0.03em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              Built like a tool,
              <br />
              <span className="mc-gradient">not a marketing site.</span>
            </motion.h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: Zap, t: 'Fast where it matters', b: 'Most analyses finish in under 30 seconds. Local parsing handles the common case so the AI is reserved for the hard parts.' },
              { icon: Lock, t: 'Your data stays yours', b: 'Resumes are stored against your account only. Nothing is sold, nothing is shared with third parties, and one click deletes everything.' },
              { icon: Sparkles, t: 'Personal, not generic', b: 'Every recommendation is built from your actual skills and the role you pick - no boilerplate content.' },
            ].map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.t}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEW}
                  transition={{ delay: i * 0.1 }}
                  className="mc-card mc-feature"
                >
                  <div className="mc-feature-icon" style={{ background: 'var(--color-secondary)', color: 'white' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>{d.t}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>{d.b}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            className="mc-cta"
            style={{ textAlign: 'center' }}
          >
            <div style={{ maxWidth: '560px', margin: '0 auto' }}>
              <motion.div variants={fadeUp} style={{ marginBottom: '16px' }}>
                <span className="mc-status" style={{ background: 'rgba(255,107,53,0.15)', color: 'var(--color-secondary)', border: '1px solid rgba(255,107,53,0.3)' }}>
                  Ready for Launch
                </span>
              </motion.div>
              <h2 style={{
                fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 700,
                letterSpacing: '-0.03em', color: 'white', marginBottom: '16px',
              }}>
                Your career deserves a <span style={{ color: 'var(--color-secondary)' }}>mission plan</span>, not guesswork.
              </h2>
              <p style={{
                fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7,
                marginBottom: '32px',
              }}>
                Join thousands of job seekers who know exactly what they need to learn next.
              </p>
              <button onClick={() => openAuthModal('register')} className="mc-btn" style={{ fontSize: '16px', padding: '18px 36px' }}>
                <Rocket size={20} />
                Start Your Mission
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '40px 0 28px',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '32px', marginBottom: '32px',
          }}>
            <div>
              <Link to="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                textDecoration: 'none', color: 'var(--color-text)', marginBottom: '12px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'var(--navy-950)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={16} color="var(--color-secondary)" />
                </div>
                <span style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>
                  Skill<span className="mc-gradient">Gap.ai</span>
                </span>
              </Link>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '260px' }}>
                An AI career intelligence tool for job seekers who would rather know than guess.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', fontFamily: 'var(--font-display)' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a href="#features" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>How it works</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '14px', fontFamily: 'var(--font-display)' }}>Account</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><button onClick={() => openAuthModal('login')} style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Sign in</button></li>
                <li><button onClick={() => openAuthModal('register')} style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0, font: 'inherit' }}>Create account</button></li>
              </ul>
            </div>
          </div>

          <div className="mc-divider" style={{ marginBottom: '24px' }} />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>
              © {new Date().getFullYear()} SkillGap.ai - Built for serious job seekers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
