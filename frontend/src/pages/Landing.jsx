import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Zap, Upload, Target, BookOpen,
  Briefcase, PenLine, Shield, Sparkles, ChevronDown,
  FileText, Map, Send, Brain, Lock, Clock, Github, Twitter, Mail,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const VIEW = { once: true, margin: '-80px' };

const matchSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS', 'REST APIs'];
const gapSkills = ['Kubernetes', 'Terraform'];

const bento = [
  {
    icon: FileText,
    title: 'Resume analysis in seconds',
    body: 'Drop a PDF or DOCX. We extract every skill, project, and signal, then score your fit against the role you want.',
    size: 'lg',
    accent: 'primary',
  },
  {
    icon: Target,
    title: 'Skill gap detection',
    body: 'See exactly which skills you are missing, ranked by how much each one moves your match score.',
    size: 'md',
    accent: 'secondary',
  },
  {
    icon: BookOpen,
    title: 'Personalized learning roadmap',
    body: 'A step-by-step plan with courses, projects, and resources to close each gap — not a generic curriculum.',
    size: 'md',
    accent: 'primary',
  },
  {
    icon: Briefcase,
    title: 'Job application tracker',
    body: 'Log every application with status, follow-ups, salary, and notes. See your full pipeline at a glance.',
    size: 'md',
    accent: 'secondary',
  },
  {
    icon: PenLine,
    title: 'Cover letter copilot',
    body: 'Generate a tailored letter that mirrors the job description. Pick the tone and length.',
    size: 'md',
    accent: 'primary',
  },
  {
    icon: Shield,
    title: 'Private by default',
    body: 'Your resume stays in your account. We never sell your data, and you can delete everything in one click.',
    size: 'md',
    accent: 'secondary',
  },
];

const steps = [
  { num: '01', icon: Upload, title: 'Upload your resume', body: 'PDF or DOCX. We parse it locally first, then enrich with AI when needed.' },
  { num: '02', icon: Brain, title: 'Pick a target role', body: 'Choose from a list or write your own. We benchmark your skills against it.' },
  { num: '03', icon: Map, title: 'Get your roadmap', body: 'A personalized plan with the exact skills to learn, in what order, with what resources.' },
  { num: '04', icon: Send, title: 'Apply with confidence', body: 'Track every application and send tailored cover letters from the same place.' },
];

const faqs = [
  {
    q: 'How much does this cost?',
    a: 'It is free to use. Create an account, run as many resume analyses as you want, and keep your job tracker open indefinitely. There is no subscription, no trial, and no paywall on the core toolkit.',
  },
  {
    q: 'Is my resume kept private?',
    a: 'Yes. Your resume is stored in your account only. The only external system it touches is the AI model that parses and analyzes it — and you can delete your account and all associated data at any time from Settings.',
  },
  {
    q: 'Which roles does the analyzer support?',
    a: 'Anything you can describe. The analyzer works against a built-in catalog of common roles, but you can also type a custom role like "Staff iOS engineer at a fintech" and it will benchmark against that.',
  },
  {
    q: 'What AI model powers the analysis?',
    a: 'Google Gemini, behind the scenes. We use it for resume parsing, skill extraction, and the learning roadmap. The same engine also runs a local fallback for high-confidence parses, so results are fast even on a slow connection.',
  },
  {
    q: 'Do I need a credit card to sign up?',
    a: 'No. The account is free, end of story. There is nothing to upgrade to and nothing to cancel.',
  },
];

const accentVar = (a) => a === 'primary' ? 'var(--color-primary)' : 'var(--color-secondary)';
const accentBg = (a) => a === 'primary' ? 'var(--indigo-50)' : 'var(--violet-50)';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="landing-root" style={{ background: 'var(--color-bg)' }}>
      <style>{`
        .landing-root h1, .landing-root h2, .landing-root h3, .landing-root h4 {
          font-family: var(--font-display);
        }
        .landing-gradient-text {
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: var(--radius-full);
          font-size: 12px; font-weight: 600;
          color: var(--color-primary); background: var(--indigo-50);
          border: 1px solid var(--indigo-100);
        }
        .landing-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.04);
        }
        .landing-bento {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        @media (min-width: 720px) {
          .landing-bento { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }
        @media (min-width: 1024px) {
          .landing-bento { grid-template-columns: repeat(3, 1fr); gap: 24px; }
          .landing-bento-feature.lg { grid-column: span 2; }
        }
        .landing-bento-feature {
          position: relative;
          padding: 28px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
          overflow: hidden;
        }
        .landing-bento-feature:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -8px rgba(79, 70, 229, 0.15);
          border-color: var(--indigo-200);
        }
        .landing-bento-feature::after {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 0%), rgba(79,70,229,0.06), transparent 40%);
          opacity: 0; transition: opacity 200ms ease; pointer-events: none;
        }
        .landing-bento-feature:hover::after { opacity: 1; }
        .landing-bento-feature.lg { padding: 36px; }
        .landing-bento-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
        }
        .landing-bento-feature.lg .landing-bento-icon { width: 56px; height: 56px; border-radius: 14px; }
        .landing-step {
          position: relative;
          padding: 28px 24px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
        }
        .landing-step-rail {
          display: none;
        }
        @media (min-width: 1024px) {
          .landing-step-rail {
            display: block;
            position: absolute; top: 44px;
            left: calc(50% + 32px); right: calc(-50% + 32px);
            height: 2px;
            background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
            opacity: 0.25;
          }
        }
        .landing-mock {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          box-shadow: 0 20px 50px -20px rgba(15, 23, 42, 0.12);
          overflow: hidden;
        }
        .landing-mock-bar {
          display: flex; align-items: center; gap: 6px;
          padding: 12px 16px;
          background: var(--color-bg);
          border-bottom: 1px solid var(--color-border);
        }
        .landing-mock-bar span {
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--color-border);
        }
        .landing-mock-bar span:nth-child(1) { background: #FCA5A5; }
        .landing-mock-bar span:nth-child(2) { background: #FCD34D; }
        .landing-mock-bar span:nth-child(3) { background: #6EE7B7; }
        .landing-tag {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 3px 9px; border-radius: var(--radius-full);
          font-size: 11px; font-weight: 600;
        }
        .landing-faq {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          background: var(--color-surface);
          overflow: hidden;
        }
        .landing-faq-item { border-bottom: 1px solid var(--color-border); }
        .landing-faq-item:last-child { border-bottom: none; }
        .landing-faq-trigger {
          width: 100%;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 20px 24px;
          background: none; border: none;
          text-align: left; cursor: pointer;
          font-family: var(--font-body);
          color: var(--color-text);
        }
        .landing-faq-trigger:hover { background: var(--slate-50); }
        .landing-faq-content {
          max-height: 0; overflow: hidden;
          transition: max-height 280ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .landing-faq-content-inner {
          padding: 0 24px 22px;
          color: var(--color-text-muted);
          font-size: 15px; line-height: 1.65;
        }
        .landing-hero-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 56px;
          align-items: center;
        }
        @media (min-width: 1024px) {
          .landing-hero-grid { grid-template-columns: 1.05fr 0.95fr; gap: 64px; }
        }
        .landing-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: var(--radius-full);
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          font-size: 13px; font-weight: 500;
          color: var(--color-text-muted);
        }
        .landing-pill-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--color-success);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
        }
        .landing-cta-band {
          position: relative;
          background: linear-gradient(135deg, var(--color-text) 0%, #1E1B4B 100%);
          border-radius: var(--radius-3xl);
          padding: 64px 32px;
          overflow: hidden;
        }
        .landing-cta-band::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(800px circle at 20% 20%, rgba(124,58,237,0.25), transparent 50%),
                      radial-gradient(600px circle at 80% 80%, rgba(79,70,229,0.25), transparent 50%);
          pointer-events: none;
        }
        .landing-cta-band > * { position: relative; }
        .landing-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--color-border), transparent);
        }
        .landing-step-num {
          font-family: var(--font-display);
          font-size: 11px; font-weight: 700;
          color: var(--color-text-light);
          letter-spacing: 0.12em;
        }
        .landing-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (min-width: 720px) {
          .landing-stats { grid-template-columns: repeat(4, 1fr); }
        }
        .landing-stat {
          padding: 18px 20px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
        }
      `}</style>

      {/* HERO */}
      <section style={{ padding: '80px 0 96px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 30%, black 0%, transparent 80%)',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute', top: '-160px', right: '-100px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)',
          filter: 'blur(20px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-160px', left: '-100px',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(79,70,229,0.18), transparent 70%)',
          filter: 'blur(20px)', pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          <div className="landing-hero-grid">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.h1
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.02,
                  color: 'var(--color-text)',
                  marginBottom: '20px',
                }}
              >
                Know exactly{' '}
                <span className="landing-gradient-text">what stands</span>
                <br />
                between you and the role.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                style={{
                  fontSize: 'clamp(16px, 1.4vw, 19px)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                  maxWidth: '520px',
                  marginBottom: '32px',
                }}
              >
                SkillGap.ai reads your resume, compares it to a target role, and
                hands you a clear, personalized plan to close the gap — usually
                in under a minute.
              </motion.p>

              <motion.div
                variants={fadeUp}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}
              >
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ padding: '14px 24px', fontSize: '15px', minHeight: '48px' }}
                >
                  Create your account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ padding: '14px 24px', fontSize: '15px', minHeight: '48px' }}
                >
                  Sign in
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}
              >
                <span className="landing-pill">
                  <span className="landing-pill-dot" />
                  Powered by Gemini
                </span>
                <span className="landing-pill">
                  <Lock size={12} />
                  Private by default
                </span>
                <span className="landing-pill">
                  <Clock size={12} />
                  Analysis in ~30 seconds
                </span>
              </motion.div>
            </motion.div>

            {/* Hero mockup card */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative' }}
            >
              <div className="landing-mock" style={{ transform: 'rotate(-0.5deg)' }}>
                <div className="landing-mock-bar">
                  <span /><span /><span />
                  <div style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                    skillgap.ai / analyzer
                  </div>
                </div>
                <div style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Target role
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', marginTop: '2px' }}>
                        Senior Frontend Engineer
                      </div>
                    </div>
                    <span className="landing-tag" style={{ background: 'var(--emerald-50)', color: 'var(--color-success)' }}>
                      <CheckCircle size={11} /> Analyzed
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
                      <svg width="92" height="92" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <defs>
                          <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="var(--color-primary)" />
                            <stop offset="100%" stopColor="var(--color-secondary)" />
                          </linearGradient>
                        </defs>
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="7" />
                        <motion.circle
                          cx="50" cy="50" r="42" fill="none"
                          stroke="url(#heroGrad)" strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray="264"
                          initial={{ strokeDashoffset: 264 }}
                          animate={{ strokeDashoffset: 264 - (264 * 0.82) }}
                          transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span className="landing-gradient-text" style={{ fontSize: '26px', fontWeight: 800 }}>82</span>
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                        Match score
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                        Strong fit. Two skills are pulling the score down — both are learnable in a few weeks.
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Matched skills</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-success)' }}>6/8</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {matchSkills.map(s => (
                          <span key={s} className="landing-tag" style={{ background: 'var(--emerald-50)', color: 'var(--color-success)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Skill gaps</span>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-error)' }}>2/8</span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {gapSkills.map(s => (
                          <span key={s} className="landing-tag" style={{ background: 'var(--color-error-light)', color: 'var(--color-error)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'var(--indigo-50)', border: '1px solid var(--indigo-100)',
                    borderRadius: 'var(--radius-lg)', padding: '14px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                  }}>
                    <Sparkles size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '2px' }}>
                        Recommended next step
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--slate-700)', lineHeight: 1.5 }}>
                        Learn Kubernetes basics — closes your biggest gap and unlocks 3 of 5 priority roles.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                style={{
                  position: 'absolute', right: '-12px', top: '40%',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '14px 16px',
                  boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.12)',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  transform: 'rotate(2deg)',
                }}
                className="landing-floating-card"
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'var(--emerald-50)', color: 'var(--color-success)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CheckCircle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)' }}>+12 score</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>after learning Kubernetes</div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="landing-divider" />

      {/* BENTO FEATURES */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '640px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '14px' }}>
              <span className="landing-eyebrow">What you get</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              A complete career toolkit,
              <br />
              <span className="landing-gradient-text">not just a resume parser.</span>
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0,
            }}>
              Built around the actual job-search loop: analyze, learn, apply, follow up. Everything talks to everything else.
            </motion.p>
          </motion.div>

          <motion.div
            className="landing-bento"
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
          >
            {bento.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  className={`landing-bento-feature ${f.size}`}
                >
                  <div
                    className="landing-bento-icon"
                    style={{ background: accentBg(f.accent), color: accentVar(f.accent) }}
                  >
                    <Icon size={f.size === 'lg' ? 28 : 22} />
                  </div>
                  <h3 style={{
                    fontSize: f.size === 'lg' ? '24px' : '18px',
                    fontWeight: 700, color: 'var(--color-text)',
                    marginBottom: '8px', letterSpacing: '-0.01em',
                  }}>
                    {f.title}
                  </h3>
                  <p style={{
                    fontSize: '15px', color: 'var(--color-text-muted)',
                    lineHeight: 1.6, margin: 0, maxWidth: f.size === 'lg' ? '420px' : 'none',
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
      <section className="section" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '560px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '14px' }}>
              <span className="landing-eyebrow">The loop</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              Four steps, end to end.
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0,
            }}>
              From a fresh PDF to a tracked application, with a real plan in between.
            </motion.p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            position: 'relative',
          }}>
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEW}
                  transition={{ delay: i * 0.1 }}
                  className="landing-step"
                >
                  {i < steps.length - 1 && <div className="landing-step-rail" />}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} />
                    </div>
                    <span className="landing-step-num">STEP {s.num}</span>
                  </div>
                  <h3 style={{
                    fontSize: '17px', fontWeight: 700,
                    color: 'var(--color-text)', marginBottom: '6px',
                  }}>
                    {s.title}
                  </h3>
                  <p style={{
                    fontSize: '14px', color: 'var(--color-text-muted)',
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

      {/* INSIDE THE APP - MOCKS */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '14px' }}>
              <span className="landing-eyebrow">Inside the app</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              The four screens you will actually use.
            </motion.h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {/* Mock 1: Skill match */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW} transition={{ duration: 0.5 }}
              className="landing-mock"
            >
              <div className="landing-mock-bar">
                <span /><span /><span />
                <div style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Skill match
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                  <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'conic-gradient(var(--color-primary) 0% 82%, var(--color-border) 82% 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: 'var(--color-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)',
                    }}>82</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>Backend Engineer</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>8 of 10 priority skills matched</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { label: 'Go', val: 92 },
                    { label: 'PostgreSQL', val: 88 },
                    { label: 'Docker', val: 76 },
                    { label: 'Kubernetes', val: 41 },
                  ].map(b => (
                    <div key={b.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{b.label}</span>
                        <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{b.val}%</span>
                      </div>
                      <div style={{ height: '6px', borderRadius: '3px', background: 'var(--color-border)', overflow: 'hidden' }}>
                        <div style={{
                          width: `${b.val}%`, height: '100%',
                          background: b.val < 60
                            ? 'var(--color-error)'
                            : 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                          borderRadius: '3px',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mock 2: Roadmap */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW} transition={{ duration: 0.5, delay: 0.1 }}
              className="landing-mock"
            >
              <div className="landing-mock-bar">
                <span /><span /><span />
                <div style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Learning roadmap
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                  Kubernetes fundamentals
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '18px' }}>
                  Estimated 3 weeks · 4 steps
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { n: 1, t: 'Pods, services, and deployments', d: '~2 hrs', done: true },
                    { n: 2, t: 'ConfigMaps and Secrets', d: '~1.5 hrs', done: true },
                    { n: 3, t: 'Helm charts and templating', d: '~3 hrs', done: false, current: true },
                    { n: 4, t: 'Project: deploy a microservice', d: '~5 hrs', done: false },
                  ].map(s => (
                    <div key={s.n} style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                      background: s.current ? 'var(--indigo-50)' : 'transparent',
                      border: s.current ? '1px solid var(--indigo-100)' : '1px solid transparent',
                    }}>
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: s.done ? 'var(--color-success)' : s.current ? 'var(--color-primary)' : 'var(--color-border)',
                        color: s.done || s.current ? 'white' : 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {s.done ? '✓' : s.n}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '13px', fontWeight: 600, color: 'var(--color-text)',
                          textDecoration: s.done ? 'line-through' : 'none',
                          opacity: s.done ? 0.7 : 1,
                        }}>{s.t}</div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, flexShrink: 0 }}>{s.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mock 3: Job tracker */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW} transition={{ duration: 0.5, delay: 0.2 }}
              className="landing-mock"
            >
              <div className="landing-mock-bar">
                <span /><span /><span />
                <div style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Application tracker
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>7</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interviews</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>3</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Offers</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)' }}>1</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { c: 'Stripe', r: 'Sr. Backend', s: 'Interview', color: 'primary' },
                    { c: 'Linear', r: 'Platform Eng.', s: 'Applied', color: 'slate' },
                    { c: 'Notion', r: 'Full-stack', s: 'Phone screen', color: 'warning' },
                    { c: 'Vercel', r: 'Infra Engineer', s: 'Offer', color: 'success' },
                  ].map(j => (
                    <div key={j.c} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--color-border)',
                    }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--indigo-100), var(--violet-100))',
                        color: 'var(--color-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 800,
                      }}>{j.c[0]}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>{j.c}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{j.r}</div>
                      </div>
                      <span className="landing-tag" style={{
                        background: j.color === 'success' ? 'var(--emerald-50)'
                                  : j.color === 'warning' ? 'var(--color-warning-light)'
                                  : j.color === 'primary' ? 'var(--indigo-50)'
                                  : 'var(--color-bg)',
                        color:      j.color === 'success' ? 'var(--color-success)'
                                  : j.color === 'warning' ? 'var(--color-warning)'
                                  : j.color === 'primary' ? 'var(--color-primary)'
                                  : 'var(--color-text-muted)',
                      }}>{j.s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Mock 4: Cover letter */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEW} transition={{ duration: 0.5, delay: 0.3 }}
              className="landing-mock"
            >
              <div className="landing-mock-bar">
                <span /><span /><span />
                <div style={{ marginLeft: '12px', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Cover letter
                </div>
              </div>
              <div style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span className="landing-tag" style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}>Tone: Confident</span>
                  <span className="landing-tag" style={{ background: 'var(--violet-50)', color: 'var(--color-secondary)' }}>Length: Medium</span>
                </div>
                <div style={{
                  fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6,
                  padding: '14px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-bg)', border: '1px dashed var(--color-border)',
                }}>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Dear Hiring Team,</span>
                  <br /><br />
                  Your work on the Linear sync engine caught my attention — I have shipped
                  three real-time collaboration features in the last 18 months, and the
                  challenges you describe in the job post look like a great match for
                  that experience...
                </div>
                <div style={{
                  marginTop: '14px', fontSize: '12px', color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Sparkles size={12} color="var(--color-primary)" />
                  Mirrors 4 keywords from the job description
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* WHY SKILLGAP.AI */}
      <section className="section" style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '14px' }}>
              <span className="landing-eyebrow">Why this exists</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              Built like a tool, not a marketing site.
            </motion.h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {[
              { icon: Zap, t: 'Fast where it matters', b: 'Most analyses finish in under 30 seconds. Local parsing handles the common case so the AI is reserved for the hard parts.' },
              { icon: Lock, t: 'Your data stays yours', b: 'Resumes are stored against your account only. Nothing is sold, nothing is shared with third parties, and one click deletes everything.' },
              { icon: Sparkles, t: 'Personal, not generic', b: 'Every recommendation is built from your actual skills and the role you pick — no boilerplate "follow these 5 steps" content.' },
            ].map((d, i) => {
              const Icon = d.icon;
              return (
                <motion.div
                  key={d.t}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={VIEW}
                  transition={{ delay: i * 0.08 }}
                  className="landing-bento-feature"
                >
                  <div
                    className="landing-bento-icon"
                    style={{ background: 'var(--indigo-50)', color: 'var(--color-primary)' }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>{d.t}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>{d.b}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: '14px' }}>
              <span className="landing-eyebrow">FAQ</span>
            </motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 800,
              letterSpacing: '-0.02em', color: 'var(--color-text)', marginBottom: '12px',
            }}>
              The honest answers.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={VIEW} variants={stagger}
            style={{ maxWidth: '760px', margin: '0 auto' }}
          >
            <div className="landing-faq">
              {faqs.map((item, i) => {
                const open = openFaq === i;
                return (
                  <motion.div key={item.q} variants={fadeUp} className="landing-faq-item">
                    <button
                      className="landing-faq-trigger"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                      aria-controls={`faq-${i}`}
                    >
                      <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>{item.q}</span>
                      <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                    <div
                      id={`faq-${i}`}
                      className="landing-faq-content"
                      style={{ maxHeight: open ? '400px' : 0 }}
                    >
                      <div className="landing-faq-content-inner">{item.a}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '64px 0 96px' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEW}
            transition={{ duration: 0.6 }}
            className="landing-cta-band"
          >
            <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="landing-eyebrow" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', borderColor: 'rgba(255,255,255,0.18)' }}>
                  <Sparkles size={12} />
                  Your next role
                </span>
              </div>
              <h2 style={{
                fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800,
                letterSpacing: '-0.02em', color: 'white', marginBottom: '14px', lineHeight: 1.1,
              }}>
                Stop wondering what to do next.
              </h2>
              <p style={{
                fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6,
                margin: '0 auto 32px', maxWidth: '440px',
              }}>
                Create an account, upload your resume, and see your full skill map in under a minute.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '14px 24px', borderRadius: 'var(--radius-lg)',
                    background: 'white', color: 'var(--color-text)',
                    fontWeight: 600, fontSize: '15px', textDecoration: 'none',
                    minHeight: '48px', transition: 'transform 200ms ease, box-shadow 200ms ease, background 200ms ease',
                    boxShadow: '0 8px 24px -8px rgba(255,255,255,0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--slate-50)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px -8px rgba(255,255,255,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px -8px rgba(255,255,255,0.4)';
                  }}
                >
                  Create your account
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '14px 24px', borderRadius: 'var(--radius-lg)',
                    color: 'white', fontWeight: 600, fontSize: '15px',
                    textDecoration: 'none', minHeight: '48px',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'transparent',
                    transition: 'background 200ms ease, border-color 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                  }}
                >
                  Sign in
                </Link>
              </div>
              <p style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '20px 0 0',
              }}>
                Free, no subscription, no card. One account, all of your analyses.
              </p>
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
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                }}>
                  <Zap size={16} color="white" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
                  SkillGap<span style={{ color: 'var(--color-primary)' }}>.ai</span>
                </span>
              </Link>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0, maxWidth: '260px' }}>
                An AI career intelligence tool for job seekers who would rather know than guess.
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><a href="#features" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>Features</a></li>
                <li><a href="#how-it-works" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>How it works</a></li>
                <li><a href="#faq" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Account</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link to="/login" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>Sign in</Link></li>
                <li><Link to="/register" style={{ fontSize: '14px', color: 'var(--color-text-muted)', textDecoration: 'none' }}>Create account</Link></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Get in touch</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { icon: Github, label: 'GitHub' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Mail, label: 'Email' },
                ].map((entry) => {
                  const { icon: Icon, label } = entry;
                  return (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        textDecoration: 'none',
                        transition: 'all 200ms ease',
                      }}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="landing-divider" style={{ marginBottom: '24px' }} />

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '12px',
          }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>
              © {new Date().getFullYear()} SkillGap.ai — Built for serious job seekers.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-light)', margin: 0 }}>
              No subscription. No ads. No data selling.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
