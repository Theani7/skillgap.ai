import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MessageSquare, Sparkles, BookOpen, Target, Send, RotateCcw, CheckCircle } from 'lucide-react';
import api from '../services/api';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function PracticeMode({ roles, selectedRole, setSelectedRole, autoDetected, questions, loading }) {
  const [expanded, setExpanded] = useState({});
  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const expandedCount = Object.values(expanded).filter(Boolean).length;

  return (
    <>
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
    </>
  );
}

function AIInterviewMode({ selectedRole }) {
  const [sessionId, setSessionId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [questionNumber, setQuestionNumber] = useState(0);
  const [finished, setFinished] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, feedback]);

  const startInterview = async () => {
    setStarting(true);
    try {
      const res = await api.post('/api/mock-interview/start', {
        role: selectedRole,
      });
      setSessionId(res.data.session_id);
      setCurrentQuestion(res.data.question);
      setChatHistory([]);
      setFeedback('');
      setQuestionNumber(1);
      setFinished(false);
      setEvaluation(null);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || loading) return;
    setLoading(true);
    const currentQ = currentQuestion;
    const answer = userAnswer.trim();

    setChatHistory(prev => [...prev, { type: 'question', text: currentQ }, { type: 'answer', text: answer }]);
    setUserAnswer('');
    setFeedback('');

    try {
      const res = await api.post('/api/mock-interview/answer', {
        session_id: sessionId,
        question: currentQ,
        answer: answer,
        role: selectedRole,
        chat_history: chatHistory,
      });
      setFeedback(res.data.feedback);
      setCurrentQuestion(res.data.next_question);
      setQuestionNumber(res.data.question_number);
    } catch (_err) {
      setFeedback('Failed to get feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const finishInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/api/mock-interview/finish/${sessionId}`);
      setEvaluation(res.data);
      setFinished(true);
    } catch (err) {
      console.error('Failed to finish interview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!sessionId) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(255, 107, 53, 0.1)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <MessageSquare size={28} style={{ color: 'var(--color-secondary)' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
          AI-Powered Mock Interview
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
          Practice with an AI interviewer that asks role-specific questions, provides real-time feedback, and evaluates your performance.
        </p>
        <button
          onClick={startInterview}
          disabled={starting}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '10px',
            background: 'var(--color-secondary)', color: 'white',
            fontSize: '14px', fontWeight: 600, border: 'none',
            cursor: starting ? 'not-allowed' : 'pointer',
            opacity: starting ? 0.7 : 1,
          }}
        >
          {starting ? 'Starting...' : 'Start Interview'}
        </button>
      </div>
    );
  }

  if (finished && evaluation) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.1)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <CheckCircle size={28} style={{ color: 'var(--color-success)' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '8px' }}>
          Interview Complete!
        </h3>
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: '14px', padding: '24px', maxWidth: '500px', margin: '20px auto',
          textAlign: 'left',
        }}>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-muted)', margin: 0 }}>
            {evaluation.evaluation || evaluation.feedback || 'Thank you for practicing!'}
          </p>
        </div>
        <button
          onClick={startInterview}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            color: 'var(--color-text)', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={14} /> Start New Interview
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
      {/* Chat area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        background: 'var(--color-bg)', borderRadius: '14px',
        border: '1px solid var(--color-border)', marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.type === 'answer' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: '12px',
                background: msg.type === 'answer' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: msg.type === 'answer' ? 'white' : 'var(--color-text)',
                border: msg.type === 'answer' ? 'none' : '1px solid var(--color-border)',
                fontSize: '14px', lineHeight: 1.6,
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {feedback && (
            <div style={{
              padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Sparkles size={12} style={{ color: 'var(--color-success)' }} />
                <span style={{ fontWeight: 600, fontSize: '11px', color: 'var(--color-success)', textTransform: 'uppercase' }}>Feedback</span>
              </div>
              {feedback}
            </div>
          )}

          {currentQuestion && !loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: '12px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text)',
              }}>
                {currentQuestion}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '12px 16px', borderRadius: '12px',
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-light)', animation: 'pulse 1s infinite' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-light)', animation: 'pulse 1s infinite 0.2s' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-text-light)', animation: 'pulse 1s infinite 0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{
        display: 'flex', gap: '10px',
        padding: '16px', background: 'var(--color-surface)',
        borderRadius: '14px', border: '1px solid var(--color-border)',
      }}>
        <div style={{ flex: 1, fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
          Question {questionNumber}
        </div>
        <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
            placeholder="Type your answer..."
            rows={2}
            style={{
              flex: 1, padding: '12px', borderRadius: '10px',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)', color: 'var(--color-text)',
              fontSize: '14px', resize: 'none', outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || loading}
              style={{
                padding: '10px 16px', borderRadius: '10px',
                background: 'var(--color-secondary)', color: 'white',
                border: 'none', cursor: userAnswer.trim() && !loading ? 'pointer' : 'not-allowed',
                opacity: userAnswer.trim() && !loading ? 1 : 0.5,
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', fontWeight: 600,
              }}
            >
              <Send size={14} /> Send
            </button>
            <button
              onClick={finishInterview}
              disabled={loading}
              style={{
                padding: '8px 16px', borderRadius: '10px',
                background: 'transparent', color: 'var(--color-text-muted)',
                border: '1px solid var(--color-border)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px', fontWeight: 500,
              }}
            >
              End Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MockInterview() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);
  const [mode, setMode] = useState('practice');

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
    if (!selectedRole || mode !== 'practice') return;
    let cancelled = false;
    const load = async () => {
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
  }, [selectedRole, mode]);

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
              {mode === 'practice'
                ? 'Practice common interview questions for your target role. Expand each question to reveal a model answer.'
                : 'Practice with an AI interviewer that provides real-time feedback on your answers.'}
            </p>
          </div>

          {/* Mode toggle */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{
              display: 'flex', gap: '4px', marginBottom: '24px',
              padding: '4px', background: 'var(--color-surface)',
              borderRadius: '12px', border: '1px solid var(--color-border)',
              maxWidth: '300px', margin: '0 auto 24px',
            }}
          >
            {[
              { id: 'practice', label: 'Practice Questions', icon: BookOpen },
              { id: 'ai', label: 'AI Interview', icon: Sparkles },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: '10px',
                  border: 'none', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  background: mode === id ? 'var(--color-primary)' : 'transparent',
                  color: mode === id ? 'white' : 'var(--color-text-muted)',
                  transition: 'all 200ms',
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </motion.div>

          {/* Content */}
          {mode === 'practice' ? (
            <PracticeMode
              roles={roles}
              selectedRole={selectedRole}
              setSelectedRole={setSelectedRole}
              autoDetected={autoDetected}
              questions={questions}
              loading={loading}
            />
          ) : (
            <AIInterviewMode selectedRole={selectedRole} />
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
