import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Users, LayoutDashboard, MessageSquareText, Trash2, Server, Plus, BookOpen, ShieldAlert, Activity, TrendingUp, UserCheck, CheckCircle } from 'lucide-react';
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

    const fetchAdminData = useCallback(async () => {
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
        } catch (_err) {
            console.error(_err);
        } finally {
            setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (user && user.token) {
            fetchAdminData();
        }
    }, [user, fetchAdminData]);

    const handleDeleteResume = async (id) => {
        if (!window.confirm("Delete this resume log?")) return;
        try {
            await api.delete(`/api/admin/users/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setResumes(resumes.filter(u => u.ID !== id));
        } catch (_err) { alert("Failed to delete log."); }
    };

    const handleDeleteFeedback = async (id) => {
        if (!window.confirm("Delete this feedback?")) return;
        try {
            await api.delete(`/api/admin/feedback/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setFeedback(feedback.filter(f => f.ID !== id));
        } catch (_err) { alert("Failed to delete feedback."); }
    };

    const handleDeleteRegisteredUser = async (id) => {
        if (!window.confirm("Permanently ban and delete this registered user?")) return;
        try {
            await api.delete(`/api/admin/registered-users/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setRegisteredUsers(registeredUsers.filter(u => u.id !== id));
        } catch (_err) { alert("Failed to ban user."); }
    };

    const handleAddCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/courses', newCourse, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setNewCourse({ field: '', course_name: '', course_url: '' });
            fetchAdminData();
            alert("Course added successfully.");
        } catch (_err) { alert("Failed to add course."); }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Delete this course recommendation?")) return;
        try {
            await api.delete(`/api/admin/courses/${id}`, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setCourses(courses.filter(c => c.id !== id));
        } catch (_err) { alert("Failed to delete course."); }
    };

    const handleTriggerScrape = async () => {
        if (!window.confirm("Simulate a market shift updating the AI Target Role requirements?")) return;
        setScrapeStatus('Running Simulation...');
        try {
            const res = await api.post('/api/admin/trigger-scrape', {}, { headers: { 'Authorization': `Bearer ${user.token}` } });
            setScrapeStatus(`Success: ${res.data.message} (${res.data.timestamp})`);
        } catch (_err) { setScrapeStatus('Failed to trigger simulation.'); }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
            <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
            <p className="text-secondary font-medium uppercase tracking-wider text-sm">
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
            className="py-12 px-4 min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="container mx-auto max-w-[1000px]">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-3xl font-bold m-0 flex items-center gap-4">
                        <div className="p-3 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                            <Server size={28} />
                        </div>
                        Admin Control Panel
                    </h1>
                    <p className="text-secondary mt-2 ml-[72px]">System monitoring and content management</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex gap-2 mb-12 border-b border-neutral-200 pb-4 overflow-x-auto"
                >
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`btn flex items-center gap-2 px-6 py-2 rounded-full transition-all ${
                                activeTab === tab.id 
                                ? 'bg-primary-600 text-white shadow-md' 
                                : 'bg-transparent text-secondary hover:bg-neutral-100'
                            }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </motion.div>

                {activeTab === 'dashboard' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="card p-8 bg-gradient-to-br from-primary-50/50 to-transparent">
                            <h3 className="flex items-center gap-2 m-0 mb-8 text-lg font-bold">
                                <Activity size={20} className="text-primary-600" />
                                Market Intelligence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-white rounded-xl border border-neutral-200">
                                    <p className="text-secondary uppercase text-[10px] font-bold tracking-widest mb-2">
                                        Most Sought-After Role
                                    </p>
                                    <h2 className="m-0 text-2xl text-primary-600 font-bold">
                                        {analytics.most_sought_role || 'N/A'}
                                    </h2>
                                </div>
                                <div className="p-6 bg-white rounded-xl border border-neutral-200">
                                    <p className="text-secondary uppercase text-[10px] font-bold tracking-widest mb-2">
                                        Top Missing Skill Overall
                                    </p>
                                    <h2 className="m-0 text-2xl text-secondary-500 font-bold">
                                        {analytics.most_common_missing_skill || 'N/A'}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="card p-8 flex items-center gap-6">
                                <div className="p-4 bg-primary-50 rounded-xl text-primary-600 border border-primary-100">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-secondary uppercase text-[10px] font-bold tracking-widest mb-1">
                                        Total Analyzed
                                    </p>
                                    <h2 className="text-4xl m-0 font-bold text-primary">{resumes.length}</h2>
                                </div>
                            </div>
                            <div className="card p-8 flex items-center gap-6">
                                <div className="p-4 bg-secondary-50 rounded-xl text-secondary-600 border border-secondary-100">
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <p className="text-secondary uppercase text-[10px] font-bold tracking-widest mb-1">
                                        Registered Users
                                    </p>
                                    <h2 className="text-4xl m-0 font-bold text-primary">{registeredUsers.length}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="card p-8 border border-primary-100 bg-primary-50/30">
                            <div className="flex items-center justify-between flex-wrap gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white rounded-xl text-success-600 border border-neutral-200 shadow-sm">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <h3 className="m-0 text-lg font-bold">Simulated AI Market Scraper</h3>
                                        <p className="m-0 text-secondary text-sm">Force a simulated market shift to update requirements.</p>
                                    </div>
                                </div>
                                <button onClick={handleTriggerScrape} className="btn btn-primary px-8">
                                    Simulate 1-Year Shift
                                </button>
                            </div>
                            {scrapeStatus && (
                                <p className="mt-4 text-success font-semibold flex items-center gap-2">
                                    <CheckCircle size={16} /> {scrapeStatus}
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'users' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="card overflow-hidden">
                            <div className="p-8 border-b border-neutral-100 flex items-center gap-3">
                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                    <ShieldAlert size={20} />
                                </div>
                                <h3 className="m-0 text-lg font-bold">Registered Accounts</h3>
                            </div>
                            <div className="overflow-auto">
                                <table className="w-full text-left border-none" style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className="bg-secondary text-[10px] uppercase tracking-widest text-secondary font-bold">
                                            <th className="px-8 py-4 border-b border-neutral-200">ID</th>
                                            <th className="px-8 py-4 border-b border-neutral-200">Username</th>
                                            <th className="px-8 py-4 border-b border-neutral-200">Email</th>
                                            <th className="px-8 py-4 border-b border-neutral-200">Role</th>
                                            <th className="px-8 py-4 border-b border-neutral-200 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {registeredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-secondary transition">
                                                <td className="px-8 py-4 border-b border-neutral-100 text-xs text-secondary">#{u.id}</td>
                                                <td className="px-8 py-4 border-b border-neutral-100 font-medium">{u.username}</td>
                                                <td className="px-8 py-4 border-b border-neutral-100 text-secondary">{u.email}</td>
                                                <td className="px-8 py-4 border-b border-neutral-100">
                                                    <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 border-b border-neutral-100 text-right">
                                                    {u.username !== 'admin' && (
                                                        <button
                                                            onClick={() => handleDeleteRegisteredUser(u.id)}
                                                            className="btn btn-ghost p-2 hover:text-error-600"
                                                            style={{ minHeight: 'auto' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="card overflow-hidden">
                            <div className="p-8 border-b border-neutral-100 flex items-center gap-3">
                                <div className="p-2 bg-accent-100 rounded-lg text-accent">
                                    <Users size={20} />
                                </div>
                                <h3 className="m-0 text-lg font-bold">Anonymous Upload Logs</h3>
                            </div>
                            <div className="overflow-auto">
                                <table className="w-full text-left border-none" style={{ borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr className="bg-secondary text-[10px] uppercase tracking-widest text-secondary font-bold">
                                            <th className="px-8 py-4 border-b border-neutral-200">ID</th>
                                            <th className="px-8 py-4 border-b border-neutral-200">Email</th>
                                            <th className="px-8 py-4 border-b border-neutral-200">Target Role</th>
                                            <th className="px-8 py-4 border-b border-neutral-200">Field</th>
                                            <th className="px-8 py-4 border-b border-neutral-200 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {resumes.slice(0, 15).map(u => (
                                            <tr key={u.ID} className="hover:bg-secondary transition">
                                                <td className="px-8 py-4 border-b border-neutral-100 text-xs text-secondary">#{u.ID}</td>
                                                <td className="px-8 py-4 border-b border-neutral-100 font-medium">{u.Email_ID}</td>
                                                <td className="px-8 py-4 border-b border-neutral-100 text-secondary">{u.target_role || 'Unknown'}</td>
                                                <td className="px-8 py-4 border-b border-neutral-100">
                                                    <span className="px-2 py-1 bg-accent-100 text-accent rounded text-[10px] font-bold uppercase tracking-wider">
                                                        {u.Predicted_Field}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-4 border-b border-neutral-100 text-right">
                                                    <button
                                                        onClick={() => handleDeleteResume(u.ID)}
                                                        className="btn btn-ghost p-2 hover:text-error-600"
                                                        style={{ minHeight: 'auto' }}
                                                    >
                                                        <Trash2 size={16} />
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
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <div className="card p-8 h-auto">
                            <h3 className="m-0 mb-8 flex items-center gap-2 text-lg font-bold">
                                <Plus size={20} className="text-success-600" /> 
                                Add New Course
                            </h3>
                            <form onSubmit={handleAddCourse} className="flex flex-col gap-6">
                                <div>
                                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-secondary">
                                        Target Field
                                    </label>
                                    <input
                                        type="text"
                                        className="input h-12"
                                        value={newCourse.field}
                                        onChange={e => setNewCourse({ ...newCourse, field: e.target.value })}
                                        required
                                        placeholder="e.g., Data Science, Web Development"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-secondary">
                                        Course Title
                                    </label>
                                    <input
                                        type="text"
                                        className="input h-12"
                                        value={newCourse.course_name}
                                        onChange={e => setNewCourse({ ...newCourse, course_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-secondary">
                                        Course URL
                                    </label>
                                    <input
                                        type="url"
                                        className="input h-12"
                                        value={newCourse.course_url}
                                        onChange={e => setNewCourse({ ...newCourse, course_url: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
                                    <Plus size={18} />
                                    Add Course
                                </button>
                            </form>
                        </div>

                        <div className="card flex flex-col overflow-hidden max-h-[600px]">
                            <div className="p-8 border-b border-neutral-100 flex items-center gap-3">
                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                    <BookOpen size={20} />
                                </div>
                                <h3 className="m-0 text-lg font-bold">Course Database</h3>
                            </div>
                            <div className="flex-1 overflow-auto p-8 flex flex-col gap-4 bg-secondary">
                                {courses.map(c => (
                                    <div key={c.id} className="p-6 bg-white rounded-xl border border-neutral-200 flex justify-between items-start gap-4 hover:shadow transition">
                                        <div className="flex-1" style={{ minWidth: 0 }}>
                                            <span className="inline-block px-2 py-1 bg-primary-50 text-primary-600 rounded text-[10px] font-bold uppercase tracking-wider mb-2">
                                                {c.field}
                                            </span>
                                            <h4 className="m-0 text-base font-bold mb-1" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.course_name}</h4>
                                            <a href={c.course_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:text-primary-700 block" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {c.course_url}
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCourse(c.id)}
                                            className="btn btn-ghost p-2 hover:text-error-600"
                                            style={{ minHeight: 'auto' }}
                                        >
                                            <Trash2 size={16} />
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
                        className="card overflow-hidden"
                    >
                        <div className="p-8 border-b border-neutral-100 flex items-center gap-3">
                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                                <MessageSquareText size={20} />
                            </div>
                            <h3 className="m-0 text-lg font-bold">Feedback Logs</h3>
                        </div>
                        <div className="overflow-auto">
                            <table className="w-full text-left border-none" style={{ borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr className="bg-secondary text-[10px] uppercase tracking-widest text-secondary font-bold">
                                        <th className="px-8 py-4 border-b border-neutral-200">Reviewer</th>
                                        <th className="px-8 py-4 border-b border-neutral-200">Rating</th>
                                        <th className="px-8 py-4 border-b border-neutral-200">Comments</th>
                                        <th className="px-8 py-4 border-b border-neutral-200">Date</th>
                                        <th className="px-8 py-4 border-b border-neutral-200 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {feedback.map(f => (
                                        <tr key={f.ID} className="hover:bg-secondary transition">
                                            <td className="px-8 py-4 border-b border-neutral-100 font-medium">{f.feed_name}</td>
                                            <td className="px-8 py-4 border-b border-neutral-100">
                                                <div className="flex gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={`text-lg ${i < parseInt(f.feed_score) ? 'text-warning' : 'text-quaternary'}`}>★</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 border-b border-neutral-100 text-secondary italic">"{f.comments}"</td>
                                            <td className="px-8 py-4 border-b border-neutral-100 text-secondary">{f.Timestamp.split(' ')[0]}</td>
                                            <td className="px-8 py-4 border-b border-neutral-100 text-right">
                                                <button
                                                    onClick={() => handleDeleteFeedback(f.ID)}
                                                    className="btn btn-ghost p-2 hover:text-error-600"
                                                    style={{ minHeight: 'auto' }}
                                                >
                                                    <Trash2 size={16} />
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
