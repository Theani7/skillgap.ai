import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, MapPin, Phone, FileText, Briefcase, Target, Calendar, DollarSign,
  Edit2, Save, X, UploadCloud, Github, Linkedin, Clock, TrendingUp, Award,
  Activity, ArrowRight, Sparkles, Check, AlertOctagon,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ResultsDisplay from '../components/ResultsDisplay';
import PageLoader from '../components/Skeleton';

const fieldStyle = (focus) => ({
  width: '100%', height: '42px', padding: '0 12px',
  border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-md)',
  fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
  outline: 'none', transition: 'border-color 150ms ease', fontFamily: 'inherit',
  boxSizing: 'border-box',
});

const textareaStyle = (focus) => ({
  ...fieldStyle(focus),
  height: 'auto', minHeight: '84px', padding: '10px 12px', resize: 'vertical', lineHeight: 1.5,
});

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '12px', fontWeight: 'var(--font-semibold)',
  color: 'var(--color-text-muted)', marginBottom: '6px',
};

const EditableField = ({ label, value, onChange, icon: Icon, type = 'text', placeholder, as = 'input', focusStyles }) => {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label style={labelStyle}>{Icon && <Icon size={12} />} {label}</label>
      {as === 'textarea' ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          rows={3}
          style={{ ...textareaStyle(focus), ...focusStyles }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={placeholder}
          style={{ ...fieldStyle(focus), ...focusStyles }}
        />
      )}
    </div>
  );
};

const CardHeader = (props) => {
  const { icon: Icon, title, subtitle, action } = props;
  return (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: '12px', marginBottom: '20px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
        background: 'var(--indigo-50)', color: 'var(--color-primary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={16} />
      </div>
      <div>
        <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h3>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {action}
  </div>
  );
};

const PrimaryButton = ({ children, onClick, type = 'button', disabled = false }) => (
  <button
    type={type} onClick={onClick} disabled={disabled}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      height: '36px', padding: '0 16px', borderRadius: 'var(--radius-md)',
      background: disabled ? 'var(--color-border)' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
      color: disabled ? 'var(--color-text-muted)' : 'white',
      fontWeight: 'var(--font-semibold)', fontSize: '13px',
      border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      boxShadow: disabled ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.2)',
      transition: 'opacity 150ms ease',
    }}
  >
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, type = 'button' }) => (
  <button
    type={type} onClick={onClick}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      height: '36px', padding: '0 16px', borderRadius: 'var(--radius-md)',
      background: 'transparent', border: '1px solid var(--color-border)',
      color: 'var(--color-text-muted)', fontWeight: 'var(--font-semibold)', fontSize: '13px',
      cursor: 'pointer', transition: 'all 150ms ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--color-bg)';
      e.currentTarget.style.color = 'var(--color-text)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = 'var(--color-text-muted)';
    }}
  >
    {children}
  </button>
);

const Profile = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);
  const savedTimer = useRef(null);

  useEffect(() => () => { if (savedTimer.current) clearTimeout(savedTimer.current); }, []);

  const [profile, setProfile] = useState({
    full_name: '', phone: '', location: '', bio: '',
    current_role: '', experience_years: '',
    linkedin_url: '', github_url: '',
  });
  const [preferences, setPreferences] = useState({
    target_role: '', timeline_months: 6,
    preferred_location: '', salary_target: 0,
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);
  const [prefsDraft, setPrefsDraft] = useState(preferences);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savedPrefs, setSavedPrefs] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [prefsError, setPrefsError] = useState('');

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const { signal } = controller;
    const fetchData = async () => {
      try {
        const [historyRes, profileRes, prefRes] = await Promise.all([
          api.get('/api/user/history', { signal }),
          api.get('/api/user/profile', { signal }),
          api.get('/api/user/preferences', { signal }),
        ]);
        const sorted = (historyRes.data.history || []).sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setHistory(sorted);
        const p = {
          full_name: profileRes.data.profile?.full_name || user?.full_name || user?.username || '',
          phone: profileRes.data.profile?.phone || '',
          location: profileRes.data.profile?.location || '',
          bio: profileRes.data.profile?.bio || '',
          current_role: profileRes.data.profile?.current_role || '',
          experience_years: profileRes.data.profile?.experience_years || '',
          linkedin_url: profileRes.data.profile?.linkedin_url || '',
          github_url: profileRes.data.profile?.github_url || '',
        };
        const pr = {
          target_role: prefRes.data.preferences?.target_role || '',
          timeline_months: prefRes.data.preferences?.timeline_months || 6,
          preferred_location: prefRes.data.preferences?.preferred_location || '',
          salary_target: prefRes.data.preferences?.salary_target || 0,
        };
        setProfile(p);
        setProfileDraft(p);
        setPreferences(pr);
        setPrefsDraft(pr);
      } catch (err) {
        if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError('');
    try {
      await api.put('/api/user/profile', profileDraft);
      setProfile(profileDraft);
      setEditingProfile(false);
      setSavedProfile(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedProfile(false), 2200);
    } catch (err) {
      console.error(err);
      setProfileError('Failed to save profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePrefs = async () => {
    setSavingPrefs(true);
    setPrefsError('');
    try {
      const payload = {
        ...prefsDraft,
        salary_target: Number(prefsDraft.salary_target) || 0,
        timeline_months: Number(prefsDraft.timeline_months) || 6,
      };
      await api.put('/api/user/preferences', payload);
      setPreferences(payload);
      setEditingPrefs(false);
      setSavedPrefs(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedPrefs(false), 2200);
    } catch (err) {
      console.error(err);
      setPrefsError('Failed to save preferences. Please try again.');
    } finally {
      setSavingPrefs(false);
    }
  };

  if (loading) return <PageLoader />;

  if (selectedResult) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '32px 16px' }}>
        <div className="container" style={{ maxWidth: '900px' }}>
          <button
            onClick={() => setSelectedResult(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 500,
              padding: '8px 12px', borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg)';
              e.currentTarget.style.color = 'var(--color-text)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Profile
          </button>
          <ResultsDisplay data={selectedResult} onReset={() => setSelectedResult(null)} />
        </div>
      </motion.div>
    );
  }

  const chartData = history.map((item) => ({
    date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(item.resume_score || 0),
  }));

  const latestScore = history.length > 0 ? Math.round(history[history.length - 1].resume_score) : 0;
  const avgScore = history.length > 0
    ? Math.round(history.reduce((a, b) => a + (b.resume_score || 0), 0) / history.length)
    : 0;
  const totalAnalyses = history.length;
  const bestScore = history.length > 0
    ? Math.round(Math.max(...history.map((h) => h.resume_score || 0)))
    : 0;

  const getScoreColor = (s) => {
    if (s >= 75) return 'var(--color-success)';
    if (s >= 50) return '#D97706';
    return 'var(--color-error)';
  };

  const avatarLetter = (profile.full_name || user?.username || 'U').charAt(0).toUpperCase();

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
        position: 'absolute', bottom: '-220px', left: '-180px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.04, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="card"
          style={{ padding: '28px 32px', marginBottom: '24px' }}
        >
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', minWidth: 0 }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                color: 'white', fontSize: '28px', fontWeight: 'var(--font-extrabold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(79, 70, 229, 0.3)',
                flexShrink: 0,
              }}>
                {avatarLetter}
              </div>
              <div style={{ minWidth: 0 }}>
                <h1 style={{
                  fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 'var(--font-extrabold)',
                  letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text)',
                  margin: 0, marginBottom: '4px',
                }}>
                  {profile.full_name || user?.username || 'Welcome'}
                </h1>
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '14px',
                  fontSize: '13px', color: 'var(--color-text-muted)',
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={13} /> {user?.email}
                  </span>
                  {profile.location && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} /> {profile.location}
                    </span>
                  )}
                  {profile.current_role && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <Briefcase size={13} /> {profile.current_role}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
              <Link to="/jobs" style={{ textDecoration: 'none' }}>
                <SecondaryButton>
                  <Briefcase size={14} /> Jobs
                </SecondaryButton>
              </Link>
              <Link to="/app" style={{ textDecoration: 'none' }}>
                <PrimaryButton>
                  <UploadCloud size={14} /> New Analysis
                </PrimaryButton>
              </Link>
            </div>
          </div>

          <AnimatePresence>
            {savedProfile && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: '16px', padding: '10px 14px',
                  background: 'var(--emerald-50)', color: 'var(--color-success)',
                  border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: 'var(--font-semibold)',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Check size={14} /> Profile saved
              </motion.div>
            )}
            {savedPrefs && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: '16px', padding: '10px 14px',
                  background: 'var(--emerald-50)', color: 'var(--color-success)',
                  border: '1px solid #A7F3D0', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: 'var(--font-semibold)',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Check size={14} /> Preferences saved
              </motion.div>
            )}
            {profileError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: '16px', padding: '10px 14px',
                  background: 'var(--color-error-light)', color: 'var(--color-error)',
                  border: '1px solid #FECACA', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: 'var(--font-semibold)',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <AlertOctagon size={14} /> {profileError}
                <button
                  onClick={() => setProfileError('')}
                  style={{
                    marginLeft: '6px', background: 'transparent', border: 'none',
                    color: 'var(--color-error)', cursor: 'pointer', padding: '0',
                    display: 'inline-flex', alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
            {prefsError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{
                  marginTop: '16px', padding: '10px 14px',
                  background: 'var(--color-error-light)', color: 'var(--color-error)',
                  border: '1px solid #FECACA', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: 'var(--font-semibold)',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                }}
              >
                <AlertOctagon size={14} /> {prefsError}
                <button
                  onClick={() => setPrefsError('')}
                  style={{
                    marginLeft: '6px', background: 'transparent', border: 'none',
                    color: 'var(--color-error)', cursor: 'pointer', padding: '0',
                    display: 'inline-flex', alignItems: 'center',
                  }}
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px', marginBottom: '24px',
          }}
        >
          {[
            { label: 'Latest Score', value: history.length ? `${latestScore}%` : '—', color: getScoreColor(latestScore), icon: Award },
            { label: 'Best Score', value: history.length ? `${bestScore}%` : '—', color: getScoreColor(bestScore), icon: TrendingUp },
            { label: 'Average', value: history.length ? `${avgScore}%` : '—', color: 'var(--color-primary)', icon: Activity },
            { label: 'Analyses', value: totalAnalyses, color: 'var(--color-text)', icon: FileText },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: '20px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px',
              }}>
                <span style={{
                  fontSize: '11px', fontWeight: 'var(--font-bold)',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--color-text-muted)',
                }}>
                  {s.label}
                </span>
                <div style={{
                  width: '28px', height: '28px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)', color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon size={14} />
                </div>
              </div>
              <div style={{
                fontSize: '26px', fontWeight: 'var(--font-extrabold)',
                color: s.color, letterSpacing: 'var(--tracking-tight)', lineHeight: 1,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '16px', marginBottom: '24px',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
            className="card"
            style={{ padding: '24px' }}
          >
            <CardHeader
              icon={User}
              title="Personal Information"
              subtitle="How you appear on the platform."
              action={
                editingProfile ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SecondaryButton onClick={() => { setEditingProfile(false); setProfileDraft(profile); }}>
                      <X size={13} /> Cancel
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSaveProfile} disabled={savingProfile}>
                      <Save size={13} /> {savingProfile ? 'Saving…' : 'Save'}
                    </PrimaryButton>
                  </div>
                ) : (
                  <SecondaryButton onClick={() => setEditingProfile(true)}>
                    <Edit2 size={13} /> Edit
                  </SecondaryButton>
                )
              }
            />

            <AnimatePresence mode="wait">
              {editingProfile ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <EditableField
                    label="Full Name" icon={User}
                    value={profileDraft.full_name}
                    onChange={(v) => setProfileDraft({ ...profileDraft, full_name: v })}
                    placeholder="Your full name"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                    <EditableField
                      label="Phone" icon={Phone} type="tel"
                      value={profileDraft.phone}
                      onChange={(v) => setProfileDraft({ ...profileDraft, phone: v })}
                      placeholder="+1 (555) 000-0000"
                    />
                    <EditableField
                      label="Location" icon={MapPin}
                      value={profileDraft.location}
                      onChange={(v) => setProfileDraft({ ...profileDraft, location: v })}
                      placeholder="City, Country"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                    <EditableField
                      label="Current Role" icon={Briefcase}
                      value={profileDraft.current_role}
                      onChange={(v) => setProfileDraft({ ...profileDraft, current_role: v })}
                      placeholder="e.g., Software Engineer"
                    />
                    <EditableField
                      label="Experience (years)" icon={Clock}
                      value={profileDraft.experience_years}
                      onChange={(v) => setProfileDraft({ ...profileDraft, experience_years: v })}
                      placeholder="e.g., 3"
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                    <EditableField
                      label="LinkedIn" icon={Linkedin}
                      value={profileDraft.linkedin_url}
                      onChange={(v) => setProfileDraft({ ...profileDraft, linkedin_url: v })}
                      placeholder="https://linkedin.com/in/…"
                    />
                    <EditableField
                      label="GitHub" icon={Github}
                      value={profileDraft.github_url}
                      onChange={(v) => setProfileDraft({ ...profileDraft, github_url: v })}
                      placeholder="https://github.com/…"
                    />
                  </div>
                  <EditableField
                    label="Bio" icon={FileText} as="textarea"
                    value={profileDraft.bio}
                    onChange={(v) => setProfileDraft({ ...profileDraft, bio: v })}
                    placeholder="A short intro that travels with your applications."
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <DetailRow icon={User} label="Full Name" value={profile.full_name || '—'} />
                  <DetailRow icon={Phone} label="Phone" value={profile.phone || '—'} />
                  <DetailRow icon={MapPin} label="Location" value={profile.location || '—'} />
                  <DetailRow icon={Briefcase} label="Current Role" value={profile.current_role || '—'} />
                  <DetailRow icon={Clock} label="Experience" value={profile.experience_years ? `${profile.experience_years} years` : '—'} />
                  <DetailRow icon={Linkedin} label="LinkedIn" value={profile.linkedin_url} link />
                  <DetailRow icon={Github} label="GitHub" value={profile.github_url} link />
                  <DetailRow icon={FileText} label="Bio" value={profile.bio || '—'} multiline />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
            className="card"
            style={{ padding: '24px' }}
          >
            <CardHeader
              icon={Target}
              title="Career Preferences"
              subtitle="Powers AI matches and job recommendations."
              action={
                editingPrefs ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <SecondaryButton onClick={() => { setEditingPrefs(false); setPrefsDraft(preferences); }}>
                      <X size={13} /> Cancel
                    </SecondaryButton>
                    <PrimaryButton onClick={handleSavePrefs} disabled={savingPrefs}>
                      <Save size={13} /> {savingPrefs ? 'Saving…' : 'Save'}
                    </PrimaryButton>
                  </div>
                ) : (
                  <SecondaryButton onClick={() => setEditingPrefs(true)}>
                    <Edit2 size={13} /> Edit
                  </SecondaryButton>
                )
              }
            />

            <AnimatePresence mode="wait">
              {editingPrefs ? (
                <motion.div
                  key="edit-prefs"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <EditableField
                    label="Target Role" icon={Target}
                    value={prefsDraft.target_role}
                    onChange={(v) => setPrefsDraft({ ...prefsDraft, target_role: v })}
                    placeholder="e.g., Senior Frontend Engineer"
                  />
                  <EditableField
                    label="Preferred Location" icon={MapPin}
                    value={prefsDraft.preferred_location}
                    onChange={(v) => setPrefsDraft({ ...prefsDraft, preferred_location: v })}
                    placeholder="e.g., Remote, Berlin"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                    <EditableField
                      label="Timeline (months)" icon={Calendar} type="number"
                      value={prefsDraft.timeline_months}
                      onChange={(v) => setPrefsDraft({ ...prefsDraft, timeline_months: v })}
                      placeholder="6"
                    />
                    <EditableField
                      label="Salary Target (USD)" icon={DollarSign} type="number"
                      value={prefsDraft.salary_target}
                      onChange={(v) => setPrefsDraft({ ...prefsDraft, salary_target: v })}
                      placeholder="120000"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view-prefs"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  <DetailRow icon={Target} label="Target Role" value={preferences.target_role || '—'} />
                  <DetailRow icon={MapPin} label="Preferred Location" value={preferences.preferred_location || '—'} />
                  <DetailRow icon={Calendar} label="Timeline" value={`${preferences.timeline_months} months`} />
                  <DetailRow
                    icon={DollarSign}
                    label="Salary Target"
                    value={preferences.salary_target ? `$${Number(preferences.salary_target).toLocaleString()}` : '—'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
            style={{ padding: '24px', marginBottom: '24px' }}
          >
            <CardHeader
              icon={Activity}
              title="Score Progression"
              subtitle="Your resume quality over time."
            />
            <div style={{ width: '100%', height: '220px' }}>
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 5, right: 12, bottom: 5, left: -10 }}>
                  <defs>
                    <linearGradient id="profileScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-text-muted)"
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    domain={[0, 100]}
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-md)',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'var(--color-text)', fontWeight: 'var(--font-bold)' }}
                  />
                  <Area
                    type="monotone" dataKey="score"
                    stroke="var(--color-primary)" fill="url(#profileScoreGrad)"
                    strokeWidth={2.5}
                    activeDot={{ r: 5, fill: 'var(--color-primary)', stroke: 'white', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
          className="card"
          style={{ padding: '24px' }}
        >
          <CardHeader
            icon={Clock}
            title="Recent Analyses"
            subtitle="Click any row to view the full report."
          />

          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--indigo-50)', color: 'var(--color-primary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '14px',
              }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 6px' }}>
                No analyses yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
                Upload your first resume to get AI-powered insights.
              </p>
              <Link to="/app" style={{ textDecoration: 'none' }}>
                <PrimaryButton>
                  <UploadCloud size={14} /> Analyze Resume
                </PrimaryButton>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...history].reverse().slice(0, 6).map((item, i) => {
                const score = Math.round(item.resume_score || 0);
                const date = new Date(item.timestamp);
                return (
                  <motion.button
                    key={item.id || i}
                    type="button"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => item.analysis_data && setSelectedResult(item.analysis_data)}
                    disabled={!item.analysis_data}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '16px',
                      padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                      cursor: item.analysis_data ? 'pointer' : 'default',
                      transition: 'all 150ms ease', width: '100%', textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      if (!item.analysis_data) return;
                      e.currentTarget.style.borderColor = 'var(--indigo-200)';
                      e.currentTarget.style.background = 'var(--indigo-50)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.background = 'var(--color-bg)';
                    }}
                  >
                    <div style={{
                      width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <FileText size={18} color="var(--color-primary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px', fontWeight: 'var(--font-bold)',
                        color: 'var(--color-text)', marginBottom: '2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.target_role || item.predicted_field || 'Resume Analysis'}
                      </div>
                      <div style={{
                        fontSize: '12px', color: 'var(--color-text-muted)',
                        display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                      }}>
                        <span>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {item.missing_skills?.length > 0 && (
                          <>
                            <span>&middot;</span>
                            <span>{item.missing_skills.length} skill gaps</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '20px', fontWeight: 'var(--font-extrabold)',
                      color: getScoreColor(score), flexShrink: 0, minWidth: '52px', textAlign: 'right',
                    }}>
                      {score}
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 'var(--font-medium)' }}>%</span>
                    </div>
                    {item.analysis_data && (
                      <ArrowRight size={15} color="var(--color-text-muted)" style={{ flexShrink: 0 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const DetailRow = (props) => {
  const { icon: Icon, label, value, link = false, multiline = false } = props;
  return (
  <div style={{
    display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: '12px',
    padding: '10px 12px', borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg)',
  }}>
    <div style={{
      width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface)', color: 'var(--color-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, border: '1px solid var(--color-border)',
    }}>
      <Icon size={14} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '11px', fontWeight: 'var(--font-semibold)',
        color: 'var(--color-text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.04em', marginBottom: '2px',
      }}>
        {label}
      </div>
      {link && value ? (
        <a
          href={value} target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: '13px', fontWeight: 'var(--font-semibold)',
            color: 'var(--color-primary)', textDecoration: 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
          }}
        >
          {value}
        </a>
      ) : (
        <div style={{
          fontSize: '13px', fontWeight: 'var(--font-semibold)',
          color: value && value !== '—' ? 'var(--color-text)' : 'var(--color-text-light)',
          wordBreak: 'break-word',
          ...(multiline ? { whiteSpace: 'pre-wrap', lineHeight: 1.5 } : {}),
        }}>
          {value || '—'}
        </div>
      )}
    </div>
  </div>
  );
};

export default Profile;
