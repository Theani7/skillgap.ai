
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Zap, Upload, Target,
  GraduationCap, Briefcase, ChevronRight, Sparkles,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const features = [
  { icon: Upload, title: 'Resume Analysis', desc: 'AI-powered parsing against your target role with detailed skill-by-skill breakdowns.' },
  { icon: Target, title: 'Skill Gap Detection', desc: 'Know exactly what you\'re missing — ranked by relevance to your dream job.' },
  { icon: GraduationCap, title: 'Learning Roadmap', desc: 'Personalized curriculum with courses, projects, and resources to close each gap.' },
  { icon: Briefcase, title: 'Job Tracking', desc: 'Manage applications, generate cover letters, and track your progress.' },
];

const Landing = () => {
  return (
    <div className="relative" style={{ background: 'var(--color-bg)' }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        <div className="container flex items-center justify-between" style={{ height: '60px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '6px',
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Zap size={14} color="white" />
            </div>
            <span style={{ fontWeight: 'var(--font-extrabold)', fontSize: '16px', color: 'var(--color-text)', letterSpacing: 'var(--tracking-tight)' }}>
              SkillGap.ai
            </span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/login" className="btn-ghost" style={{
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-muted)', textDecoration: 'none', padding: '8px 12px', borderRadius: 'var(--radius-lg)',
            }}>
              Log In
            </Link>
            <Link to="/register" style={{
              fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)',
              color: 'white', background: 'var(--color-text)',
              padding: '8px 18px', borderRadius: 'var(--radius-lg)', textDecoration: 'none',
            }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '80px 0',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Faint grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
          backgroundImage: `linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 0%, transparent 100%)',
        }} />

        <div className="container landing-hero-grid" style={{ position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '40px',
            alignItems: 'center',
          }} className="landing-hero-grid-inner">
            {/* Left text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              style={{ textAlign: 'center' }}
              className="landing-hero-text"
            >
              <motion.div variants={fadeUp} style={{ marginBottom: '24px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-primary)', background: 'var(--indigo-50)',
                  border: '1px solid var(--indigo-100)',
                }}>
                  <Sparkles size={11} />
                  AI-Powered Career Platform
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} style={{
                fontSize: 'clamp(36px, 5vw, 56px)',
                fontWeight: 'var(--font-extrabold)',
                letterSpacing: 'var(--tracking-tight)',
                lineHeight: 1.1,
                color: 'var(--color-text)',
                marginBottom: '16px',
              }}>
                Close your skill gap.
                <br />
                <span className="gradient-text">Land your dream role.</span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
                maxWidth: '480px',
                margin: '0 auto 32px',
              }}>
                Upload your resume, pick a target role, and get an instant AI analysis
                of exactly what skills you&apos;re missing — plus a personalized plan to close each gap.
              </motion.p>

              <motion.div variants={fadeUp} style={{
                display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px',
              }}>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--color-text)', color: 'white',
                  fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
                  textDecoration: 'none',
                }}>
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '12px 24px', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)', color: 'var(--color-text-muted)',
                  fontWeight: 'var(--font-medium)', fontSize: 'var(--text-sm)',
                  background: 'var(--color-surface)', textDecoration: 'none',
                }}>
                  Sign In
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} style={{
                display: 'flex', justifyContent: 'center', gap: '20px',
                fontSize: 'var(--text-xs)', color: 'var(--color-text-light)', flexWrap: 'wrap',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={13} color="var(--color-success)" /> No credit card
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={13} color="var(--color-success)" /> Free analysis
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CheckCircle size={13} color="var(--color-success)" /> Instant results
                </span>
              </motion.div>
            </motion.div>

            {/* Right mockup */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ flex: '1 1 50%', maxWidth: '520px', width: '100%' }}
            >
              <div className="card" style={{
                padding: '28px',
                border: '1px solid var(--indigo-200)',
                boxShadow: '0 12px 40px -8px rgba(79,70,229,0.12)',
              }}>
                {/* Top bar */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      background: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Zap size={13} color="white" />
                    </div>
                    <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                      SkillGap Analyzer
                    </span>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-primary)', background: 'var(--indigo-50)',
                    padding: '2px 10px', borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--indigo-100)',
                  }}>
                    Live Demo
                  </span>
                </div>

                {/* Score ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ position: 'relative', width: '96px', height: '96px', marginBottom: '8px' }}>
                    <svg width="96" height="96" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGradL)" strokeWidth="6"
                        strokeDasharray="264" strokeDashoffset="53" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="scoreGradL" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="var(--color-primary)" />
                          <stop offset="100%" stopColor="var(--color-secondary)" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="gradient-text" style={{ fontSize: '28px', fontWeight: 'var(--font-extrabold)' }}>
                        80
                      </span>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '10px', fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-light)', letterSpacing: '0.05em', textTransform: 'uppercase',
                  }}>
                    Resume Score
                  </span>
                </div>

                {/* Skill tags */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)' }}>
                        Matched Skills
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--color-success)' }}>
                        4/6
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {['React', 'Python', 'SQL', 'AWS'].map(s => (
                        <span key={s} style={{
                          fontSize: '11px', fontWeight: 'var(--font-medium)',
                          color: 'var(--color-success)', background: 'var(--emerald-50)',
                          padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-muted)' }}>
                        Missing Skills
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 'var(--font-semibold)', color: 'var(--color-error)' }}>
                        2/6
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {['Kubernetes', 'GraphQL'].map(s => (
                        <span key={s} style={{
                          fontSize: '11px', fontWeight: 'var(--font-medium)',
                          color: 'var(--color-error)', background: 'var(--color-error-light)',
                          padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Logo bar */}
      <section style={{
        padding: '32px 0',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
      }}>
        <div className="container">
          <p style={{
            textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-light)', letterSpacing: '0.08em', textTransform: 'uppercase',
            marginBottom: '20px',
          }}>
            Used by job seekers targeting roles at companies like
          </p>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '40px',
          }}>
            {['Startup', 'Scale-up', 'Enterprise', 'Agency', 'Consulting', 'Remote-first'].map(name => (
              <span key={name} style={{
                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-text-light)',
              }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
              <Sparkles size={11} /> Process
            </span>
            <h2 style={{
              fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)', letterSpacing: 'var(--tracking-tight)',
              marginBottom: '8px',
            }}>
              How it works
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              Four simple steps from resume to job offer.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '32px',
            position: 'relative',
          }}>
            {/* Connector line */}
            <div className="landing-connector" style={{
              position: 'absolute', top: '32px', left: 'calc(12.5% + 40px)',
              right: 'calc(12.5% + 40px)', height: '2px',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary), var(--color-primary-light), transparent)',
              display: 'none',
            }} />

            {[
              { num: '01', title: 'Upload Resume', desc: 'Drop your PDF or DOCX. We extract and structure everything instantly.' },
              { num: '02', title: 'AI Analysis', desc: 'Your skills are compared against your target role requirements.' },
              { num: '03', title: 'Get Roadmap', desc: 'A personalized plan with courses and projects for each gap.' },
              { num: '04', title: 'Land the Job', desc: 'Track applications and generate tailored cover letters.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  width: '64px', height: '64px', borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 20px -4px rgba(79,70,229,0.25)',
                }}>
                  <span style={{ fontSize: '20px', fontWeight: 'var(--font-extrabold)', color: 'white' }}>
                    {step.num}
                  </span>
                </div>
                <h3 style={{
                  fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text)', marginBottom: '6px',
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                  lineHeight: 1.6, margin: 0, maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto',
                }}>
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)', letterSpacing: 'var(--tracking-tight)',
              marginBottom: '8px',
            }}>
              Everything you need
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
              Purpose-built for career growth, not just resume parsing.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
          }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card-hover"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '28px',
                  transition: 'all 200ms ease',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: 'var(--radius-lg)',
                  background: 'var(--indigo-50)', color: 'var(--color-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', fontSize: '18px',
                }}>
                  <f.icon size={20} />
                </div>
                <h3 style={{
                  fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text)', marginBottom: '6px',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                  lineHeight: 1.6, margin: 0,
                }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="section" style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)', letterSpacing: 'var(--tracking-tight)',
              marginBottom: '8px',
            }}>
              Everything in your career toolkit
            </h2>
            <p style={{ fontSize: 'var(--text-base)', color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto' }}>
              Built for the full job-search loop — from first analysis to final offer.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {[
              { title: 'Resume parsing in seconds', body: 'Drop a PDF or DOCX, get a structured analysis with match score, missing skills, and confidence rating.' },
              { title: 'AI role matching', body: 'Compare your profile against live job descriptions and surface the skills that move the needle.' },
              { title: 'Personalized roadmaps', body: 'Step-by-step learning plans with courses, projects, and follow-up actions tailored to your gaps.' },
              { title: 'Cover letter copilot', body: 'Generate letters that mirror the job description — pick the tone, length, and target role.' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '24px',
                }}
              >
                <h3 style={{
                  fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text)', marginBottom: '8px',
                }}>
                  {card.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                  lineHeight: 1.6, margin: 0,
                }}>
                  {card.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            maxWidth: '640px', margin: '0 auto', textAlign: 'center',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-2xl)',
            padding: '64px 32px', background: 'var(--color-surface)',
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{
              fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)',
              color: 'var(--color-text)', letterSpacing: 'var(--tracking-tight)',
              marginBottom: '12px',
            }}>
              Ready to accelerate your career?
            </h2>
            <p style={{
              fontSize: 'var(--text-base)', color: 'var(--color-text-muted)',
              lineHeight: 1.6, marginBottom: '28px', maxWidth: '400px',
              margin: '0 auto 28px',
            }}>
              Run a free resume analysis, see your skill gaps in 30 seconds, and decide if the toolkit is right for you.
            </p>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: 'var(--radius-lg)',
              background: 'var(--color-text)', color: 'white',
              fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}>
              Get Started Free <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        padding: '24px 0',
      }}>
        <div className="container">
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '4px',
                background: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={12} color="white" />
              </div>
              <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                SkillGap.ai
              </span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['Privacy', 'Terms', 'Contact'].map(item => (
                <Link key={item} to="#" style={{
                  fontSize: 'var(--text-xs)', color: 'var(--color-text-light)',
                  textDecoration: 'none',
                }}>
                  {item}
                </Link>
              ))}
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-border)', margin: 0 }}>
              &copy; {new Date().getFullYear()} SkillGap.ai
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
