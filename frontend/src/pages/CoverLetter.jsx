import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Sparkles, Copy, Check, Download, RotateCcw, Building,
  Briefcase, AlignLeft, Lightbulb, Mail, User, Clock, Hash, Loader2,
  AlertCircle, Target, Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Polished and formal' },
  { value: 'confident', label: 'Confident', desc: 'Bold and assertive' },
  { value: 'friendly', label: 'Friendly', desc: 'Warm and personable' },
];

const LENGTHS = [
  { value: 'short', label: 'Short', desc: '~150 words' },
  { value: 'standard', label: 'Standard', desc: '~250 words' },
  { value: 'detailed', label: 'Detailed', desc: '~400 words' },
];

const TIPS = [
  { icon: Target, title: 'Lead with the role', text: 'Mention the exact position title in your opening sentence to show you read the posting.' },
  { icon: Zap, title: 'One specific win', text: 'Highlight a single measurable accomplishment that maps to their biggest need.' },
  { icon: Mail, title: 'Mind the sign-off', text: '"Sincerely" still wins. Skip the cliché "I look forward to hearing from you."' },
  { icon: Hash, title: 'Mirror their language', text: 'Reuse 2-3 keywords from the job description. Many filters look for an exact match.' },
];

const fieldStyle = (focus) => ({
  width: '100%', height: '44px', padding: '0 14px',
  border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
  outline: 'none', transition: 'border-color 150ms ease', fontFamily: 'inherit',
  boxSizing: 'border-box',
});

const textareaStyle = (focus) => ({
  ...fieldStyle(focus),
  height: 'auto', minHeight: '120px', padding: '12px 14px', resize: 'vertical', lineHeight: 1.6,
});

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '12px', fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-muted)', marginBottom: '6px',
  textTransform: 'uppercase', letterSpacing: '0.04em',
};

const CoverLetter = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    company: '',
    role: '',
    job_description: '',
  });
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [lastRequest, setLastRequest] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await api.get('/api/user/profile');
        const p = res.data.profile || {};
        setFormData((prev) => ({
          ...prev,
          name: prev.name || p.full_name || user?.full_name || '',
          email: prev.email || p.email || user?.email || '',
        }));
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [user?.username, user?.full_name, user?.email, user]);

  const wordCount = useMemo(
    () => (coverLetter.trim() ? coverLetter.trim().split(/\s+/).length : 0),
    [coverLetter]
  );
  const readMinutes = useMemo(
    () => Math.max(1, Math.round(wordCount / 220)),
    [wordCount]
  );

  const generate = useCallback(async (toneOverride, lengthOverride) => {
    const activeTone = toneOverride ?? tone;
    const activeLength = lengthOverride ?? length;
    if (!formData.company.trim() || !formData.role.trim()) {
      setError('Please enter a company and role.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const toneHint = `\n\n[Tone: ${activeTone}. Length: ${activeLength}.]`;
      const res = await api.post('/api/cover-letter/generate', {
        company: formData.company,
        role: formData.role,
        job_description: (formData.job_description || '') + toneHint,
        profile: { name: formData.name, email: formData.email },
      });
      const text = res.data?.cover_letter || '';
      setCoverLetter(text);
      setLastRequest({ ...formData, tone: activeTone, length: activeLength });
    } catch (err) {
      setError(err.response?.data?.detail || 'Error generating cover letter.');
    } finally {
      setLoading(false);
    }
  }, [formData, tone, length]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    generate();
  };

  const copyTimerRef = useRef(null);
  useEffect(() => () => { if (copyTimerRef.current) clearTimeout(copyTimerRef.current); }, []);

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
    } catch (_) { /* clipboard blocked */ }
    setCopied(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const safeCompany = String(formData.company || '').replace(/[<>"]/g, '');
    const safeRole = String(formData.role || '').replace(/[<>"]/g, '');
    const w = window.open('', '_blank');
    if (!w) {
      setError('Popup blocked — please allow popups to download.');
      return;
    }
    w.document.open();
    w.document.write('<!doctype html><html><head><title>Cover Letter</title><meta charset="utf-8"><style>body{font-family:Georgia,serif;padding:60px 50px;max-width:720px;margin:0 auto;line-height:1.7;color:#1f2937;}h1{font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;margin:0 0 24px;}p{font-size:14.5px;margin:0 0 14px;}footer{margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;text-align:center;}</style></head><body><h1></h1><div id="body"></div><footer>Generated by SkillGap.ai</footer></body></html>');
    w.document.close();
    const h1 = w.document.querySelector('h1');
    if (h1) h1.textContent = `Cover Letter · ${safeCompany} · ${safeRole}`;
    const body = w.document.getElementById('body');
    if (body) {
      const lines = coverLetter.split('\n').map((p) => p.trim()).filter(Boolean);
      lines.forEach((line) => {
        const p = w.document.createElement('p');
        p.textContent = line;
        body.appendChild(p);
      });
    }
    setTimeout(() => { try { w.print(); } catch (_) { /* noop */ } }, 250);
  };

  const handleRegenerate = async () => {
    let nextTone = tone;
    if (lastRequest) {
      const alternates = TONES.filter((t) => t.value !== tone);
      nextTone = alternates[Math.floor(Math.random() * alternates.length)].value;
      setTone(nextTone);
    }
    await generate(nextTone, length);
  };

  const setField = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--color-bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-180px', right: '-150px', width: '480px', height: '480px',
        borderRadius: '50%', opacity: 0.05, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-180px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.04, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
            color: 'var(--color-primary)', background: 'var(--indigo-50)',
            border: '1px solid var(--indigo-100)', marginBottom: '14px',
          }}>
            <Sparkles size={11} /> AI Writer
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 36px)', fontWeight: 'var(--font-extrabold)',
            letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text)',
            margin: 0, marginBottom: '6px',
          }}>
            Cover Letter Generator
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', margin: 0 }}>
            A personalized letter in under 10 seconds, ready to send.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)',
          gap: '20px', alignItems: 'start',
        }}>
          <style>{`
            @media (max-width: 960px) {
              .cl-two-col { grid-template-columns: 1fr !important; }
            }
          `}</style>
          <div className="cl-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.1fr)', gap: '20px', alignItems: 'start', gridColumn: '1 / -1' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
              className="card" style={{ padding: '24px' }}
            >
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <FormSection
                  icon={User} title="Your details"
                  description="Pulled from your Profile — edit anytime."
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <FocusInput label="Full name" icon={User} value={formData.name} onChange={setField('name')} placeholder="Jane Doe" />
                    <FocusInput label="Email" icon={Mail} type="email" value={formData.email} onChange={setField('email')} placeholder="jane@email.com" />
                  </div>
                </FormSection>

                <FormSection
                  icon={Briefcase} title="The role"
                  description="What company and what position."
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <FocusInput label="Company *" icon={Building} value={formData.company} onChange={setField('company')} placeholder="Anthropic" required />
                    <FocusInput label="Role *" icon={Briefcase} value={formData.role} onChange={setField('role')} placeholder="Senior Engineer" required />
                  </div>
                  <FocusTextarea
                    label="Job description"
                    icon={AlignLeft}
                    optional
                    value={formData.job_description}
                    onChange={setField('job_description')}
                    placeholder="Paste the job description here. The more detail, the more tailored the letter."
                  />
                </FormSection>

                <FormSection
                  icon={Sparkles} title="Tone & length"
                  description="Shape the voice and depth of your letter."
                >
                  <PillGroup
                    label="Tone" value={tone} onChange={setTone} options={TONES}
                  />
                  <PillGroup
                    label="Length" value={length} onChange={setLength} options={LENGTHS}
                  />
                </FormSection>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-error-light)', color: 'var(--color-error)',
                        fontSize: '13px', fontWeight: 'var(--font-semibold)',
                      }}
                    >
                      <AlertCircle size={14} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit" disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    width: '100%', height: '48px', padding: '0 20px',
                    borderRadius: 'var(--radius-lg)', border: 'none',
                    background: loading
                      ? 'var(--color-border)'
                      : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    color: loading ? 'var(--color-text-muted)' : 'white',
                    fontWeight: 'var(--font-semibold)', fontSize: '15px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: loading ? 'none' : '0 6px 18px rgba(79, 70, 229, 0.3)',
                    transition: 'all 150ms ease',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
              className="card" style={{ padding: 0, overflow: 'hidden' }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
                flexWrap: 'wrap', gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                    background: 'var(--indigo-50)', color: 'var(--color-primary)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileText size={15} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
                      Your cover letter
                    </h3>
                    <AnimatePresence mode="wait">
                      {coverLetter ? (
                        <motion.p
                          key="meta"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}
                        >
                          {wordCount} words &middot; {readMinutes} min read
                        </motion.p>
                      ) : (
                        <motion.p
                          key="empty-meta"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}
                        >
                          Awaiting your first letter
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {coverLetter && (
                    <button
                      onClick={handleRegenerate} disabled={loading} title="Regenerate"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        height: '32px', padding: '0 12px', borderRadius: 'var(--radius-md)',
                        background: 'transparent', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 'var(--font-semibold)',
                        cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                      }}
                    >
                      <RotateCcw size={12} /> New
                    </button>
                  )}
                  <button
                    onClick={handleCopy} disabled={!coverLetter} title="Copy"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      height: '32px', padding: '0 12px', borderRadius: 'var(--radius-md)',
                      background: 'transparent', border: '1px solid var(--color-border)',
                      color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
                      fontSize: '12px', fontWeight: 'var(--font-semibold)',
                      cursor: !coverLetter ? 'not-allowed' : 'pointer',
                      opacity: !coverLetter ? 0.5 : 1,
                      transition: 'all 150ms ease',
                    }}
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload} disabled={!coverLetter} title="Print or save as PDF"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      height: '32px', padding: '0 12px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-text)', border: 'none',
                      color: 'white', fontSize: '12px', fontWeight: 'var(--font-semibold)',
                      cursor: !coverLetter ? 'not-allowed' : 'pointer',
                      opacity: !coverLetter ? 0.5 : 1,
                    }}
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>

              <div style={{
                minHeight: '440px',
                background: 'var(--color-bg)',
                padding: '24px',
                maxHeight: '540px', overflowY: 'auto',
              }}>
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{
                        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
                        padding: '32px 36px', boxShadow: 'var(--shadow-sm)',
                        display: 'flex', flexDirection: 'column', gap: '14px',
                      }}
                    >
                      {[100, 90, 95, 70, 85, 50].map((w, i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
                          style={{
                            height: '10px', width: `${w}%`,
                            background: 'var(--color-border)', borderRadius: '4px',
                          }}
                        />
                      ))}
                    </motion.div>
                  ) : coverLetter ? (
                    <motion.article
                      key="letter" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{
                        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
                        padding: '40px 44px', boxShadow: 'var(--shadow-sm)',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: '15px', lineHeight: 1.8,
                        color: 'var(--color-text)',
                      }}
                    >
                      {coverLetter.split('\n').filter((p) => p.trim()).map((para, i) => (
                        <p key={i} style={{ margin: '0 0 16px 0' }}>{para}</p>
                      ))}
                    </motion.article>
                  ) : (
                    <motion.div
                      key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{
                        background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
                        padding: '60px 24px', textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--indigo-50)', color: 'var(--color-primary)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px',
                      }}>
                        <FileText size={28} />
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 6px' }}>
                        Your letter will appear here
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Fill in the company, role, and (optionally) the job description — then hit generate.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
          style={{ marginTop: '32px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Lightbulb size={16} color="var(--color-primary)" />
            <h2 style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
              What makes a great cover letter
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
          }}>
            {TIPS.map((tip) => (
              <div
                key={tip.title}
                className="card"
                style={{ padding: '18px' }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
                  background: 'var(--indigo-50)', color: 'var(--color-primary)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '10px',
                }}>
                  <tip.icon size={15} />
                </div>
                <h4 style={{ fontSize: '13px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 4px' }}>
                  {tip.title}
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

const FormSection = (props) => {
  const { icon: Icon, title, description, children } = props;
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px',
      }}>
        <div style={{
          width: '24px', height: '24px', borderRadius: 'var(--radius-sm)',
          background: 'var(--indigo-50)', color: 'var(--color-primary)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={12} />
        </div>
        <div>
          <h3 style={{ fontSize: '12px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </h3>
          {description && (
            <p style={{ fontSize: '11px', color: 'var(--color-text-light)', margin: '1px 0 0' }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  );
};

const FocusInput = (props) => {
  const { label, icon: Icon, optional, ...inputProps } = props;
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label style={labelStyle}>
        {Icon && <Icon size={11} />}
        {label}
        {optional && <span style={{ marginLeft: '4px', color: 'var(--color-text-light)', fontWeight: 'var(--font-normal)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>}
      </label>
      <input
        {...inputProps}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={fieldStyle(focus)}
      />
    </div>
  );
};

const FocusTextarea = (props) => {
  const { label, icon: Icon, optional, ...textareaProps } = props;
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label style={labelStyle}>
        {Icon && <Icon size={11} />}
        {label}
        {optional && <span style={{ marginLeft: '4px', color: 'var(--color-text-light)', fontWeight: 'var(--font-normal)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>}
      </label>
      <textarea
        {...textareaProps}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={textareaStyle(focus)}
      />
    </div>
  );
};

const PillGroup = (props) => {
  const { label, value, onChange, options } = props;
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value} type="button"
              onClick={() => onChange(opt.value)}
              title={opt.desc}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '8px 14px', borderRadius: 'var(--radius-full)',
                fontSize: '12px', fontWeight: 'var(--font-semibold)',
                cursor: 'pointer', transition: 'all 150ms ease',
                border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: active ? 'var(--indigo-50)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
              }}
            >
              {opt.label}
              <span style={{
                fontSize: '10px', color: active ? 'var(--color-primary)' : 'var(--color-text-light)',
                fontWeight: 'var(--font-normal)', opacity: 0.7,
              }}>
                {opt.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CoverLetter;
