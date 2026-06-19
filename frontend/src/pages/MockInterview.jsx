import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Sparkles, BookOpen, Target } from 'lucide-react';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function MockInterview() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const rolesRes = await api.get('/api/mock-interview');
        setRoles(rolesRes.data.roles);

        try {
          const analysisRes = await api.get('/api/user/latest-analysis');
          const targetRole = analysisRes.data?.target_role;
          if (targetRole && rolesRes.data.roles.includes(targetRole)) {
            setSelectedRole(targetRole);
            setAutoDetected(true);
          } else if (rolesRes.data.roles.length > 0) {
            setSelectedRole(rolesRes.data.roles[0]);
          }
        } catch {
          if (rolesRes.data.roles.length > 0) {
            setSelectedRole(rolesRes.data.roles[0]);
          }
        }
      } catch {
        // ignore
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    let cancelled = false;
    const load = async () => {
      setExpanded({});
      setLoading(true);
      try {
        const res = await api.get(`/api/mock-interview/${encodeURIComponent(selectedRole)}`);
        if (!cancelled) setQuestions(res.data.questions);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [selectedRole]);

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const expandedCount = Object.values(expanded).filter(Boolean).length;

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Background glows */}
      <div style={{
        position: 'absolute', top: '-160px', right: '-160px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.06, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.05, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
              color: 'var(--color-secondary)', background: 'rgba(255, 107, 53, 0.08)',
              border: '1px solid rgba(255, 107, 53, 0.15)',
              marginBottom: '20px',
            }}>
              <BookOpen size={12} />
              Interview Prep
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 'var(--font-extrabold)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}>
              Mock Interview
            </h1>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              maxWidth: '500px',
              margin: '0 auto',
            }}>
              Practice common interview questions for your target role. Expand each question to reveal a model answer.
            </p>
          </div>

          {/* Role selector */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '24px',
              display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
              <Target size={16} style={{ color: 'var(--color-secondary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Role
              </span>
            </div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{
                flex: 1, minWidth: '200px',
                padding: '10px 14px', borderRadius: '10px',
                border: `1px solid ${autoDetected ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                background: autoDetected ? 'rgba(255, 107, 53, 0.04)' : 'var(--color-bg)',
                color: 'var(--color-text)', fontSize: '14px',
                fontWeight: 500, cursor: 'pointer', outline: 'none',
                transition: 'border-color 200ms',
              }}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {autoDetected && (
              <span style={{
                fontSize: '11px', fontWeight: 600, color: 'var(--color-secondary)',
                background: 'rgba(255, 107, 53, 0.08)', padding: '4px 10px',
                borderRadius: '6px', whiteSpace: 'nowrap',
              }}>
                Auto-detected
              </span>
            )}
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex', gap: '20px', marginBottom: '20px',
              padding: '0 4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={14} style={{ color: 'var(--color-secondary)' }} />
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {questions.length} questions
              </span>
            </div>
            {expandedCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  {expandedCount} revealed
                </span>
              </div>
            )}
          </motion.div>

          {/* Questions */}
          {loading ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--color-text-light)', fontSize: '14px',
            }}>
              <div style={{
                width: '36px', height: '36px', border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-secondary)', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                margin: '0 auto 16px',
              }} />
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: 'var(--color-text-light)', fontSize: '14px',
            }}>
              No questions available for this role.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {questions.map((q, i) => (
                <motion.div
                  key={q.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={i}
                  style={{
                    background: 'var(--color-surface)',
                    border: `1px solid ${expanded[q.id] ? 'var(--color-secondary)' : 'var(--color-border)'}`,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    transition: 'border-color 200ms, box-shadow 200ms',
                    boxShadow: expanded[q.id] ? '0 4px 20px rgba(255, 107, 53, 0.08)' : 'none',
                  }}
                >
                  <button
                    onClick={() => toggle(q.id)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start',
                      gap: '14px', padding: '20px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* Question number */}
                    <span style={{
                      flexShrink: 0, width: '32px', height: '32px',
                      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: expanded[q.id] ? 'var(--color-secondary)' : 'var(--color-bg)',
                      color: expanded[q.id] ? 'white' : 'var(--color-text-muted)',
                      fontSize: '13px', fontWeight: 700,
                      transition: 'background 200ms, color 200ms',
                    }}>
                      {i + 1}
                    </span>

                    <span style={{
                      flex: 1, fontWeight: 500, fontSize: '15px',
                      color: 'var(--color-text)', lineHeight: 1.6,
                      paddingTop: '4px',
                    }}>
                      {q.question}
                    </span>

                    <span style={{
                      flexShrink: 0, width: '28px', height: '28px',
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: expanded[q.id] ? 'rgba(255, 107, 53, 0.1)' : 'var(--color-bg)',
                      color: expanded[q.id] ? 'var(--color-secondary)' : 'var(--color-text-light)',
                      transition: 'all 200ms',
                      marginTop: '4px',
                    }}>
                      {expanded[q.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {expanded[q.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          padding: '0 20px 20px',
                          paddingLeft: 'calc(20px + 32px + 14px)',
                        }}>
                          <div style={{
                            borderTop: '1px solid var(--color-border)',
                            paddingTop: '16px',
                          }}>
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                              padding: '4px 10px', borderRadius: '6px',
                              background: 'rgba(255, 107, 53, 0.08)',
                              marginBottom: '12px',
                            }}>
                              <Sparkles size={11} style={{ color: 'var(--color-secondary)' }} />
                              <span style={{
                                fontWeight: 700, fontSize: '10px',
                                color: 'var(--color-secondary)', textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}>
                                Model Answer
                              </span>
                            </div>
                            <p style={{
                              margin: 0, fontSize: '14px', lineHeight: 1.7,
                              color: 'var(--color-text-muted)',
                            }}>
                              {q.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
