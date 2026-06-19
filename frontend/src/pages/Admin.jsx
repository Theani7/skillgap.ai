import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Users, MessageSquareText, Trash2, Server, Plus, BookOpen,
  ShieldAlert, Activity, TrendingUp, UserCheck, CheckCircle, X, RefreshCw, AlertTriangle, BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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

const Admin = () => {
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop() || 'dashboard';
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [jobRoles, setJobRoles] = useState([]);
  const [analytics, setAnalytics] = useState({ most_sought_role: '', most_common_missing_skill: '' });
  const [qualityMetrics, setQualityMetrics] = useState(null);
  const [scrapeStatus, setScrapeStatus] = useState('');
  const [newCourse, setNewCourse] = useState({ field: '', course_name: '', course_url: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [resumeDetail, setResumeDetail] = useState(null);
  const [resumePage, setResumePage] = useState(0);
  const [resumeTotal, setResumeTotal] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [feedbackTotal, setFeedbackTotal] = useState(0);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [uploadsOverTime, setUploadsOverTime] = useState([]);
  const [skillGaps, setSkillGaps] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);
  const PAGE_SIZE = 20;
  const toastTimerRef = useRef(null);

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchAdminData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const [usersRes, feedbackRes, regUsersRes, coursesRes, analyticsRes, qualityRes, uploadsRes, skillGapsRes, roleDistRes, jobRolesRes, feedbackStatsRes] = await Promise.all([
        api.get(`/api/admin/users?limit=${PAGE_SIZE}&offset=${resumePage * PAGE_SIZE}`, { signal }),
        api.get(`/api/admin/feedback?limit=${PAGE_SIZE}&offset=${feedbackPage * PAGE_SIZE}`, { signal }),
        api.get('/api/admin/registered-users', { signal }),
        api.get('/api/admin/courses', { signal }),
        api.get('/api/admin/analytics', { signal }),
        api.get('/api/admin/quality-metrics', { signal }).catch(() => ({ data: null })),
        api.get('/api/admin/analytics/uploads-over-time', { signal }),
        api.get('/api/admin/analytics/skill-gaps', { signal }),
        api.get('/api/admin/analytics/role-distribution', { signal }),
        api.get('/api/admin/job-roles', { signal }),
        api.get('/api/admin/feedback/stats', { signal }),
      ]);
      setResumes(usersRes.data.users || []);
      setResumeTotal(usersRes.data.total || 0);
      setFeedback(feedbackRes.data.feedback || []);
      setFeedbackTotal(feedbackRes.data.total || 0);
      setRegisteredUsers(regUsersRes.data.users || []);
      setCourses(coursesRes.data.courses || []);
      setAnalytics(analyticsRes.data);
      setQualityMetrics(qualityRes.data);
      setUploadsOverTime(uploadsRes.data.data || []);
      setSkillGaps(skillGapsRes.data.data || []);
      setRoleDistribution(roleDistRes.data.data || []);
      setJobRoles(jobRolesRes.data.job_roles || []);
      setFeedbackStats(feedbackStatsRes.data);
    } catch (_err) {
      if (_err?.name !== 'CanceledError' && _err?.code !== 'ERR_CANCELED') {
        console.error(_err);
        showToast('error', 'Failed to load admin data.');
      }
    } finally {
      setLoading(false);
    }
  }, [resumePage, feedbackPage]);

  useEffect(() => {
    if (!user?.username) return;
    const controller = new AbortController();
    fetchAdminData(controller.signal);
    return () => controller.abort();
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

  const handleUpdateRole = async (userId, newRole) => {
    await runAction('update role', async () => {
      const res = await api.patch(`/api/admin/registered-users/${userId}/role`, { role: newRole });
      setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? res.data.user : u)));
    }, 'Role updated.');
  };

  const handleUpdateStatus = async (userId, isActive) => {
    await runAction('update status', async () => {
      const res = await api.patch(`/api/admin/registered-users/${userId}/status`, { is_active: isActive });
      setRegisteredUsers((prev) => prev.map((u) => (u.id === userId ? res.data.user : u)));
    }, isActive ? 'User activated.' : 'User deactivated.');
  };

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

  const handleEditCourse = (course) => {
    setEditingCourse({ ...course });
  };

  const handleSaveCourse = async () => {
    if (!editingCourse.field.trim() || !editingCourse.course_name.trim() || !editingCourse.course_url.trim()) {
      showToast('error', 'Please fill all three fields.');
      return;
    }
    await runAction('update course', async () => {
      await api.patch(`/api/admin/courses/${editingCourse.id}`, {
        field: editingCourse.field,
        course_name: editingCourse.course_name,
        course_url: editingCourse.course_url,
      });
      setEditingCourse(null);
      await fetchAdminData();
    }, 'Course updated.');
  };

  const handleViewResume = async (id) => {
    try {
      const res = await api.get(`/api/admin/users/${id}`);
      setResumeDetail(res.data.analysis);
    } catch {
      showToast('error', 'Failed to load resume details.');
    }
  };

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

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
              {/* Uploads Over Time */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={14} color="var(--color-primary)" /> Resume Uploads Over Time
                </h3>
                {uploadsOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={uploadsOverTime}>
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5) || v} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>No data yet.</p>
                )}
              </div>

              {/* Skill Gaps */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={14} color="var(--color-secondary)" /> Top Missing Skills
                </h3>
                {skillGaps.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={skillGaps} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="skill" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="var(--color-secondary)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>No data yet.</p>
                )}
              </div>

              {/* Role Distribution */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={14} color="var(--color-success)" /> Target Role Distribution
                </h3>
                {roleDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={roleDistribution} dataKey="count" nameKey="target_role" cx="50%" cy="50%" outerRadius={80} label={({ target_role, percent }) => `${target_role?.slice(0, 15) || ''} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ fontSize: '11px' }}>
                        {roleDistribution.map((_, index) => (
                          <Cell key={index} fill={['#ff6b35', '#0a1628', '#22c55e', '#eab308', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'][index % 8]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>No data yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resumes' && (
          <div>
            <DataTable
              columns={[
                { label: 'Name', render: (r) => r.Name },
                { label: 'Email', render: (r) => r.Email_ID, mono: true },
                { label: 'Role', render: (r) => r.target_role || r.Predicted_Field },
                { label: 'Score', render: (r) => r.resume_score },
                { label: 'When', render: (r) => r.Timestamp },
                {
                  label: '',
                  render: (r) => (
                    <button type="button" onClick={() => handleViewResume(r.ID)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '12px', cursor: 'pointer' }}>
                      View
                    </button>
                  ),
                },
              ]}
              rows={resumes}
              keyField="ID"
              empty="No resume analyses yet."
              onDelete={handleDeleteResume}
              deleteLabel="Delete log"
            />
            {resumeTotal > PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                <button type="button" disabled={resumePage === 0} onClick={() => setResumePage((p) => p - 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: resumePage === 0 ? 'var(--color-text-muted)' : 'var(--color-text)', cursor: resumePage === 0 ? 'default' : 'pointer', fontSize: '13px' }}>Previous</button>
                <span style={{ padding: '6px 14px', fontSize: '13px', color: 'var(--color-text-muted)' }}>Page {resumePage + 1} of {Math.ceil(resumeTotal / PAGE_SIZE)}</span>
                <button type="button" disabled={(resumePage + 1) * PAGE_SIZE >= resumeTotal} onClick={() => setResumePage((p) => p + 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: (resumePage + 1) * PAGE_SIZE >= resumeTotal ? 'var(--color-text-muted)' : 'var(--color-text)', cursor: (resumePage + 1) * PAGE_SIZE >= resumeTotal ? 'default' : 'pointer', fontSize: '13px' }}>Next</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search by username or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: '100%', maxWidth: '400px', height: '40px', padding: '0 14px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                  fontSize: '14px', color: 'var(--color-text)', background: 'var(--color-surface)',
                  outline: 'none',
                }}
              />
            </div>
            <DataTable
              columns={[
                { label: 'Username', render: (u) => u.username, mono: true },
                { label: 'Email', render: (u) => u.email, mono: true },
                {
                  label: 'Role',
                  render: (u) => (
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      style={{
                        padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-border)',
                        background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '13px',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ),
                },
                {
                  label: 'Status',
                  render: (u) => (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(u.id, !u.is_active)}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: 'none',
                        background: u.is_active ? 'var(--color-success)' : 'var(--color-error)',
                        color: 'white', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      }}
                    >
                      {u.is_active ? 'Active' : 'Inactive'}
                    </button>
                  ),
                },
              ]}
              rows={registeredUsers.filter((u) => {
                if (!userSearch) return true;
                const q = userSearch.toLowerCase();
                return u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
              })}
              keyField="id"
              empty="No registered users yet."
              onDelete={handleDeleteRegisteredUser}
              deleteLabel="Ban user"
            />
          </div>
        )}

        {activeTab === 'feedback' && (
          <div>
            {feedbackStats && feedbackStats.total > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Reviews</span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>{feedbackStats.total}</span>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid #10B981' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Positive</span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-display)' }}>{feedbackStats.positive}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>4-5 stars</span>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid #F59E0B' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Neutral</span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-display)' }}>{feedbackStats.neutral}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>3 stars</span>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid #EF4444' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Negative</span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#EF4444', fontFamily: 'var(--font-display)' }}>{feedbackStats.negative}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>1-2 stars</span>
                </div>
                <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '3px solid var(--color-primary)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Positive Ratio</span>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{feedbackStats.ratio === '∞' ? '∞' : `${feedbackStats.ratio}:1`}</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>positive per negative</span>
                </div>
              </div>
            )}

            {feedbackStats && feedbackStats.total > 0 && (
              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 14px' }}>Rating Distribution</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
                  {[5, 4, 3, 2, 1].map((score) => {
                    const count = feedbackStats.by_score[score] || 0;
                    const pct = feedbackStats.total > 0 ? (count / feedbackStats.total) * 100 : 0;
                    const color = score >= 4 ? '#10B981' : score === 3 ? '#F59E0B' : '#EF4444';
                    return (
                      <div key={score} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{count}</span>
                        <div style={{ width: '100%', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden', height: `${Math.max(pct, 4)}%`, transition: 'height 400ms ease' }}>
                          <div style={{ width: '100%', height: '100%', background: color, borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text)' }}>{'★'.repeat(score)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <DataTable
              columns={[
                { label: 'Name', render: (f) => f.feed_name },
                { label: 'Email', render: (f) => f.feed_email, mono: true },
                { label: 'Rating', render: (f) => {
                  const score = Number(f.feed_score) || 0;
                  const color = score >= 4 ? '#10B981' : score === 3 ? '#F59E0B' : '#EF4444';
                  return <span style={{ color, fontWeight: 600 }}>{'★'.repeat(score)}<span style={{ opacity: 0.2 }}>{'★'.repeat(5 - score)}</span></span>;
                }},
                { label: 'Comments', render: (f) => truncate(f.comments, 80), nowrap: true },
                { label: 'When', render: (f) => f.Timestamp },
              ]}
              rows={feedback}
              keyField="ID"
              empty="No feedback yet."
              onDelete={handleDeleteFeedback}
              deleteLabel="Delete feedback"
            />
            {feedbackTotal > PAGE_SIZE && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
                <button type="button" disabled={feedbackPage === 0} onClick={() => setFeedbackPage((p) => p - 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: feedbackPage === 0 ? 'var(--color-text-muted)' : 'var(--color-text)', cursor: feedbackPage === 0 ? 'default' : 'pointer', fontSize: '13px' }}>Previous</button>
                <span style={{ padding: '6px 14px', fontSize: '13px', color: 'var(--color-text-muted)' }}>Page {feedbackPage + 1} of {Math.ceil(feedbackTotal / PAGE_SIZE)}</span>
                <button type="button" disabled={(feedbackPage + 1) * PAGE_SIZE >= feedbackTotal} onClick={() => setFeedbackPage((p) => p + 1)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: (feedbackPage + 1) * PAGE_SIZE >= feedbackTotal ? 'var(--color-text-muted)' : 'var(--color-text)', cursor: (feedbackPage + 1) * PAGE_SIZE >= feedbackTotal ? 'default' : 'pointer', fontSize: '13px' }}>Next</button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={16} color="var(--color-primary)" /> {editingCourse ? 'Edit course' : 'Add course recommendation'}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); editingCourse ? handleSaveCourse() : handleAddCourse(e); }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <select
                  value={editingCourse ? editingCourse.field : newCourse.field}
                  onChange={(e) => editingCourse ? setEditingCourse({ ...editingCourse, field: e.target.value }) : setNewCourse({ ...newCourse, field: e.target.value })}
                  aria-label="Job Role"
                  style={{ ...fieldStyle(false), cursor: 'pointer' }}
                >
                  <option value="">Select job role...</option>
                  {jobRoles.map((role) => (
                    <option key={role.id} value={role.title}>{role.title}</option>
                  ))}
                </select>
                <input
                  type="text" placeholder="Course name"
                  value={editingCourse ? editingCourse.course_name : newCourse.course_name}
                  onChange={(e) => editingCourse ? setEditingCourse({ ...editingCourse, course_name: e.target.value }) : setNewCourse({ ...newCourse, course_name: e.target.value })}
                  aria-label="Course name"
                  style={fieldStyle(false)}
                />
                <input
                  type="url" placeholder="https://..."
                  value={editingCourse ? editingCourse.course_url : newCourse.course_url}
                  onChange={(e) => editingCourse ? setEditingCourse({ ...editingCourse, course_url: e.target.value }) : setNewCourse({ ...newCourse, course_url: e.target.value })}
                  aria-label="Course URL"
                  style={fieldStyle(false)}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ height: '44px', flex: 1 }}>
                    {editingCourse ? 'Save' : <><Plus size={14} style={{ marginRight: '6px' }} /> Add</>}
                  </button>
                  {editingCourse && (
                    <button type="button" onClick={() => setEditingCourse(null)} style={{ height: '44px', padding: '0 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <DataTable
              columns={[
                { label: 'Field', render: (c) => c.field },
                { label: 'Course', render: (c) => c.course_name, nowrap: true },
                { label: 'URL', render: (c) => <a href={c.course_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>{truncate(c.course_url, 40)}</a>, mono: true, nowrap: true },
                {
                  label: '',
                  render: (c) => (
                    <button type="button" onClick={() => handleEditCourse(c)} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '12px', cursor: 'pointer' }}>
                      Edit
                    </button>
                  ),
                },
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
        {resumeDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 50, padding: '20px',
            }}
            onClick={() => setResumeDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
                padding: '28px', maxWidth: '600px', width: '100%', maxHeight: '80vh',
                overflow: 'auto', boxShadow: 'var(--shadow-xl)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text)', margin: 0 }}>Resume Analysis Detail</h2>
                <button onClick={() => setResumeDetail(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                  <X size={20} />
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Row label="Name" value={resumeDetail.Name} />
                <Row label="Email" value={resumeDetail.Email_ID} />
                <Row label="File" value={resumeDetail.pdf_name} />
                <Row label="Target Role" value={resumeDetail.target_role || resumeDetail.Predicted_Field} />
                <Row label="Score" value={resumeDetail.resume_score} />
                <Row label="Date" value={resumeDetail.Timestamp} />
                {resumeDetail.Actual_skills && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 6px' }}>Current Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {resumeDetail.Actual_skills.split(',').map((s, i) => (
                        <span key={i} style={{ padding: '3px 10px', borderRadius: '12px', background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text)' }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {resumeDetail.missing_skills && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 6px' }}>Missing Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {resumeDetail.missing_skills.split(',').map((s, i) => (
                        <span key={i} style={{ padding: '3px 10px', borderRadius: '12px', background: 'var(--color-error-light)', fontSize: '12px', color: 'var(--color-error)' }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {resumeDetail.Recommended_skills && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 6px' }}>Recommended Skills</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {resumeDetail.Recommended_skills.split(',').map((s, i) => (
                        <span key={i} style={{ padding: '3px 10px', borderRadius: '12px', background: 'var(--color-success-light)', fontSize: '12px', color: 'var(--color-success)' }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
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
