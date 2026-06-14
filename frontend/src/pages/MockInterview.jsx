import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Sparkles } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export default function MockInterview() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/mock-interview`).then(res => {
      setRoles(res.data.roles);
      if (res.data.roles.length > 0) {
        setSelectedRole(res.data.roles[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    setExpanded({});
    axios.get(`${API}/api/mock-interview/${encodeURIComponent(selectedRole)}`)
      .then(res => setQuestions(res.data.questions))
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const toggle = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <MessageSquare size={28} style={{ color: 'var(--color-secondary)' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: 0 }}>
          Mock Interview
        </h1>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Select a role to practice common interview questions.
      </p>

      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
          Target Role
        </label>
        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            fontSize: '1rem',
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
          Loading questions...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {questions.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'var(--color-surface)',
              }}
            >
              <button
                onClick={() => toggle(q.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '0.95rem' }}>
                  {i + 1}. {q.question}
                </span>
                {expanded[q.id] ? (
                  <ChevronUp size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                ) : (
                  <ChevronDown size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                )}
              </button>
              <AnimatePresence>
                {expanded[q.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      padding: '0 1.25rem 1rem',
                      borderTop: '1px solid var(--color-border-light)',
                      color: 'var(--color-text-muted)',
                      lineHeight: 1.6,
                      fontSize: '0.9rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '0.75rem' }}>
                        <Sparkles size={14} style={{ color: 'var(--color-secondary)' }} />
                        <span style={{ fontWeight: 600, color: 'var(--color-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                          Answer
                        </span>
                      </div>
                      {q.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}