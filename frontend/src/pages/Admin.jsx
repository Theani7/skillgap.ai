import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, LayoutDashboard, MessageSquareText, Trash2, Server, Plus, BookOpen, ShieldAlert, Activity, TrendingUp, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const [resumes, setResumes] = useState([]);
    const [feedback, setFeedback] = useState([]);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [analytics, setAnalytics] = useState({ most_sought_role: '', most_common_missing_skill: '' });

    const [scrapeStatus, setScrapeStatus] = useState('');
    const [newCourse, setNewCourse] = useState({ field: '', course_name: '', course_url: '' });

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const config = { headers: { 'Authorization': `Bearer ${user.token}` } };
            const [usersRes, feedbackRes, regUsersRes, coursesRes, analyticsRes] = await Promise.all([
                api.get('/api/admin/users', config),
                api.get('/api/admin/feedback', config),
                api.get('/api/admin/registered-users', config),
                api.get('/api/admin/courses', config),
                api.get('/api/admin/analytics', config)
            ]);
            setResumes(usersRes.data.users);
            setFeedback(feedbackRes.data.feedback);
            setRegisteredUsers(regUsersRes.data.users);
            setCourses(coursesRes.data.courses);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchAdminData();
        }
    }, [user]);

    const handleDeleteResume = async (id) => {
        if (!window.confirm("Delete this resume log?")) return;
        try {
            await api.delete(`/api/admin/users/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setResumes(resumes.filter(u => u.ID !== id));
        } catch (err) { alert("Failed to delete log."); }
    };

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm("Delete this feedback?")) return;
        try {
            await api.delete(`/api/admin/feedback/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setFeedback(feedback.filter(f => f.ID !== id));
        } catch (err) { alert("Failed to delete feedback."); }
    };

    const handleDeleteRegisteredUser = async (id) => {
        if (!window.confirm("Permanently ban and delete this registered user?")) return;
        try {
            await api.delete(`/api/admin/registered-users/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setRegisteredUsers(registeredUsers.filter(u => u.id !== id));
        } catch (err) { alert("Failed to ban user."); }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/courses', newCourse, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setNewCourse({ field: '', course_name: '', course_url: '' });
            fetchAdminData();
            alert("Course added successfully.");
        } catch (err) { alert("Failed to add course."); }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course recommendation?")) return;
        try {
            await api.delete(`/api/admin/courses/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setCourses(courses.filter(c => c.id !== id));
        } catch (err) { alert("Failed to delete course."); }
    };

    const handleTriggerScrape = async () => {
        if (!window.confirm("Simulate a market shift updating the AI Target Role requirements?")) return;
        setScrapeStatus('Running Simulation...');
        try {
            const res = await api.post('/api/admin/trigger-scrape', {}, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setScrapeStatus(`Success: ${res.data.message} (${res.data.timestamp})`);
        } catch (err) { setScrapeStatus('Failed to trigger simulation.'); }
    };

    if (loading) return (
        <div className="clay-loader" style={{ minHeight: '100vh' }}>
            <div className="clay-spinner" style={{ width: '64px', height: '64px' }} />
            <p style={{ color: 'var(--clay-accent)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Loading Admin Hub...
            </p>
        </div>
    );

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'users', label: 'Manage Users', icon: ShieldAlert },
        { id: 'courses', label: 'Content CMS', icon: BookOpen },
        { id: 'feedback', label: 'Feedback', icon: MessageSquareText },
    ];

    return (
        <motion.div
            className="clay-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ minHeight: '100vh' }}
        >
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: 'var(--spacing-xl)' }}
                >
                    <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div className="clay-icon clay-icon-purple" style={{ width: '52px', height: '52px' }}>
                            <Server size={24} />
                        </div>
                        Admin Control Panel
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', borderBottom: '2px solid rgba(124, 58, 237, 0.1)', paddingBottom: 'var(--spacing-md)' }}
                >
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`clay-btn ${activeTab === tab.id ? 'clay-btn-primary' : 'clay-btn-secondary'}`}
                            style={{ gap: 'var(--spacing-sm)' }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {activeTab === 'dashboard' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}
                    >
                        <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-xl)', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.05), rgba(124, 58, 237, 0.02))' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', margin: '0 0 var(--spacing-lg) 0', fontSize: '1.2rem' }}>
                                <div className="clay-icon clay-icon-purple" style={{ width: '40px', height: '40px' }}>
                                    <Activity size={18} />
                                </div>
                                Market Intelligence
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 'var(--spacing-lg)' }}>
                                <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)' }}>
                                    <p style={{ color: 'var(--clay-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
                                        Most Sought-After Role
                                    </p>
                                    <h2 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--clay-accent)' }}>
                                        {analytics.most_sought_role || 'N/A'}
                                    </h2>
                                </div>
                                <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)' }}>
                                    <p style={{ color: 'var(--clay-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 'var(--spacing-xs)' }}>
                                        Top Missing Skill Overall
                                    </p>
                                    <h2 style={{ margin: 0, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: 'var(--clay-accent-alt)' }}>
                                        {analytics.most_common_missing_skill || 'N/A'}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 'var(--spacing-lg)' }}>
                            <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="clay-icon clay-icon-blue" style={{ width: '48px', height: '48px' }}>
                                        <Users size={22} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--clay-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                            Total Analyzed
                                        </p>
                                        <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--clay-foreground)' }}>{resumes.length}</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="clay-icon clay-icon-pink" style={{ width: '48px', height: '48px' }}>
                                        <UserCheck size={22} />
                                    </div>
                                    <div>
                                        <p style={{ color: 'var(--clay-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                            Registered Users
                                        </p>
                                        <h2 style={{ fontSize: '2.5rem', margin: 0, color: 'var(--clay-foreground)' }}>{registeredUsers.length}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-xl)', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                    <div className="clay-icon clay-icon-green" style={{ width: '48px', height: '48px' }}>
                                        <TrendingUp size={22} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Simulated AI Market Scraper</h3>
                                        <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.9rem' }}>Force a simulated market shift.</p>
                                    </div>
                                </div>
                                <button onClick={handleTriggerScrape} className="clay-btn clay-btn-primary shadow-clay-button">
                                    Simulate 1-Year Shift
                                </button>
                            </div>
                            {scrapeStatus && (
                                <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--clay-success)', fontWeight: 600 }}>
                                    {scrapeStatus}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}
                    >
                        <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div className="clay-icon clay-icon-purple" style={{ width: '40px', height: '40px' }}>
                                    <ShieldAlert size={18} />
                                </div>
                                Registered Accounts
                            </h3>
                            <div className="clay-table-container">
                                <table className="clay-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {registeredUsers.map(u => (
                                            <tr key={u.id}>
                                                <td style={{ fontWeight: 700 }}>#{u.id}</td>
                                                <td>{u.username}</td>
                                                <td>{u.email}</td>
                                                <td><span className="clay-badge clay-badge-primary">{u.role}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    {u.username !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteRegisteredUser(u.id)}
                                                            className="clay-btn clay-btn-secondary"
                                                            style={{ padding: '6px 12px', fontSize: '0.8rem', height: 'auto' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div className="clay-icon clay-icon-blue" style={{ width: '40px', height: '40px' }}>
                                    <Users size={18} />
                                </div>
                                Anonymous Upload Logs
                            </h3>
                            <div className="clay-table-container">
                                <table className="clay-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Email</th>
                                            <th>Target Role</th>
                                            <th>Field</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {resumes.slice(0, 15).map(u => (
                                            <tr key={u.ID}>
                                                <td style={{ color: 'var(--clay-muted)' }}>#{u.ID}</td>
                                                <td>{u.Email_ID}</td>
                                                <td>{u.target_role || 'Unknown'}</td>
                                                <td><span className="clay-badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: 'var(--clay-accent)' }}>{u.Predicted_Field}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleDeleteResume(u.ID)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                    >
                                                        <Trash2 size={18} color="var(--clay-muted)" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'courses' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 'var(--spacing-xl)' }}
                    >
                        <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-xl)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div className="clay-icon clay-icon-green" style={{ width: '40px', height: '40px' }}>
                                    <Plus size={18} />
                                </div>
                                Add New Course
                            </h3>
                            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                                        Target Field
                                    </label>
                                    <input
                                        type="text"
                                        className="clay-input"
                                        value={newCourse.field}
                                        onChange={e => setNewCourse({ ...newCourse, field: e.target.value })}
                                        required
                                        placeholder="e.g., Data Science, Web Development"
                                        style={{ height: '48px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        className="clay-input"
                                        value={newCourse.course_name}
                                        onChange={e => setNewCourse({ ...newCourse, course_name: e.target.value })}
                                        required
                                        style={{ height: '48px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                                        Course URL
                                    </label>
                                    <input
                                        type="url"
                                        className="clay-input"
                                        value={newCourse.course_url}
                                        onChange={e => setNewCourse({ ...newCourse, course_url: e.target.value })}
                                        required
                                        style={{ height: '48px' }}
                                    />
                                </div>
                                <button type="submit" className="clay-btn clay-btn-primary shadow-clay-button">
                                    <Plus size={16} />
                                    Add Course
                                </button>
                            </form>
                        </div>

                        <div className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-xl)', maxHeight: '600px', overflowY: 'auto' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                <div className="clay-icon clay-icon-purple" style={{ width: '40px', height: '40px' }}>
                                    <BookOpen size={18} />
                                </div>
                                Course Database
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                                {courses.map(c => (
                                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--clay-accent)' }}>
                                        <div style={{ flex: 1 }}>
                                            <span className="clay-badge clay-badge-primary" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>{c.field}</span>
                                            <h4 style={{ margin: '4px 0', fontSize: '0.95rem' }}>{c.course_name}</h4>
                                            <a href={c.course_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--clay-accent)' }}>
                                                {c.course_url.length > 45 ? c.course_url.substring(0, 45) + '...' : c.course_url}
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCourse(c.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={18} color="var(--clay-muted)" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'feedback' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-xl)' }}
                    >
                        <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <div className="clay-icon clay-icon-blue" style={{ width: '40px', height: '40px' }}>
                                <MessageSquareText size={18} />
                            </div>
                            Feedback Logs
                        </h3>
                        <div className="clay-table-container">
                            <table className="clay-table">
                                <thead>
                                    <tr>
                                        <th>Reviewer</th>
                                        <th>Rating</th>
                                        <th>Comments</th>
                                        <th>Date</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedback.map(f => (
                                        <tr key={f.ID}>
                                            <td>{f.feed_name}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} style={{ color: i < parseInt(f.feed_score) ? 'var(--clay-warning)' : 'var(--clay-muted)' }}>★</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td style={{ maxWidth: '300px' }}>"{f.comments}"</td>
                                            <td>{f.Timestamp.split(' ')[0]}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDeleteFeedback(f.ID)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                                >
                                                    <Trash2 size={18} color="var(--clay-muted)" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Admin;
