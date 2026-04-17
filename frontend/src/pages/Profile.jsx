import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { User, Activity, FileText, TrendingUp, Calendar, Target, Award, ArrowRight, UploadCloud, Mail, Phone, MapPin, Briefcase, Edit2, Save, X, Sparkles, Zap, Code2, Clock, AlertCircle } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ResultsDisplay from '../components/ResultsDisplay';

const Profile = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [preferences, setPreferences] = useState({});
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileData, setProfileData] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: '',
        location: '',
        bio: '',
        current_role: '',
        experience_years: '',
        linkedin_url: '',
        github_url: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const historyRes = await axios.get('http://localhost:8000/api/user/history', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const sortedHistory = historyRes.data.history.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setHistory(sortedHistory);

                const prefRes = await axios.get('http://localhost:8000/api/user/preferences', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                setPreferences(prefRes.data.preferences || {});

                const profileRes = await axios.get('http://localhost:8000/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                });
                const profileDataRes = profileRes.data.profile || {};
                setProfileData({
                    full_name: profileDataRes.full_name || user?.full_name || '',
                    email: user?.email || '',
                    phone: profileDataRes.phone || '',
                    location: profileDataRes.location || '',
                    bio: profileDataRes.bio || '',
                    current_role: profileDataRes.current_role || '',
                    experience_years: profileDataRes.experience_years || '',
                    linkedin_url: profileDataRes.linkedin_url || '',
                    github_url: profileDataRes.github_url || ''
                });
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.token) {
            fetchData();
        }
    }, [user]);

    if (loading) return (
        <div className="clay-loader" style={{ minHeight: '100vh' }}>
            <div className="clay-spinner" style={{ width: '64px', height: '64px' }} />
            <p style={{ color: 'var(--clay-accent)', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Loading Profile...
            </p>
        </div>
    );

    const chartData = history.map(item => ({
        date: item.timestamp.split(' ')[0],
        score: Math.round(item.resume_score),
        role: item.target_role || item.predicted_field
    }));

    const latestUpload = history.length > 0 ? history[history.length - 1] : null;
    const averageScore = history.length > 0 ? Math.round(history.reduce((acc, item) => acc + item.resume_score, 0) / history.length) : 0;
    const highestScore = history.length > 0 ? Math.max(...history.map(item => item.resume_score)) : 0;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--clay-cardBgSolid)', border: '1px solid rgba(124, 58, 237, 0.15)', padding: 'var(--spacing-sm) var(--spacing-md)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--clay-foreground)', fontSize: '0.9rem' }}>{label}</p>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--clay-accent)', fontSize: '0.85rem' }}>Score: {payload[0].value}%</p>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--clay-muted)', fontSize: '0.8rem' }}>Role: {payload[0].payload.role}</p>
                </div>
            );
        }
        return null;
    };

    const handleRowClick = (item) => {
        if (item.analysis_data) {
            setSelectedResult(item.analysis_data);
        } else {
            setShowWarning(true);
            setTimeout(() => setShowWarning(false), 4000);
        }
    };

    const handleProfileSave = async () => {
        try {
            await axios.put('http://localhost:8000/api/user/profile', profileData, {
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            setEditingProfile(false);
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    if (selectedResult) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-section">
                <div className="container">
                    <button
                        onClick={() => setSelectedResult(null)}
                        className="clay-btn clay-btn-secondary shadow-clay-button"
                        style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
                    >
                        <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Dashboard
                    </button>
                    <ResultsDisplay data={selectedResult} onReset={() => setSelectedResult(null)} />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="clay-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ minHeight: '100vh' }}
        >
            <div className="container">
                <AnimatePresence>
                    {showWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-md)',
                                marginBottom: 'var(--spacing-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-sm)',
                                color: 'var(--clay-warning)'
                            }}
                        >
                            <AlertCircle size={20} />
                            <span>No detailed analysis data available for this entry.</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="clay-card shadow-clay-card"
                    style={{ borderRadius: 'var(--radius-2xl)', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                            <div className="clay-icon clay-icon-purple" style={{ width: '72px', height: '72px', fontSize: '1.75rem', fontWeight: 900, fontFamily: 'var(--font-display)', position: 'relative' }}>
                                {(user?.full_name || user?.username)?.charAt(0).toUpperCase()}
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        width: '18px',
                                        height: '18px',
                                        background: 'var(--clay-success)',
                                        borderRadius: '50%',
                                        border: '3px solid white'
                                    }}
                                />
                            </div>
                            <div>
                                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 'var(--spacing-xs)', fontFamily: 'var(--font-display)' }}>
                                    {user?.full_name || user?.username}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-sm)' }}>
                                    <Mail size={14} />
                                    <span style={{ fontSize: '0.9rem' }}>{user?.email}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                                    <span className="clay-badge clay-badge-primary">{user?.role || 'user'}</span>
                                    <span className="clay-badge clay-badge-success">Active</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setEditingProfile(true)}
                            className="clay-btn clay-btn-secondary shadow-clay-button"
                            style={{ gap: 'var(--spacing-sm)' }}
                        >
                            <Edit2 size={16} />
                            Edit Profile
                        </button>
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}
                    >
                        <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto var(--spacing-md)', width: '48px', height: '48px' }}>
                            <FileText size={22} />
                        </div>
                        <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--clay-accent)', fontFamily: 'var(--font-display)' }}>
                            {history.length}
                        </div>
                        <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Total Analyses
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}
                    >
                        <div className="clay-icon clay-icon-green" style={{ margin: '0 auto var(--spacing-md)', width: '48px', height: '48px' }}>
                            <Award size={22} />
                        </div>
                        <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--clay-success)', fontFamily: 'var(--font-display)' }}>
                            {highestScore}%
                        </div>
                        <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Highest Score
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}
                    >
                        <div className="clay-icon clay-icon-blue" style={{ margin: '0 auto var(--spacing-md)', width: '48px', height: '48px' }}>
                            <TrendingUp size={22} />
                        </div>
                        <div style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 900, color: 'var(--clay-accent-tertiary)', fontFamily: 'var(--font-display)' }}>
                            {averageScore}%
                        </div>
                        <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Average Score
                        </p>
                    </motion.div>
                </div>

                {history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div className="clay-icon clay-icon-purple" style={{ width: '44px', height: '44px' }}>
                                <Activity size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Score Progression</h3>
                                <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Track your improvement over time</p>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 280 }}>
                            <ResponsiveContainer>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--clay-accent)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="var(--clay-accent)" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(124, 58, 237, 0.1)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--clay-muted)" tick={{ fill: 'var(--clay-muted)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(124, 58, 237, 0.2)' }} />
                                    <Area type="monotone" dataKey="score" stroke="var(--clay-accent)" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {history.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                            <div className="clay-icon clay-icon-blue" style={{ width: '44px', height: '44px' }}>
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Analysis History</h3>
                                <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Click any entry to view detailed results</p>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="clay-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Target Role</th>
                                        <th>Predicted Field</th>
                                        <th>Score</th>
                                        <th>Missing Skills</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...history].reverse().map((item, index) => (
                                        <tr
                                            key={item.id || index}
                                            onClick={() => handleRowClick(item)}
                                            style={{ cursor: item.analysis_data ? 'pointer' : 'default' }}
                                        >
                                            <td style={{ fontWeight: 600 }}>{item.timestamp.split(' ')[0]}</td>
                                            <td><span className="clay-badge clay-badge-primary" style={{ fontSize: '0.8rem' }}>{item.target_role || 'N/A'}</span></td>
                                            <td>{item.predicted_field}</td>
                                            <td>
                                                <span style={{
                                                    fontWeight: 800,
                                                    color: item.resume_score >= 75 ? 'var(--clay-success)' : item.resume_score >= 50 ? 'var(--clay-warning)' : 'var(--clay-accent)',
                                                    fontSize: '1.1rem'
                                                }}>
                                                    {Math.round(item.resume_score)}%
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                                                    {item.missing_skills?.length > 0 ? `${item.missing_skills.length} skills` : 'None'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {history.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="clay-card shadow-clay-card"
                        style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}
                    >
                        <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto var(--spacing-lg)', width: '64px', height: '64px' }}>
                            <Sparkles size={28} />
                        </div>
                        <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Analyses Yet</h3>
                        <p style={{ color: 'var(--clay-muted)', marginBottom: 'var(--spacing-lg)' }}>
                            Upload your first resume to see your career insights here.
                        </p>
                        <Link to="/app" className="clay-btn clay-btn-primary shadow-clay-button">
                            <UploadCloud size={18} />
                            Analyze Resume
                        </Link>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {editingProfile && (
                    <div
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(51, 47, 58, 0.6)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: 99999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 'var(--spacing-lg)'
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{
                                maxWidth: '520px',
                                width: '90%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                borderRadius: 'var(--radius-2xl)',
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                padding: 'var(--spacing-xl)',
                                boxShadow: '0 25px 50px rgba(160, 150, 180, 0.4), -15px -15px 30px rgba(255, 255, 255, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.8)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>Edit Profile</h2>
                                <button
                                    onClick={() => setEditingProfile(false)}
                                    style={{
                                        background: 'rgba(124, 58, 237, 0.1)',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--clay-muted)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                                {[
                                    { key: 'full_name', label: 'Full Name', type: 'text' },
                                    { key: 'phone', label: 'Phone', type: 'tel' },
                                    { key: 'location', label: 'Location', type: 'text' },
                                    { key: 'current_role', label: 'Current Role', type: 'text' },
                                    { key: 'experience_years', label: 'Experience (years)', type: 'text' },
                                    { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
                                    { key: 'github_url', label: 'GitHub URL', type: 'url' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            className="clay-input"
                                            value={profileData[field.key]}
                                            onChange={(e) => setProfileData({...profileData, [field.key]: e.target.value})}
                                            style={{ height: '48px', fontSize: '0.95rem' }}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        Bio
                                    </label>
                                    <textarea
                                        className="clay-input clay-textarea"
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                        rows="3"
                                        style={{ minHeight: '100px', height: 'auto', padding: '12px 16px', fontSize: '0.95rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setEditingProfile(false)}
                                    className="clay-btn clay-btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProfileSave}
                                    className="clay-btn clay-btn-primary shadow-clay-button"
                                >
                                    <Save size={16} />
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Profile;
