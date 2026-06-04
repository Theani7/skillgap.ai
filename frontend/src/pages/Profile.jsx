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
            <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
                <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
                <p className="text-secondary font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    if (selectedResult) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 px-4">
                <div className="container mx-auto max-w-[800px]">
                    <button onClick={() => setSelectedResult(null)} className="btn btn-secondary mb-8 flex items-center gap-2">
                        <ArrowRight size={18} className="rotate-180" /> Back
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
        <motion.div className="py-12 px-4 min-h-[calc(100vh-200px)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="container mx-auto max-w-[800px]">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold m-0">Welcome back, {user?.full_name || user?.username}!</h1>
                                <p className="text-secondary mt-1">{user?.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/jobs" className="btn btn-secondary flex items-center gap-2"><Briefcase size={16} /> Jobs</Link>
                            <Link to="/app" className="btn btn-primary flex items-center gap-2 shadow-md"><UploadCloud size={16} /> New Analysis</Link>
                        </div>
                    </div>
                </motion.div>

                {/* User Info from Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
                    {[
                        { icon: Target, label: 'Target Role', value: preferences.target_role || 'Not set' },
                        { icon: MapPin, label: 'Location', value: preferences.preferred_location || profileData.location || 'Not set' },
                        { icon: Timer, label: 'Timeline', value: `${preferences.timeline_months} months` },
                        { icon: DollarSign, label: 'Salary Target', value: preferences.salary_target ? `$${preferences.salary_target.toLocaleString()}` : 'Not set' },
                    ].map((item, i) => (
                        <div key={i} className="bg-secondary p-4 rounded-xl flex items-center gap-3 border border-neutral-200">
                            <item.icon size={16} className="text-primary-600" />
                            <div>
                                <div className="text-[10px] uppercase tracking-wider text-tertiary font-bold">{item.label}</div>
                                <div className="font-semibold text-sm">{item.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {[
                        { label: 'Resume Score', value: `${latestScore}%`, icon: Award, color: latestScore >= 70 ? 'text-success' : latestScore >= 50 ? 'text-warning' : 'text-error' },
                        { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-primary-600' },
                        { label: 'Total Analyses', value: totalAnalyses, icon: FileText, color: 'text-primary-500' },
                        { label: 'Last Activity', value: history.length > 0 ? new Date(history[history.length - 1].timestamp).toLocaleDateString() : 'N/A', icon: Calendar, color: 'text-neutral-500' }
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="card p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon size={16} className={stat.color} />
                                <span className="text-secondary text-xs font-medium">{stat.label}</span>
                            </div>
                            <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                    {[
                        { title: 'Analyze Resume', desc: 'AI-powered insights', icon: UploadCloud, link: '/app', color: 'bg-primary-50 text-primary-600' },
                        { title: 'Track Jobs', desc: 'Manage applications', icon: Briefcase, link: '/jobs', color: 'bg-primary-50 text-primary-500' },
                        { title: 'Cover Letter', desc: 'Generate letters', icon: FileText, link: '/cover-letter', color: 'bg-success-50 text-success' }
                    ].map((action, i) => (
                        <Link key={i} to={action.link} className="no-underline group">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="card p-6 flex items-center gap-4 group-hover:border-primary-300 transition-colors">
                                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                                    <action.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="m-0 text-base font-bold text-primary">{action.title}</h3>
                                    <p className="m-1 text-xs text-secondary">{action.desc}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Score Chart */}
                {history.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8 mb-12">
                        <h3 className="m-0 mb-8 flex items-center gap-2 text-lg font-bold"><Activity size={20} className="text-primary-600" /> Your Progress</h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-neutral-200)" vertical={false} />
                                    <XAxis dataKey="date" stroke="var(--color-neutral-400)" fontSize={12} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--color-neutral-400)" fontSize={12} axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border-light)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }} />
                                    <Area type="monotone" dataKey="score" stroke="#2563eb" fill="url(#scoreGradient)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {/* Recent Analyses */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="m-0 flex items-center gap-2 text-lg font-bold"><Clock size={20} className="text-primary-600" /> Recent Analyses</h3>
                        <Link to="/settings" className="text-primary-600 text-sm font-semibold hover:underline">Settings</Link>
                    </div>
                    
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-secondary">
                            <Sparkles size={48} className="opacity-20 mx-auto mb-4" />
                            <p className="mb-6">No analyses yet. Upload your first resume to get started!</p>
                            <Link to="/app" className="btn btn-primary inline-flex items-center gap-2">
                                <UploadCloud size={16} /> Analyze Resume
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {[...history].reverse().slice(0, 5).map((item, i) => (
                                <div key={item.id || i} onClick={() => item.analysis_data && setSelectedResult(item.analysis_data)} className={`flex justify-between items-center p-4 rounded-xl bg-secondary border border-neutral-100 ${item.analysis_data ? 'cursor-pointer hover:border-primary-200 transition-colors' : 'cursor-default'}`}>
                                    <div>
                                        <div className="font-bold text-sm mb-1">{item.target_role || item.predicted_field || 'Resume Analysis'}</div>
                                        <div className="text-xs text-tertiary">{new Date(item.timestamp).toLocaleDateString()}</div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-bold text-xl ${item.resume_score >= 70 ? 'text-success' : item.resume_score >= 50 ? 'text-warning' : 'text-error'}`}>
                                            {Math.round(item.resume_score || 0)}%
                                        </span>
                                        {item.analysis_data ? <ArrowRight size={16} className="text-tertiary" /> : <AlertCircle size={16} className="text-tertiary" />}
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