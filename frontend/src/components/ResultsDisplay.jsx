import React, { useState, useEffect } from 'react';
import { API_URL } from '../services/env';
import { RefreshCcw, User, Mail, Phone, FileDigit, Briefcase, GraduationCap, PlayCircle, Lightbulb, Star, Send, RotateCw, Target, Award, BookOpen, TrendingUp, Share2, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Roadmap from './Roadmap';
import TrendDashboard from './TrendDashboard';
import AnimatedScore from './AnimatedScore';

const ResultsDisplay = ({ data, onReset }) => {
    const {
        data: resumeInfo,
        target_role,
        predicted_field,
        recommended_skills,
        recommended_courses,
        match_score,
        missing_skills,
        resume_score,
        feedback,
        videos,
        roadmap,
        trends,
        score_breakdown,
        job_matches
    } = data;

    const [feedbackSent, setFeedbackSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [scraperStatus, setScraperStatus] = useState(null);
    const { user } = useAuth();

    const extractVideoId = (url) => {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    };

    useEffect(() => {
        const fetchScraperStatus = async () => {
            try {
                const res = await fetch(`${API_URL}/api/trends/status`);
                if (res.ok) {
                    const result = await res.json();
                    setScraperStatus(result.last_scraped);
                }
            } catch (err) {
                console.error("Failed to fetch scraper status", err);
            }
        };
        fetchScraperStatus();
    }, []);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (user?.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }

            const res = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    name: resumeInfo.name || 'Anonymous',
                    email: resumeInfo.email || 'N/A',
                    score: rating.toString(),
                    comments: fd.get('comments')
                })
            });
            if (res.ok) setFeedbackSent(true);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ 
                paddingTop: 'var(--space-12)',
                maxWidth: '800px',
                margin: '0 auto'
            }}
        >
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: 'var(--space-8)', 
                        flexWrap: 'wrap', 
                        gap: 'var(--space-4)' 
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <div>
                            <h2 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, color: 'var(--color-neutral-900)', marginBottom: '0' }}>
                                Analysis Results
                            </h2>
                            <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 'var(--text-base)' }}>Your personalized roadmap is ready</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onReset}
                        style={{ gap: 'var(--space-2)' }}
                    >
                        <RefreshCcw size={18} />
                        Analyze Another
                    </button>
                </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ 
                        marginBottom: 'var(--space-8)', 
                        padding: 'var(--space-6)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'var(--color-white)'
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1fr', gap: 'var(--space-8)' }}>
                        <div>
                            <h3 style={{ 
                                paddingBottom: 'var(--space-3)', 
                                marginBottom: 'var(--space-4)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--space-2)', 
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--color-neutral-900)',
                                borderBottom: '1px solid var(--color-neutral-100)'
                            }}>
                                <User size={18} />
                                Basic Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                                    <span style={{ color: 'var(--color-neutral-500)' }}>Name</span>
                                    <span style={{ color: 'var(--color-neutral-900)', fontWeight: 600 }}>{resumeInfo.name || 'Not Found'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                                    <span style={{ color: 'var(--color-neutral-500)' }}>Email</span>
                                    <span style={{ color: 'var(--color-neutral-900)', fontWeight: 600 }}>{resumeInfo.email || 'Not Found'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                                    <span style={{ color: 'var(--color-neutral-500)' }}>Mobile</span>
                                    <span style={{ color: 'var(--color-neutral-900)', fontWeight: 600 }}>{resumeInfo.mobile_number || 'Not Found'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                                    <span style={{ color: 'var(--color-neutral-500)' }}>Pages</span>
                                    <span style={{ color: 'var(--color-neutral-900)', fontWeight: 600 }}>{resumeInfo.no_of_pages}</span>
                                </div>
                            </div>

                            <h3 style={{ 
                                marginTop: 'var(--space-8)', 
                                marginBottom: 'var(--space-4)',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--space-2)', 
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--color-neutral-900)',
                                borderBottom: '1px solid var(--color-neutral-100)',
                                paddingBottom: 'var(--space-3)'
                            }}>
                                <Briefcase size={18} />
                                Field Analysis
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                                    <span style={{ color: 'var(--color-neutral-500)' }}>Target Role</span>
                                    <span style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{target_role || 'Not Specified'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                                    <span style={{ color: 'var(--color-neutral-500)' }}>Predicted</span>
                                    <span style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>{predicted_field}</span>
                                </div>
                            </div>

                            <h3 style={{ 
                                marginTop: 'var(--space-8)', 
                                marginBottom: 'var(--space-4)',
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--space-2)', 
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--color-neutral-900)',
                                borderBottom: '1px solid var(--color-neutral-100)',
                                paddingBottom: 'var(--space-3)'
                            }}>
                                <Star size={18} />
                                Skills Detected
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                {resumeInfo.skills && resumeInfo.skills.length > 0 ? (
                                    resumeInfo.skills.slice(0, 12).map((s, i) => (
                                        <span key={i} style={{ 
                                            background: 'var(--color-neutral-100)', 
                                            color: 'var(--color-neutral-700)', 
                                            padding: 'var(--space-1) var(--space-3)', 
                                            borderRadius: 'var(--border-radius-full)',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: 500
                                        }}>{s}</span>
                                    ))
                                ) : (
                                    <span style={{ color: 'var(--color-neutral-400)' }}>No skills detected.</span>
                                )}
                            </div>
                        </div>

                        <div style={{ borderLeft: '1px solid var(--color-neutral-100)', paddingLeft: 'var(--space-8)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 'var(--space-8)', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.05em' }}>Resume Score</p>
                                    <AnimatedScore score={resume_score} />
                                </div>
                                {target_role && (
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ textTransform: 'uppercase', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.05em' }}>Role Match</p>
                                        <AnimatedScore score={match_score || 0} />
                                    </div>
                                )}
                            </div>

                            <h3 style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 'var(--space-2)', 
                                fontSize: 'var(--text-lg)',
                                fontWeight: 600,
                                color: 'var(--color-neutral-900)',
                                marginBottom: 'var(--space-4)', 
                                borderBottom: '1px solid var(--color-neutral-100)', 
                                paddingBottom: 'var(--space-3)' 
                            }}>
                                <Lightbulb size={18} />
                                AI Suggestions
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                {feedback.map((f, i) => (
                                    <li key={i} style={{ 
                                        padding: 'var(--space-3)', 
                                        background: 'var(--color-neutral-50)', 
                                        borderRadius: 'var(--border-radius-md)', 
                                        color: 'var(--color-neutral-700)', 
                                        fontSize: 'var(--text-sm)',
                                        lineHeight: 1.5,
                                        border: '1px solid var(--color-neutral-100)'
                                    }}>
                                        {f}
                                    </li>
                                ))}
                                {feedback.length === 0 && (
                                    <li style={{ padding: 'var(--space-3)', background: 'var(--color-success-50)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-success-700)', fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                                        Great job! Your resume hits all the key points.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', lg: '1fr 1fr', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ 
                            padding: 'var(--space-6)',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--border-radius-lg)',
                            background: 'var(--color-white)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', margin: 0, fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                                <Target size={20} />
                                Skills Analysis
                            </h3>
                            {scraperStatus && (
                                <div style={{ 
                                    fontSize: 'var(--text-xs)', 
                                    color: 'var(--color-neutral-500)', 
                                    background: 'var(--color-neutral-50)', 
                                    padding: 'var(--space-1) var(--space-2)', 
                                    borderRadius: 'var(--border-radius-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-1)',
                                    border: '1px solid var(--color-neutral-100)'
                                }}>
                                    <RotateCw size={12} />
                                    Scraped: {scraperStatus.split(' ')[0]}
                                </div>
                            )}
                        </div>

                        {missing_skills && missing_skills.length > 0 && (
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <p style={{ color: 'var(--color-primary-600)', marginBottom: 'var(--space-2)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>Missing Skills for {target_role}:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                                    {missing_skills.map((ms, i) => (
                                        <a
                                            key={i}
                                            href={ms.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <span style={{ 
                                                background: 'var(--color-primary-50)', 
                                                color: 'var(--color-primary-700)', 
                                                border: '1px solid var(--color-primary-100)', 
                                                cursor: 'pointer', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '4px',
                                                padding: 'var(--space-1) var(--space-3)',
                                                borderRadius: 'var(--border-radius-full)',
                                                fontSize: 'var(--text-sm)',
                                                fontWeight: 500
                                            }}>
                                                {ms.title?.replace('Learn ', '')} <PlayCircle size={12} />
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-2)', fontSize: 'var(--text-sm)' }}>Recommended {predicted_field} Skills:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {recommended_skills.map((s, i) => (
                                <span key={i} style={{ 
                                    background: 'var(--color-neutral-100)', 
                                    color: 'var(--color-neutral-700)', 
                                    padding: 'var(--space-1) var(--space-3)', 
                                    borderRadius: 'var(--border-radius-full)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 500
                                }}>{s}</span>
                            ))}
                            {recommended_skills.length === 0 && <span style={{ color: 'var(--color-neutral-400)' }}>No recommendations available.</span>}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ 
                            padding: 'var(--space-6)',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--border-radius-lg)',
                            background: 'var(--color-white)'
                        }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                            <GraduationCap size={20} />
                            Recommended Courses
                        </h3>
                        <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>Curated learning path for {target_role || predicted_field}.</p>
                        <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: 'var(--space-2)' }}>
                            {missing_skills && missing_skills.length > 0 && (
                                <div style={{ marginBottom: 'var(--space-4)' }}>
                                    <p style={{ color: 'var(--color-primary-600)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', paddingBottom: '4px', borderBottom: '1px solid var(--color-neutral-100)' }}>
                                        Priority: Missing Skill Courses
                                    </p>
                                    {missing_skills.map((ms, i) => (
                                        <div key={'ms' + i} style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--space-2)', borderLeft: '3px solid var(--color-primary-500)' }}>
                                            <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{ms.title}</h4>
                                            <a href={ms.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                                Start Learning <PlayCircle size={12} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p style={{ color: 'var(--color-neutral-900)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', paddingBottom: '4px', borderBottom: '1px solid var(--color-neutral-100)' }}>
                                General {predicted_field} Courses
                            </p>
                            {recommended_courses.map((c, i) => (
                                <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius-md)', marginBottom: 'var(--space-2)', border: '1px solid var(--color-neutral-100)' }}>
                                    <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{c[0]}</h4>
                                    <a href={c[1]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-600)', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                                        View Course <PlayCircle size={12} />
                                    </a>
                                </div>
                            ))}
                            {recommended_courses.length === 0 && <span style={{ color: 'var(--color-neutral-400)' }}>No courses for this field yet.</span>}
                        </div>
                    </motion.div>
                </div>

                <TrendDashboard trends={trends} field={predicted_field} />

                {score_breakdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ 
                            marginTop: 'var(--space-8)', 
                            padding: 'var(--space-6)',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--border-radius-lg)',
                            background: 'var(--color-white)'
                        }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                            <Award size={20} />
                            Score Breakdown
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-4)' }}>
                            {Object.entries(score_breakdown).map(([key, value]) => (
                                <div key={key} style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-neutral-100)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                                        <strong style={{ textTransform: 'capitalize', fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', fontWeight: 600 }}>{key.replaceAll('_', ' ')}</strong>
                                        <span style={{ fontWeight: 700, color: 'var(--color-primary-600)', fontSize: 'var(--text-sm)' }}>{value.score}/{value.weight}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 500, color: value.status === 'present' ? 'var(--color-success-600)' : 'var(--color-neutral-400)' }}>
                                        {value.status === 'present' ? 'Complete' : 'Missing'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {job_matches && job_matches.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{ 
                            marginTop: 'var(--space-8)', 
                            padding: 'var(--space-6)',
                            border: '1px solid var(--color-neutral-200)',
                            borderRadius: 'var(--border-radius-lg)',
                            background: 'var(--color-white)'
                        }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                            <TrendingUp size={20} />
                            Recommended Jobs
                        </h3>
                        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                            {job_matches.slice(0, 6).map((job) => (
                                <div key={job.job_id} style={{ 
                                    padding: 'var(--space-4)', 
                                    background: 'var(--color-white)', 
                                    borderRadius: 'var(--border-radius-lg)', 
                                    border: '1px solid var(--color-neutral-100)', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    flexWrap: 'wrap', 
                                    gap: 'var(--space-4)' 
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>{job.title}</h4>
                                        <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>{job.company} · {job.location} · {job.workplace_type}</p>
                                    </div>
                                    <span style={{ 
                                        background: 'var(--color-success-50)', 
                                        color: 'var(--color-success-700)', 
                                        padding: 'var(--space-1) var(--space-3)', 
                                        borderRadius: 'var(--border-radius-full)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 600,
                                        border: '1px solid var(--color-success-100)'
                                    }}>
                                        {job.fit_score}% Match
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <Roadmap path={roadmap} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{ 
                        marginTop: 'var(--space-8)', 
                        padding: 'var(--space-6)',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'var(--color-white)'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                        <div>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                                <BookOpen size={20} />
                                Learning Resources
                            </h2>
                            <p style={{ margin: 0, color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)' }}>Curated tutorials for your skill gaps.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                            <span style={{ background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--border-radius-full)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>Tutorials {videos?.tutorials?.length || 0}</span>
                            <span style={{ background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--border-radius-full)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>Resume {videos?.resume?.length || 0}</span>
                            <span style={{ background: 'var(--color-neutral-100)', color: 'var(--color-neutral-700)', padding: 'var(--space-1) var(--space-3)', borderRadius: 'var(--border-radius-full)', fontSize: 'var(--text-xs)', fontWeight: 500 }}>Interview {videos?.interview?.length || 0}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                        {videos.tutorials && videos.tutorials.length > 0 ? (
                            videos.tutorials.slice(0, 6).map((video, i) => (
                                <a
                                    key={i}
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{ 
                                        padding: 'var(--space-4)', 
                                        background: 'var(--color-white)', 
                                        borderRadius: 'var(--border-radius-lg)', 
                                        border: '1px solid var(--color-neutral-200)', 
                                        minHeight: '120px', 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        justifyContent: 'space-between', 
                                        transition: 'all 0.2s' 
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Tutorial
                                            </span>
                                            <PlayCircle size={16} color="var(--color-primary-500)" />
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)', lineHeight: 1.4 }}>{video.title}</h4>
                                        <p style={{ margin: 'var(--space-1) 0 0 0', color: 'var(--color-neutral-400)', fontSize: 'var(--text-xs)' }}>Open on YouTube</p>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--space-8)', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed var(--color-neutral-200)', color: 'var(--color-neutral-400)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                                No tutorials found.
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', md: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-neutral-100)' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Resume Tips</h3>
                            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                {videos.resume && videos.resume.length > 0 ? (
                                    videos.resume.slice(0, 2).map((url, i) => {
                                        const vidId = extractVideoId(url);
                                        if (!vidId) return null;
                                        return (
                                            <div key={i} style={{ borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${vidId}`}
                                                    title="Resume video"
                                                    allowFullScreen
                                                    style={{ width: '100%', height: '180px', border: 'none' }}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-white)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-neutral-400)', textAlign: 'center', fontSize: 'var(--text-xs)' }}>
                                        Resume tips unavailable.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-neutral-100)' }}>
                            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Interview Prep</h3>
                            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                {videos.interview && videos.interview.length > 0 ? (
                                    videos.interview.slice(0, 2).map((url, i) => {
                                        const vidId = extractVideoId(url);
                                        if (!vidId) return null;
                                        return (
                                            <div key={i} style={{ borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--color-neutral-200)' }}>
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${vidId}`}
                                                    title="Interview video"
                                                    allowFullScreen
                                                    style={{ width: '100%', height: '180px', border: 'none' }}
                                                />
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: 'var(--space-4)', background: 'var(--color-white)', borderRadius: 'var(--border-radius-md)', color: 'var(--color-neutral-400)', textAlign: 'center', fontSize: 'var(--text-xs)' }}>
                                        Interview videos unavailable.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ 
                        marginTop: 'var(--space-8)', 
                        marginBottom: 'var(--space-16)', 
                        padding: 'var(--space-8)', 
                        maxWidth: '700px', 
                        marginLeft: 'auto', 
                        marginRight: 'auto',
                        border: '1px solid var(--color-neutral-200)',
                        borderRadius: 'var(--border-radius-lg)',
                        background: 'var(--color-white)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
                        <div>
                            <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: 'var(--space-1)' }}>Rate Your Experience</h3>
                            <p style={{ color: 'var(--color-neutral-500)', margin: 0, fontSize: 'var(--text-sm)' }}>Help us improve our recommendations.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-primary-50)', width: '56px', height: '56px', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-primary-100)' }}>
                            <Star size={24} color="var(--color-primary-600)" fill="var(--color-primary-600)" />
                        </div>
                    </div>

                    {feedbackSent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ 
                                padding: 'var(--space-6)', 
                                background: 'var(--color-success-50)', 
                                borderRadius: 'var(--border-radius-lg)', 
                                border: '1px solid var(--color-success-100)', 
                                textAlign: 'center' 
                            }}
                        >
                            <h4 style={{ color: 'var(--color-success-700)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-1)' }}>Feedback Submitted!</h4>
                            <p style={{ color: 'var(--color-success-600)', margin: 0, fontSize: 'var(--text-sm)' }}>Thanks for your input.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                            <div style={{ padding: 'var(--space-6)', background: 'var(--color-neutral-50)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-neutral-100)' }}>
                                <p style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral-400)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>
                                    Overall Rating
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 'var(--space-1)' }}
                                            >
                                                <Star
                                                    size={32}
                                                    color={(hoverRating || rating) >= star ? 'var(--color-primary-500)' : 'var(--color-neutral-300)'}
                                                    fill={(hoverRating || rating) >= star ? 'var(--color-primary-500)' : 'transparent'}
                                                    style={{ transition: 'all 0.2s' }}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    <span style={{ 
                                        background: 'var(--color-primary-100)', 
                                        color: 'var(--color-primary-700)', 
                                        padding: 'var(--space-1) var(--space-3)', 
                                        borderRadius: 'var(--border-radius-full)',
                                        fontSize: 'var(--text-xs)',
                                        fontWeight: 600
                                    }}>
                                        {rating === 5 ? 'Excellent' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', color: 'var(--color-neutral-400)', fontWeight: 600 }}>
                                    Comments
                                </label>
                                <textarea
                                    name="comments"
                                    rows="4"
                                    placeholder="What should we improve?"
                                    required
                                    style={{ 
                                        width: '100%', 
                                        padding: 'var(--space-4)',
                                        border: '1px solid var(--color-neutral-200)',
                                        borderRadius: 'var(--border-radius-md)',
                                        background: 'var(--color-white)',
                                        fontSize: 'var(--text-sm)',
                                        minHeight: '120px',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                                style={{ width: '100%', height: '56px' }}
                            >
                                {loading ? (
                                    'Submitting...'
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Submit Feedback
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ResultsDisplay;
