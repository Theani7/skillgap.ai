import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import {
  Users, LayoutDashboard, MessageSquareText, Trash2, Server, Plus, BookOpen,
  ShieldAlert, Activity, TrendingUp, UserCheck, CheckCircle, X, RefreshCw, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import PageLoader from '../components/Skeleton';

const fieldStyle = (focus) => ({
  width: '100%', height: '44px', padding: '0 14px',
  border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-lg)',
  fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
  outline: 'none', transition: 'border-color 150ms ease', fontFamily: 'inherit',
  boxSizing: 'border-box',
});

const StatCard = (props) => {
  const { icon: Icon, label, value, accent = 'var(--color-primary)' } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
        background: 'var(--indigo-50)', color: accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
          {label}
        </p>
        <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </p>
      </div>
    </motion.div>
  );
};

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'resumes', label: 'Resume Logs', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
  { id: 'courses', label: 'Courses', icon: BookOpen },
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState({ most_sought_role: '', most_common_missing_skill: '' });
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [newCourse, setNewCourse] = useState({ field: '', course_name: '', course_url: '' });
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, feedbackRes, regUsersRes, coursesRes, analyticsRes, qualityRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/feedback'),
        api.get('/api/admin/registered-users'),
        api.get('/api/admin/courses'),
        api.get('/api/admin/analytics'),
        api.get('/api/admin/quality-metrics').catch(() => ({ data: null })),
      ]);
      setResumes(usersRes.data.users);
      setFeedback(feedbackRes.data.feedback);
      setRegisteredUsers(regUsersRes.data.users);
      setCourses(coursesRes.data.courses);
      setAnalytics(analyticsRes.data);
      setQualityMetrics(qualityRes.data);
    } catch (_err) {
      console.error(_err);
      showToast('error', 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.username) fetchAdminData();
  }, [user?.username, fetchAdminData]);

  const runAction = async (label, fn, successMessage) => {
    try {
      await fn();
      showToast('success', successMessage);
    } catch (_err) {
      showToast('error', `Failed to ${label}.`);
    }
  };

  const handleDeleteResume = (id) => setConfirm({
    title: 'Delete resume log?',
    body: 'This will remove the analysis row from the database.',
    confirmLabel: 'Delete',
    onConfirm: () => runAction('delete log', async () => {
      await api.delete(`/api/admin/users/${id}`);
      setResumes((prev) => prev.filter((u) => u.ID !== id));
    }, 'Resume log deleted.'),
  });

  const handleDeleteFeedback = (id) => setConfirm({
    title: 'Delete feedback?',
    body: 'This user-reported entry will be removed permanently.',
    confirmLabel: 'Delete',
    onConfirm: () => runAction('delete feedback', async () => {
      await api.delete(`/api/admin/feedback/${id}`);
      setFeedback((prev) => prev.filter((f) => f.ID !== id));
    }, 'Feedback deleted.'),
  });

  const handleDeleteRegisteredUser = (id) => setConfirm({
    title: 'Ban this user?',
    body: 'All their resumes, job applications, and tokens will be deleted. This cannot be undone.',
    confirmLabel: 'Delete user',
    danger: true,
    onConfirm: () => runAction('ban user', async () => {
      await api.delete(`/api/admin/registered-users/${id}`);
      setRegisteredUsers((prev) => prev.filter((u) => u.id !== id));
    }, 'User deleted.'),
  });

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.field.trim() || !newCourse.course_name.trim() || !newCourse.course_url.trim()) {
      showToast('error', 'Please fill all three fields.');
      return;
    }
    await runAction('add course', async () => {
      await api.post('/api/admin/courses', newCourse);
      setNewCourse({ field: '', course_name: '', course_url: '' });
      await fetchAdminData();
    }, 'Course added.');
  };

  const handleDeleteCourse = (id) => setConfirm({
    title: 'Delete course?',
    body: 'This recommendation will be removed from the database.',
    confirmLabel: 'Delete',
    onConfirm: () => runAction('delete course', async () => {
      await api.delete(`/api/admin/courses/${id}`);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    }, 'Course deleted.'),
  });

  const handleTriggerScrape = () => {
    setScrapeStatus('Running simulation...');
    api.post('/api/admin/trigger-scrape')
      .then((res) => setScrapeStatus(`Success: ${res.data.message} (${res.data.timestamp})`))
      .catch(() => setScrapeStatus('Failed to run scrape.'));
  };

  useEffect(() => {
    if (!confirm) return;
    const onKey = (e) => { if (e.key === 'Escape') setConfirm(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirm]);

  if (loading) return <PageLoader />;

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--color-bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-200px', right: '-180px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.04, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <ShieldAlert size={11} /> Admin
          </span>
          <h1 style={{
            fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)',
            color: 'var(--color-text)', margin: '0 0 6px', letterSpacing: 'var(--tracking-tight)',
          }}>
            Control Panel
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', margin: 0 }}>
            Manage users, feedback, and course recommendations.
          </p>
        </div>

        <div className="card admin-tabs" style={{
          padding: '6px', marginBottom: '20px', display: 'flex', gap: '4px',
          flexWrap: 'wrap',
        }} role="tablist" aria-label="Admin sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  height: '40px', padding: '0 14px',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  background: active ? 'var(--indigo-50)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: active ? 'var(--font-semibold)' : 'var(--font-medium)',
                  fontSize: '13px', cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'background 150ms ease, color 150ms ease',
                  minHeight: '40px',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <StatCard icon={Activity} label="Resume Uploads" value={resumes.length} />
              <StatCard icon={Users} label="Registered Users" value={registeredUsers.length} accent="var(--color-secondary)" />
              <StatCard icon={MessageSquareText} label="Feedback Items" value={feedback.length} accent="var(--color-warning)" />
              <StatCard icon={BookOpen} label="Courses" value={courses.length} accent="var(--color-success)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={16} color="var(--color-primary)" /> Market Insights
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 6px' }}>Most sought-after role</p>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)', margin: 0 }}>
                  {analytics.most_sought_role || 'Insufficient data'}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '16px 0 6px' }}>Most common missing skill</p>
                <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-text)', margin: 0 }}>
                  {analytics.most_common_missing_skill || 'Insufficient data'}
                </p>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={16} color="var(--color-primary)" /> Service Health
                </h3>
                {qualityMetrics ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Row label="Total requests" value={qualityMetrics.total_requests} />
                    <Row label="Server errors" value={qualityMetrics.server_errors} />
                    <Row label="Avg latency" value={`${qualityMetrics.avg_latency_ms} ms`} />
                    <Row label="Error rate" value={`${qualityMetrics.parse_failure_rate_pct}%`} />
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>No metrics available.</p>
                )}
                <button
                  type="button"
                  onClick={handleTriggerScrape}
                  className="btn"
                  style={{
                    marginTop: '16px', width: '100%',
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  <RefreshCw size={14} style={{ marginRight: '6px' }} /> Simulate market shift
                </button>
                {scrapeStatus && (
                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '10px', textAlign: 'center' }}>{scrapeStatus}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resumes' && (
          <DataTable
            columns={[
              { label: 'Name', render: (r) => r.Name },
              { label: 'Email', render: (r) => r.Email_ID, mono: true },
              { label: 'Role', render: (r) => r.target_role || r.Predicted_Field },
              { label: 'Score', render: (r) => r.resume_score },
              { label: 'When', render: (r) => r.Timestamp },
            ]}
            rows={resumes}
            keyField="ID"
            empty="No resume analyses yet."
            onDelete={handleDeleteResume}
            deleteLabel="Delete log"
          />
        )}

        {activeTab === 'users' && (
          <DataTable
            columns={[
              { label: 'Username', render: (u) => u.username, mono: true },
              { label: 'Email', render: (u) => u.email, mono: true },
              { label: 'Role', render: (u) => <span className={`badge ${u.role === 'admin' ? 'badge-primary' : ''}`}>{u.role}</span> },
            ]}
            rows={registeredUsers}
            keyField="id"
            empty="No registered users yet."
            onDelete={handleDeleteRegisteredUser}
            deleteLabel="Ban user"
          />
        )}

        {activeTab === 'feedback' && (
          <DataTable
            columns={[
              { label: 'Name', render: (f) => f.feed_name },
              { label: 'Email', render: (f) => f.feed_email, mono: true },
              { label: 'Rating', render: (f) => '★'.repeat(Number(f.feed_score) || 0) },
              { label: 'Comments', render: (f) => truncate(f.comments, 80), nowrap: true },
              { label: 'When', render: (f) => f.Timestamp },
            ]}
            rows={feedback}
            keyField="ID"
            empty="No feedback yet."
            onDelete={handleDeleteFeedback}
            deleteLabel="Delete feedback"
          />
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="var(--color-primary)" /> Add course recommendation
              </h3>
              <form onSubmit={handleAddCourse} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <input
                  type="text" placeholder="Field (e.g. Data Science)" value={newCourse.field}
                  onChange={(e) => setNewCourse({ ...newCourse, field: e.target.value })}
                  aria-label="Field"
                  style={fieldStyle(false)}
                />
                <input
                  type="text" placeholder="Course name" value={newCourse.course_name}
                  onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
                  aria-label="Course name"
                  style={fieldStyle(false)}
                />
                <input
                  type="url" placeholder="https://..." value={newCourse.course_url}
                  onChange={(e) => setNewCourse({ ...newCourse, course_url: e.target.value })}
                  aria-label="Course URL"
                  style={fieldStyle(false)}
                />
                <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add
                </button>
              </form>
            </div>

            <DataTable
              columns={[
                { label: 'Field', render: (c) => c.field },
                { label: 'Course', render: (c) => c.course_name, nowrap: true },
                { label: 'URL', render: (c) => <a href={c.course_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{truncate(c.course_url, 40)}</a>, mono: true, nowrap: true },
              ]}
              rows={courses}
              keyField="id"
              empty="No courses yet."
              onDelete={handleDeleteCourse}
              deleteLabel="Delete course"
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            title={confirm.title}
            body={confirm.body}
            confirmLabel={confirm.confirmLabel}
            danger={confirm.danger}
            onCancel={() => setConfirm(null)}
            onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="status"
            aria-live="polite"
            style={{
              position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
              background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              color: 'white', padding: '12px 20px', borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)', fontSize: '14px', fontWeight: 'var(--font-semibold)',
              zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
    <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
    <span style={{ color: 'var(--color-text)', fontWeight: 'var(--font-semibold)' }}>{value}</span>
  </div>
);

const truncate = (text = '', n = 80) => {
  if (!text) return '';
  return text.length > n ? `${text.slice(0, n)}...` : text;
};

const DataTable = (props) => {
  const { columns, rows, keyField, empty, onDelete, deleteLabel = 'Delete' } = props;
  return (
  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead>
          <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
            {columns.map((c, i) => (
              <th key={i} style={{
                padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.06em',
                minWidth: c.nowrap ? 200 : undefined,
              }}>{c.label}</th>
            ))}
            <th style={{ width: '60px' }} aria-label="Actions"></th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length + 1} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>{empty}</td></tr>
          ) : rows.map((row) => (
            <tr key={row[keyField]} style={{ borderTop: '1px solid var(--color-border)' }}>
              {columns.map((c, i) => (
                <td key={i} style={{
                  padding: '12px 16px', color: 'var(--color-text)',
                  maxWidth: c.nowrap ? 280 : undefined,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: c.nowrap ? 'nowrap' : undefined,
                  fontFamily: c.mono ? 'ui-monospace, SFMono-Regular, monospace' : undefined,
                  fontSize: c.mono ? '12px' : '13px',
                }}>{c.render(row)}</td>
              ))}
              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(row[keyField])}
                    aria-label={`${deleteLabel} ${row[keyField]}`}
                    style={{
                      width: '44px', height: '44px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid transparent',
                      background: 'transparent',
                      color: 'var(--color-text-muted)', cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 150ms ease, color 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-error-light)';
                      e.currentTarget.style.color = 'var(--color-error)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-muted)';
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

const ConfirmDialog = (props) => {
  const { title, body, confirmLabel, danger, onCancel, onConfirm } = props;
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: '16px',
      }}
    >
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ padding: '24px', maxWidth: '420px', width: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <h3 id="confirm-title" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
            {title}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            style={{
              width: '44px', height: '44px',
              borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent',
              color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>{body}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            ref={ref}
            type="button"
            onClick={onCancel}
            className="btn"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn"
            style={{
              background: danger ? 'var(--color-error)' : 'var(--color-primary)',
              color: 'white', border: 'none',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Admin;
