import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase, Plus, Trash2, Edit2, Save, X, MapPin, DollarSign, ExternalLink,
  CheckCircle, Clock, XCircle, AlertCircle, Send, Search, Sparkles, Calendar, FileText, TrendingUp, ArrowUpRight,
  AlertTriangle, AlertOctagon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../components/Skeleton';

const STATUS_META = {
  applied:    { label: 'Applied',    color: 'var(--color-primary)', bg: 'var(--indigo-50)',     icon: Send },
  interview:  { label: 'Interview',  color: '#D97706',             bg: '#FEF3C7',              icon: Clock },
  offer:      { label: 'Offer',      color: 'var(--color-success)', bg: 'var(--emerald-50)',   icon: CheckCircle },
  rejected:   { label: 'Rejected',   color: 'var(--color-error)',   bg: 'var(--color-error-light)', icon: XCircle },
  withdrawn:  { label: 'Withdrawn',  color: 'var(--color-text-muted)', bg: 'var(--color-bg)',  icon: AlertCircle },
};

const STATUS_KEYS = Object.keys(STATUS_META);
const STATUS_FILTERS = [{ value: 'all', label: 'All' }, ...STATUS_KEYS.map((k) => ({ value: k, label: STATUS_META[k].label }))];

const StatusPill = ({ status, size = 'sm' }) => {
  const meta = STATUS_META[status] || STATUS_META.applied;
  const Icon = meta.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: size === 'sm' ? '3px 8px' : '5px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: size === 'sm' ? '11px' : '12px',
      fontWeight: 'var(--font-semibold)',
      color: meta.color, background: meta.bg,
    }}>
      <Icon size={size === 'sm' ? 11 : 13} />
      {meta.label}
    </span>
  );
};

const CompanyAvatar = ({ company }) => {
  const letter = (company || '?').trim().charAt(0).toUpperCase();
  const colors = [
    ['var(--indigo-100)', 'var(--color-primary)'],
    ['var(--emerald-50)', 'var(--color-success)'],
    ['#FEF3C7', '#D97706'],
    ['var(--color-error-light)', 'var(--color-error)'],
    ['var(--violet-50)', 'var(--color-secondary)'],
  ];
  const idx = (letter.charCodeAt(0) || 0) % colors.length;
  return (
    <div style={{
      width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
      background: colors[idx][0], color: colors[idx][1],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 'var(--font-bold)', fontSize: '18px', flexShrink: 0,
    }}>
      {letter}
    </div>
  );
};

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="card" style={{ padding: '20px' }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 'var(--font-bold)',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--color-text-muted)',
      }}>
        {label}
      </span>
      {Icon && (
        <div style={{
          width: '28px', height: '28px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg)', color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={14} />
        </div>
      )}
    </div>
    <div style={{
      fontSize: '28px', fontWeight: 'var(--font-extrabold)',
      color, letterSpacing: 'var(--tracking-tight)', lineHeight: 1,
    }}>
      {value}
    </div>
  </div>
);

const JobMatchCard = ({ job }) => (
  <div style={{
    padding: '16px', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
    display: 'flex', flexDirection: 'column', gap: '12px',
    transition: 'border-color 150ms ease, transform 150ms ease',
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.borderColor = 'var(--color-primary)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.borderColor = 'var(--color-border)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: 'var(--font-semibold)', color: 'var(--color-primary)', marginBottom: '2px' }}>
          {job.job_id}
        </div>
        <h4 style={{
          fontSize: '14px', fontWeight: 'var(--font-bold)',
          color: 'var(--color-text)', margin: 0, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {job.title}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
          {job.company} &middot; {job.location}
        </p>
      </div>
      <div style={{
        padding: '4px 10px', borderRadius: 'var(--radius-full)',
        background: job.fit_score >= 85 ? 'var(--emerald-50)' : 'var(--indigo-50)',
        color: job.fit_score >= 85 ? 'var(--color-success)' : 'var(--color-primary)',
        fontSize: '12px', fontWeight: 'var(--font-bold)', flexShrink: 0,
      }}>
        {job.fit_score}%
      </div>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
      <span className="badge badge-primary">{job.workplace_type}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
        <DollarSign size={11} />${Math.round((job.salary_estimate || 0) / 1000)}k
      </span>
    </div>
  </div>
);

const ApplicationForm = ({ open, initialData, editingId, onClose, onSubmit }) => {
  const [status, setStatus] = useState(initialData?.status || 'applied');

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    onSubmit({
      company: fd.get('company') || '',
      role: fd.get('role') || '',
      status,
      location: fd.get('location') || '',
      salary: fd.get('salary') || '',
      url: fd.get('url') || '',
      follow_up_date: fd.get('follow_up_date') || '',
      notes: fd.get('notes') || '',
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', zIndex: 50,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
              width: '100%', maxWidth: '560px',
              maxHeight: '90vh', overflow: 'auto',
            }}
          >
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0, background: 'var(--color-surface)', zIndex: 1,
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
                  {editingId ? 'Edit Application' : 'Add Application'}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                  Track a new opportunity in your job search.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '6px', borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Briefcase size={13} /> Company *
                  </label>
                  <input
                    type="text" name="company" required
                    defaultValue={initialData?.company || ''}
                    placeholder="e.g., Anthropic"
                    style={{
                      width: '100%', height: '44px', padding: '0 14px',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                      outline: 'none', transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={13} /> Role *
                  </label>
                  <input
                    type="text" name="role" required
                    defaultValue={initialData?.role || ''}
                    placeholder="e.g., Senior Engineer"
                    style={{
                      width: '100%', height: '44px', padding: '0 14px',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                      outline: 'none', transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
              </div>

              <div>
                <label className="label">Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {STATUS_KEYS.map((key) => {
                    const meta = STATUS_META[key];
                    const active = status === key;
                    return (
                      <button
                        key={key} type="button"
                        onClick={() => setStatus(key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '8px 14px', borderRadius: 'var(--radius-full)',
                          fontSize: '13px', fontWeight: 'var(--font-semibold)',
                          cursor: 'pointer', transition: 'all 150ms ease',
                          border: `1px solid ${active ? meta.color : 'var(--color-border)'}`,
                          background: active ? meta.bg : 'transparent',
                          color: active ? meta.color : 'var(--color-text-muted)',
                        }}
                      >
                        <meta.icon size={12} /> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={13} /> Location
                  </label>
                  <input
                    type="text" name="location"
                    defaultValue={initialData?.location || ''}
                    placeholder="e.g., San Francisco, Remote"
                    style={{
                      width: '100%', height: '44px', padding: '0 14px',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                      outline: 'none', transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={13} /> Salary
                  </label>
                  <input
                    type="text" name="salary"
                    defaultValue={initialData?.salary || ''}
                    placeholder="e.g., $120,000"
                    style={{
                      width: '100%', height: '44px', padding: '0 14px',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                      outline: 'none', transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={13} /> Job URL
                  </label>
                  <input
                    type="url" name="url"
                    defaultValue={initialData?.url || ''}
                    placeholder="https://..."
                    style={{
                      width: '100%', height: '44px', padding: '0 14px',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                      outline: 'none', transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
                <div>
                  <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} /> Follow-up date
                  </label>
                  <input
                    type="date" name="follow_up_date"
                    defaultValue={initialData?.follow_up_date || ''}
                    style={{
                      width: '100%', height: '44px', padding: '0 14px',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                      outline: 'none', transition: 'border-color 150ms ease',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                  />
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={initialData?.notes || ''}
                  placeholder="Recruiter name, interview prep, salary discussion, etc."
                  rows={3}
                  style={{
                    width: '100%', minHeight: '84px', padding: '12px 14px',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                    fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                    outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                    transition: 'border-color 150ms ease',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                <button
                  type="button" onClick={onClose}
                  style={{
                    flex: 1, height: '46px', padding: '0 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'transparent', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)',
                    fontWeight: 'var(--font-semibold)', fontSize: '14px', cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1, height: '46px', padding: '0 20px',
                    borderRadius: 'var(--radius-lg)', border: 'none',
                    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                    color: 'white', fontWeight: 'var(--font-semibold)', fontSize: '14px',
                    cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <Save size={15} />
                  {editingId ? 'Update' : 'Save Application'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Jobs = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [matches, setMatches] = useState([]);
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [error, setError] = useState('');

  const fetchApplications = async (signal) => {
    try {
      const res = await api.get('/api/jobs/applications', { signal });
      setApplications(res.data.applications || []);
    } catch (err) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error(err);
        setError('Failed to load applications. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferencesAndMatches = async (signal) => {
    setMatchesLoading(true);
    try {
      const prefRes = await api.get('/api/user/preferences', { signal });
      const role = prefRes.data?.preferences?.target_role;
      if (role) {
        setTargetRole(role);
        const matchRes = await api.post('/api/jobs/matches', {
          target_role: role, skills: [], missing_skills: [],
        }, { signal });
        setMatches(matchRes.data?.jobs?.slice(0, 4) || []);
      }
    } catch (err) {
      if (err?.name !== 'CanceledError' && err?.code !== 'ERR_CANCELED') {
        console.error(err);
      }
    } finally {
      setMatchesLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    fetchApplications(controller.signal);
    fetchPreferencesAndMatches(controller.signal);
    return () => controller.abort();
  }, [user]);

  const handleSubmit = async (formData) => {
    try {
      if (editingJob) {
        await api.put(`/api/jobs/applications/${editingJob}`, formData);
      } else {
        await api.post('/api/jobs/applications', formData);
      }
      setShowForm(false);
      setEditingJob(null);
      setError('');
      fetchApplications();
    } catch (err) {
      console.error(err);
      setError(editingJob ? 'Failed to update application.' : 'Failed to save application.');
    }
  };

  const handleEdit = (app) => {
    setEditingJob(app.id);
    setShowForm(true);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/api/jobs/applications/${appId}`, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to update status.');
      fetchApplications();
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`/api/jobs/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to delete application.');
    }
  };

  const handleAddNew = () => {
    setEditingJob(null);
    setShowForm(true);
  };

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchesStatus = filter === 'all' || app.status === filter;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q ||
        (app.company || '').toLowerCase().includes(q) ||
        (app.role || '').toLowerCase().includes(q) ||
        (app.location || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [applications, filter, search]);

  const stats = useMemo(() => ({
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interview: applications.filter((a) => a.status === 'interview').length,
    offer: applications.filter((a) => a.status === 'offer').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }), [applications]);

  const editingAppData = useMemo(
    () => applications.find((a) => a.id === editingJob) || null,
    [editingJob, applications]
  );

  if (loading) return <PageLoader />;

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--color-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-200px', right: '-150px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.05, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.04, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '4px 12px', borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                color: 'var(--color-primary)', background: 'var(--indigo-50)',
                border: '1px solid var(--indigo-100)', marginBottom: '14px',
              }}>
                <Briefcase size={11} />
                Job Search
              </div>
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 'var(--font-extrabold)',
                letterSpacing: 'var(--tracking-tight)',
                color: 'var(--color-text)', marginBottom: '6px',
              }}>
                Applications Tracker
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', margin: 0 }}>
                Monitor every opportunity from first touch to offer.
              </p>
            </div>
            <button
              onClick={handleAddNew}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Add Application
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{
                padding: '12px 16px', marginBottom: '20px',
                background: 'var(--color-error-light)', color: 'var(--color-error)',
                border: '1px solid #FECACA', borderRadius: 'var(--radius-lg)',
                fontSize: '14px', fontWeight: 'var(--font-semibold)',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              <AlertOctagon size={16} />
              {error}
              <button
                onClick={() => setError('')}
                style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none',
                  color: 'var(--color-error)', cursor: 'pointer', padding: '2px',
                  display: 'flex', alignItems: 'center',
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {matches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
            className="card"
            style={{ padding: '24px', marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Sparkles size={16} color="var(--color-primary)" />
                  <h2 style={{ fontSize: '16px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
                    AI Job Matches
                  </h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                  Curated for your target role{targetRole ? `: ${targetRole}` : ''}.
                </p>
              </div>
              <span className="badge badge-primary">
                <TrendingUp size={10} />
                Live
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}>
              {matches.map((job) => <JobMatchCard key={job.job_id} job={job} />)}
            </div>
          </motion.div>
        )}

        {matchesLoading && applications.length === 0 && !targetRole && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card"
            style={{
              padding: '16px 20px', marginBottom: '24px',
              background: 'linear-gradient(135deg, var(--indigo-50) 0%, var(--violet-50) 100%)',
              border: '1px solid var(--indigo-100)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={16} color="var(--color-primary)" />
              <p style={{ fontSize: '13px', color: 'var(--color-text)', margin: 0 }}>
                Set a target role in <a href="/settings" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)' }}>Settings</a> to see AI-matched jobs here.
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px', marginBottom: '24px',
          }}
        >
          <StatCard label="Total" value={stats.total} color="var(--color-primary)" icon={Briefcase} />
          <StatCard label="Applied" value={stats.applied} color="var(--color-primary)" icon={Send} />
          <StatCard label="Interview" value={stats.interview} color="#D97706" icon={Clock} />
          <StatCard label="Offers" value={stats.offer} color="var(--color-success)" icon={CheckCircle} />
          <StatCard label="Rejected" value={stats.rejected} color="var(--color-error)" icon={XCircle} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="card"
          style={{ padding: '16px 20px', marginBottom: '20px' }}
        >
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px',
            justifyContent: 'space-between',
          }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 0 }}>
              <Search size={15} style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, role, or location..."
                style={{
                  width: '100%', height: '40px', padding: '0 14px 0 38px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                  fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-bg)',
                  outline: 'none', transition: 'border-color 150ms ease',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {STATUS_FILTERS.map((opt) => {
                const isActive = filter === opt.value;
                const count = opt.value === 'all' ? applications.length : applications.filter((a) => a.status === opt.value).length;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '8px 14px', borderRadius: 'var(--radius-full)',
                      fontSize: '13px', fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer', transition: 'all 150ms ease',
                      border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: isActive ? 'var(--indigo-50)' : 'var(--color-surface)',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    }}
                  >
                    {opt.label}
                    <span style={{
                      padding: '0 6px', borderRadius: 'var(--radius-full)',
                      background: isActive ? 'var(--color-primary)' : 'var(--color-bg)',
                      color: isActive ? 'white' : 'var(--color-text-muted)',
                      fontSize: '11px', fontWeight: 'var(--font-bold)', minWidth: '20px', textAlign: 'center',
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {filteredApps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            className="card"
            style={{ padding: '60px 24px', textAlign: 'center' }}
          >
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--indigo-50)', color: 'var(--color-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            }}>
              <Briefcase size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 8px' }}>
              {applications.length === 0 ? 'No applications yet' : 'No matches for your filter'}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 20px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
              {applications.length === 0
                ? 'Start tracking your job search by adding your first application.'
                : 'Try a different status filter or clear your search.'}
            </p>
            {applications.length === 0 && (
              <button
                onClick={handleAddNew}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={16} /> Add Your First Application
              </button>
            )}
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <AnimatePresence mode="popLayout">
              {filteredApps.map((app, i) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: i * 0.02 }}
                  className="card"
                  style={{ padding: '20px' }}
                >
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap',
                  }}>
                    <CompanyAvatar company={app.company} />

                    <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <h3 style={{
                          fontSize: '16px', fontWeight: 'var(--font-bold)',
                          color: 'var(--color-text)', margin: 0,
                        }}>
                          {app.role}
                        </h3>
                        <StatusPill status={app.status} />
                        {app.url && (
                          <a
                            href={app.url} target="_blank" rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                              fontSize: '12px', fontWeight: 'var(--font-semibold)',
                              color: 'var(--color-primary)', textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={12} /> View posting
                          </a>
                        )}
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                        <span style={{ fontWeight: 'var(--font-semibold)', color: 'var(--color-text)' }}>{app.company}</span>
                        {app.location && <> &middot; <MapPin size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {app.location}</>}
                        {app.salary && <> &middot; <DollarSign size={11} style={{ display: 'inline', verticalAlign: '-1px' }} /> {app.salary}</>}
                      </p>
                      {(app.notes || app.follow_up_date) && (
                        <div style={{
                          display: 'flex', flexWrap: 'wrap', gap: '12px',
                          marginTop: '10px', fontSize: '12px', color: 'var(--color-text-muted)',
                        }}>
                          {app.follow_up_date && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={11} /> Follow up: <strong style={{ color: 'var(--color-text)' }}>{app.follow_up_date}</strong>
                            </span>
                          )}
                          {app.notes && (
                            <span style={{
                              display: 'inline-flex', alignItems: 'flex-start', gap: '4px',
                              maxWidth: '100%',
                            }}>
                              <FileText size={11} style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{
                                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                                overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '480px',
                              }}>
                                {app.notes}
                              </span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          height: '36px', padding: '0 30px 0 12px',
                          borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                          background: 'var(--color-surface)', color: 'var(--color-text)',
                          fontSize: '12px', fontWeight: 'var(--font-semibold)',
                          cursor: 'pointer', outline: 'none',
                          appearance: 'none', WebkitAppearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center',
                          transition: 'border-color 150ms ease',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        title="Change status"
                      >
                        {STATUS_KEYS.map((k) => (
                          <option key={k} value={k}>{STATUS_META[k].label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEdit(app)}
                        title="Edit"
                        style={{
                          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                          background: 'transparent', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--indigo-50)';
                          e.currentTarget.style.color = 'var(--color-primary)';
                          e.currentTarget.style.borderColor = 'var(--indigo-200)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        title="Delete"
                        style={{
                          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                          background: 'transparent', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-muted)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 150ms ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-error-light)';
                          e.currentTarget.style.color = 'var(--color-error)';
                          e.currentTarget.style.borderColor = '#FECACA';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-muted)';
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {applications.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{
              textAlign: 'center', fontSize: 'var(--text-xs)',
              color: 'var(--color-text-light)', marginTop: '20px',
            }}
          >
            Showing {filteredApps.length} of {applications.length} application{applications.length === 1 ? '' : 's'}
          </motion.p>
        )}

        <ApplicationForm
          key={editingJob || 'new'}
          open={showForm}
          onClose={() => { setShowForm(false); setEditingJob(null); }}
          onSubmit={handleSubmit}
          initialData={editingAppData}
          editingId={editingJob}
        />

        <AnimatePresence>
          {deleteTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 910,
                background: 'rgba(15, 15, 30, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Confirm delete"
                style={{
                  background: '#FFFFFF', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '380px',
                  boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)', padding: '28px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--color-error-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <AlertTriangle size={24} color="var(--color-error)" />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                  Delete this application?
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                  This action can't be undone. The application record will be permanently removed.
                </p>
                <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      border: '1.5px solid var(--color-border)', background: '#FFFFFF',
                      color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10,
                      border: 'none', background: 'var(--color-error)',
                      color: 'white', fontWeight: 600, fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Jobs;
