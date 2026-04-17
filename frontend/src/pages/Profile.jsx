import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Activity, FileText, TrendingUp, Award, ArrowRight, UploadCloud, Mail, MapPin, Sparkles, Clock, Target, Briefcase, AlertCircle, Calendar, DollarSign, Timer } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ResultsDisplay from '../components/ResultsDisplay';

const Profile = () => {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState(null);
    const [profileData, setProfileData] = useState({
        full_name: '',
        location: '',
    });
    const [preferences, setPreferences] = useState({
        target_role: '',
        timeline_months: 6,
        preferred_location: '',
        salary_target: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.token) return;
            try {
                const [historyRes, profileRes, prefRes] = await Promise.all([
                    api.get('/api/user/history'),
                    api.get('/api/user/profile'),
                    api.get('/api/user/preferences')
                ]);
                const sorted = (historyRes.data.history || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setHistory(sorted);
                setProfileData({
                    full_name: profileRes.data.profile?.full_name || user?.full_name || user?.username || '',
                    location: profileRes.data.profile?.location || '',
                });
                setPreferences({
                    target_role: prefRes.data.preferences?.target_role || '',
                    timeline_months: prefRes.data.preferences?.timeline_months || 6,
                    preferred_location: prefRes.data.preferences?.preferred_location || '',
                    salary_target: prefRes.data.preferences?.salary_target || 0,
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="clay-loader" style={{ minHeight: '100vh' }}>
                <div className="clay-spinner" style={{ width: '48px', height: '48px' }} />
                <p>Loading Dashboard...</p>
            </div>
        );
    }

    if (selectedResult) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="clay-section">
                <div className="container">
                    <button onClick={() => setSelectedResult(null)} className="clay-btn clay-btn-secondary" style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back
                    </button>
                    <ResultsDisplay data={selectedResult} onReset={() => setSelectedResult(null)} />
                </div>
            </motion.div>
        );
    }

    const chartData = history.map(item => ({
        date: new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round(item.resume_score || 0)
    }));

    const latestScore = history.length > 0 ? Math.round(history[history.length - 1].resume_score) : 0;
    const avgScore = history.length > 0 ? Math.round(history.reduce((a, b) => a + (b.resume_score || 0), 0) / history.length) : 0;
    const totalAnalyses = history.length;

    return (
        <motion.div className="clay-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: 'calc(100vh - 200px)', padding: 'var(--spacing-xl) 0' }}>
            <div className="container">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.75rem', margin: 0, fontFamily: 'var(--font-display)' }}>Welcome back, {user?.full_name || user?.username}!</h1>
                                <p style={{ color: 'var(--clay-muted)', margin: '4px 0 0' }}>{user?.email}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <Link to="/jobs" className="clay-btn clay-btn-secondary"><Briefcase size={16} /> Jobs</Link>
                            <Link to="/app" className="clay-btn clay-btn-primary shadow-clay-button"><UploadCloud size={16} /> New Analysis</Link>
                        </div>
                    </div>
                </motion.div>

                {/* User Info from Settings */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)' }}>
                    {[
                        { icon: Target, label: 'Target Role', value: preferences.target_role || 'Not set' },
                        { icon: MapPin, label: 'Location', value: preferences.preferred_location || profileData.location || 'Not set' },
                        { icon: Timer, label: 'Timeline', value: `${preferences.timeline_months} months` },
                        { icon: DollarSign, label: 'Salary Target', value: preferences.salary_target ? `$${preferences.salary_target.toLocaleString()}` : 'Not set' },
                    ].map((item, i) => (
                        <div key={i} style={{ background: 'var(--clay-bg)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                            <item.icon size={16} color="#7C3AED" />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--clay-muted)' }}>{item.label}</div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
                    {[
                        { label: 'Resume Score', value: `${latestScore}%`, icon: Award, color: latestScore >= 70 ? '#22C55E' : latestScore >= 50 ? '#F59E0B' : '#EF4444' },
                        { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: '#7C3AED' },
                        { label: 'Total Analyses', value: totalAnalyses, icon: FileText, color: '#0EA5E9' },
                        { label: 'Last Activity', value: history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleDateString() : 'N/A', icon: Calendar, color: '#64748B' }
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                                <stat.icon size={16} color={stat.color} />
                                <span style={{ color: 'var(--clay-muted)', fontSize: '0.85rem' }}>{stat.label}</span>
                            </div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-2xl)' }}>
                    {[
                        { title: 'Analyze Resume', desc: 'Upload and get AI-powered insights', icon: UploadCloud, link: '/app', color: '#7C3AED' },
                        { title: 'Track Jobs', desc: 'Manage your job applications', icon: Briefcase, link: '/jobs', color: '#0EA5E9' },
                        { title: 'Cover Letter', desc: 'Generate personalized letters', icon: FileText, link: '/cover-letter', color: '#22C55E' }
                    ].map((action, i) => (
                        <Link key={i} to={action.link} style={{ textDecoration: 'none' }}>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: `${action.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <action.icon size={24} color={action.color} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--clay-foreground)' }}>{action.title}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--clay-muted)' }}>{action.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Score Chart */}
                {history.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ margin: '0 0 var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Activity size={20} /> Your Progress</h3>
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--clay-border)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--clay-muted)" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--clay-muted)" fontSize={12} axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: 'var(--clay-cardBgSolid)', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                                    <Area type="monotone" dataKey="score" stroke="#7C3AED" fill="url(#scoreGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Recent Analyses */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}><Clock size={20} /> Recent Analyses</h3>
                        <Link to="/settings" style={{ color: 'var(--clay-accent)', fontSize: '0.9rem' }}>Settings</Link>
                    </div>
                    
                    {history.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--clay-muted)' }}>
                            <Sparkles size={40} style={{ opacity: 0.3, marginBottom: 'var(--spacing-md)' }} />
                            <p>No analyses yet. Upload your first resume to get started!</p>
                            <Link to="/app" className="clay-btn clay-btn-primary" style={{ marginTop: 'var(--spacing-md)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <UploadCloud size={16} /> Analyze Resume
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                            {[...history].reverse().slice(0, 5).map((item, i) => (
                                <div key={item.id || i} onClick={() => item.analysis_data && setSelectedResult(item.analysis_data)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-lg)', background: 'var(--clay-bg)', cursor: item.analysis_data ? 'pointer' : 'default', transition: 'background 0.2s' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.target_role || item.predicted_field || 'Resume Analysis'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--clay-muted)' }}>{new Date(item.timestamp).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: item.resume_score >= 70 ? '#22C55E' : item.resume_score >= 50 ? '#F59E0B' : '#EF4444' }}>
                                            {Math.round(item.resume_score || 0)}%
                                        </span>
                                        {item.analysis_data ? <ArrowRight size={16} /> : <AlertCircle size={16} color="var(--clay-muted)" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Profile;