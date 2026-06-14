import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const matchSkills = ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'];
const gapSkills = ['Kubernetes', 'Terraform'];

const AuthShell = ({ eyebrow, title, subtitle, children, footer }) => {
  return (
    <div className="auth-shell">
      <div className="auth-grid">
        <div className="auth-form-side">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="auth-form-card"
          >
            {eyebrow && (
              <motion.div variants={fadeUp} className="auth-eyebrow">
                {eyebrow}
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} className="auth-title">
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p variants={fadeUp} className="auth-subtitle">
                {subtitle}
              </motion.p>
            )}
            <motion.div variants={fadeUp} style={{ marginTop: '28px' }}>
              {children}
            </motion.div>
            {footer && (
              <motion.div variants={fadeUp} className="auth-footer">
                {footer}
              </motion.div>
            )}
          </motion.div>
        </div>

        <div className="auth-brand-side">
          <div className="auth-brand-bg" aria-hidden="true">
            <div className="auth-brand-glow auth-brand-glow-a" />
            <div className="auth-brand-glow auth-brand-glow-b" />
            <div className="auth-brand-grid" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="auth-brand-content"
          >
            <Link to="/" className="auth-brand-logo">
              <div className="auth-brand-mark">
                <Zap size={16} color="white" />
              </div>
              <span className="auth-brand-name">
                SkillGap<span className="auth-brand-dot">.ai</span>
              </span>
            </Link>

            <div className="auth-brand-pitch">
              <span className="auth-brand-eyebrow">
                <Sparkles size={11} />
                Inside the toolkit
              </span>
              <h2 className="auth-brand-headline">
                Upload a resume.<br />
                See exactly which skills<br />
                <span className="auth-brand-gradient">move the needle.</span>
              </h2>
              <p className="auth-brand-sub">
                Personalized match score, skill gaps ranked by impact, and a step-by-step plan to close them.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="auth-mock"
            >
              <div className="auth-mock-bar">
                <span /><span /><span />
                <div className="auth-mock-title">Senior Frontend Engineer</div>
              </div>
              <div className="auth-mock-body">
                <div className="auth-mock-row">
                  <div className="auth-mock-score">
                    <svg width="80" height="80" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <defs>
                        <linearGradient id="authMockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#ff6b35" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                      </defs>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="url(#authMockGrad)" strokeWidth="7" strokeLinecap="round"
                        strokeDasharray="264"
                        initial={{ strokeDashoffset: 264 }}
                        animate={{ strokeDashoffset: 264 - (264 * 0.82) }}
                        transition={{ duration: 1.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </svg>
                    <span className="auth-mock-score-num">82</span>
                  </div>
                  <div className="auth-mock-meta">
                    <div className="auth-mock-label">Match score</div>
                    <div className="auth-mock-text">Strong fit. Two skills are pulling the score down.</div>
                  </div>
                </div>

                <div className="auth-mock-skills">
                  <div className="auth-mock-skills-row">
                    <span className="auth-mock-skills-label">Matched</span>
                    <div className="auth-mock-tags">
                      {matchSkills.slice(0, 4).map(s => (
                        <span key={s} className="auth-mock-tag auth-mock-tag-match">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="auth-mock-skills-row">
                    <span className="auth-mock-skills-label">Gaps</span>
                    <div className="auth-mock-tags">
                      {gapSkills.map(s => (
                        <span key={s} className="auth-mock-tag auth-mock-tag-gap">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="auth-mock-tip">
                  <Sparkles size={14} color="#ff6b35" />
                  <span><strong>Next:</strong> Learn Kubernetes basics - closes your biggest gap.</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="auth-brand-points"
            >
              {[
                'Personal match score in ~30 seconds',
                'Step-by-step roadmap for every gap',
                'Track applications in one place',
              ].map(line => (
                <div key={line} className="auth-brand-point">
                  <CheckCircle size={14} color="#ff6b35" />
                  <span>{line}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
