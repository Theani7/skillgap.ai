import React, { useState, useEffect } from 'react';
import { RefreshCcw, User, Mail, Phone, FileDigit, Briefcase, GraduationCap, PlayCircle, Lightbulb, Star, Send, RotateCw, Target, Award, BookOpen, TrendingUp } from 'lucide-react';
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

    useEffect(() => {
        const fetchScraperStatus = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/trends/status');
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

            const res = await fetch('http://localhost:8000/api/feedback', {
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
            className="clay-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ paddingTop: 'var(--spacing-xl)' }}
        >
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                        <div className="clay-icon clay-icon-purple">
                            <FileDigit size={24} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                                Analysis Complete
                            </h2>
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>Your personalized roadmap is ready</p>
                        </div>
                    </div>
                    <button
                        className="clay-btn clay-btn-secondary shadow-clay-button"
                        onClick={onReset}
                        style={{ gap: 'var(--spacing-sm)' }}
                    >
                        <RefreshCcw size={18} />
                        Analyze Another
                    </button>
                </motion.div>

                <motion.div
                    className="clay-card shadow-clay-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 'var(--spacing-xl)' }}>
                        <div>
                            <h3 style={{ borderBottom: '2px solid rgba(124, 58, 237, 0.1)', paddingBottom: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '1.1rem' }}>
                                <div className="clay-icon clay-icon-blue" style={{ width: '40px', height: '40px' }}>
                                    <User size={18} />
                                </div>
                                Basic Details
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--clay-muted)', fontWeight: 600 }}>Name</span>
                                    <span style={{ color: 'var(--clay-foreground)', fontWeight: 700 }}>{resumeInfo.name || 'Not Found'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--clay-muted)', fontWeight: 600 }}>Email</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--clay-foreground)' }}>
                                        <Mail size={14} color="var(--clay-muted)" />
                                        {resumeInfo.email || 'Not Found'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--clay-muted)', fontWeight: 600 }}>Mobile</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)', color: 'var(--clay-foreground)' }}>
                                        <Phone size={14} color="var(--clay-muted)" />
                                        {resumeInfo.mobile_number || 'Not Found'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--clay-muted)', fontWeight: 600 }}>Pages</span>
                                    <span style={{ color: 'var(--clay-foreground)', fontWeight: 700 }}>{resumeInfo.no_of_pages}</span>
                                </div>
                            </div>

                            <h3 style={{ marginTop: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '1.1rem' }}>
                                <div className="clay-icon clay-icon-pink" style={{ width: '40px', height: '40px' }}>
                                    <Briefcase size={18} />
                                </div>
                                Field Analysis
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--clay-muted)', fontWeight: 600 }}>Target Role</span>
                                    <span className="clay-badge clay-badge-primary">{target_role || 'Not Specified'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)' }}>
                                    <span style={{ color: 'var(--clay-muted)', fontWeight: 600 }}>Predicted</span>
                                    <span style={{ fontWeight: 700, color: 'var(--clay-accent)' }}>{predicted_field}</span>
                                </div>
                            </div>

                            <h3 style={{ marginTop: 'var(--spacing-xl)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '1.1rem' }}>
                                <div className="clay-icon clay-icon-green" style={{ width: '40px', height: '40px' }}>
                                    <Star size={18} />
                                </div>
                                Skills Detected
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                {resumeInfo.skills && resumeInfo.skills.length > 0 ? (
                                    resumeInfo.skills.slice(0, 12).map((s, i) => (
                                        <span key={i} className="clay-badge clay-badge-primary">{s}</span>
                                    ))
                                ) : (
                                    <span style={{ color: 'var(--clay-muted)' }}>No skills detected.</span>
                                )}
                            </div>
                        </div>

                        <div style={{ borderLeft: { md: '2px solid rgba(124, 58, 237, 0.1)' }, paddingLeft: { md: 'var(--spacing-xl)' }, marginLeft: { md: 0 } }}>
                            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 'var(--spacing-xl)', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-md)', fontSize: '0.85rem', fontWeight: 700 }}>Resume Score</p>
                                    <AnimatedScore score={resume_score} />
                                </div>
                                {target_role && (
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-md)', fontSize: '0.85rem', fontWeight: 700 }}>Role Match</p>
                                        <AnimatedScore score={match_score || 0} />
                                    </div>
                                )}
                            </div>

                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', fontSize: '1.1rem', marginBottom: 'var(--spacing-md)', borderBottom: '2px solid rgba(124, 58, 237, 0.1)', paddingBottom: 'var(--spacing-sm)' }}>
                                <div className="clay-icon clay-icon-amber" style={{ width: '40px', height: '40px' }}>
                                    <Lightbulb size={18} />
                                </div>
                                AI Suggestions
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                {feedback.map((f, i) => (
                                    <li key={i} style={{ padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(245, 158, 11, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--clay-foreground)', fontSize: '0.95rem' }}>
                                        {f}
                                    </li>
                                ))}
                                {feedback.length === 0 && (
                                    <li style={{ padding: 'var(--spacing-sm) var(--spacing-md)', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-md)', color: 'var(--clay-success)', fontWeight: 600 }}>
                                        Great job! Your resume hits all the key points.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
                    <motion.div
                        className="clay-card shadow-clay-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', margin: 0, fontSize: '1.2rem' }}>
                                <div className="clay-icon clay-icon-pink" style={{ width: '44px', height: '44px' }}>
                                    <Target size={20} />
                                </div>
                                Skills Analysis
                            </h3>
                            {scraperStatus && (
                                <div className="clay-badge" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--clay-accent-tertiary)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                    <RotateCw size={12} />
                                    Scraped: {scraperStatus.split(' ')[0]}
                                </div>
                            )}
                        </div>

                        {missing_skills && missing_skills.length > 0 && (
                            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <p style={{ color: 'var(--clay-accent)', marginBottom: 'var(--spacing-sm)', fontWeight: 700, fontSize: '0.95rem' }}>Missing Skills for {target_role}:</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                                    {missing_skills.map((ms, i) => (
                                        <a
                                            key={i}
                                            href={ms.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <span className="clay-badge" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--clay-accent-tertiary)', border: '1px solid rgba(14, 165, 233, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {ms.title?.replace('Learn ', '')} <PlayCircle size={12} />
                                            </span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p style={{ color: 'var(--clay-muted)', marginBottom: 'var(--spacing-sm)', fontSize: '0.9rem' }}>Recommended {predicted_field} Skills:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                            {recommended_skills.map((s, i) => (
                                <span key={i} className="clay-badge clay-badge-primary">{s}</span>
                            ))}
                            {recommended_skills.length === 0 && <span style={{ color: 'var(--clay-muted)' }}>No recommendations available.</span>}
                        </div>
                    </motion.div>

                    <motion.div
                        className="clay-card shadow-clay-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', fontSize: '1.2rem' }}>
                            <div className="clay-icon clay-icon-purple" style={{ width: '44px', height: '44px' }}>
                                <GraduationCap size={20} />
                            </div>
                            Recommended Courses
                        </h3>
                        <p style={{ color: 'var(--clay-muted)', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>Curated learning path for {target_role || predicted_field}.</p>
                        <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: 'var(--spacing-sm)' }}>
                            {missing_skills && missing_skills.length > 0 && (
                                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                    <p style={{ color: 'var(--clay-accent-tertiary)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)', paddingBottom: '4px', borderBottom: '1px solid rgba(14, 165, 233, 0.2)' }}>
                                        Priority: Missing Skill Courses
                                    </p>
                                    {missing_skills.map((ms, i) => (
                                        <div key={'ms' + i} style={{ padding: 'var(--spacing-sm)', background: 'rgba(14, 165, 233, 0.05)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-sm)', borderLeft: '3px solid var(--clay-accent-tertiary)' }}>
                                            <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.95rem' }}>{ms.title}</h4>
                                            <a href={ms.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay-accent)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                Start Learning <PlayCircle size={12} />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <p style={{ color: 'var(--clay-accent)', fontWeight: 700, fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)', paddingBottom: '4px', borderBottom: '1px solid rgba(124, 58, 237, 0.2)' }}>
                                General {predicted_field} Courses
                            </p>
                            {recommended_courses.map((c, i) => (
                                <div key={i} style={{ padding: 'var(--spacing-sm)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-sm)' }}>
                                    <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.95rem' }}>{c[0]}</h4>
                                    <a href={c[1]} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay-accent)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        View Course <PlayCircle size={12} />
                                    </a>
                                </div>
                            ))}
                            {recommended_courses.length === 0 && <span style={{ color: 'var(--clay-muted)' }}>No courses for this field yet.</span>}
                        </div>
                    </motion.div>
                </div>

                <TrendDashboard trends={trends} field={predicted_field} />

                {score_breakdown && (
                    <motion.div
                        className="clay-card shadow-clay-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', fontSize: '1.2rem' }}>
                            <div className="clay-icon clay-icon-green" style={{ width: '44px', height: '44px' }}>
                                <Award size={20} />
                            </div>
                            Score Breakdown
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(5, 1fr)' }, gap: 'var(--spacing-md)' }}>
                            {Object.entries(score_breakdown).map(([key, value]) => (
                                <div key={key} style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
                                        <strong style={{ textTransform: 'capitalize', fontSize: '0.9rem' }}>{key.replaceAll('_', ' ')}</strong>
                                        <span style={{ fontWeight: 800, color: 'var(--clay-accent)' }}>{value.score}/{value.weight}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: value.status === 'present' ? 'var(--clay-success)' : 'var(--clay-muted)' }}>
                                        {value.status === 'present' ? 'Complete' : 'Missing'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {job_matches && job_matches.length > 0 && (
                    <motion.div
                        className="clay-card shadow-clay-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}
                    >
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', fontSize: '1.2rem' }}>
                            <div className="clay-icon clay-icon-blue" style={{ width: '44px', height: '44px' }}>
                                <TrendingUp size={20} />
                            </div>
                            Recommended Jobs
                        </h3>
                        <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                            {job_matches.slice(0, 6).map((job) => (
                                <div key={job.job_id} style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '1rem' }}>{job.title}</h4>
                                        <p style={{ margin: 0, color: 'var(--clay-muted)', fontSize: '0.9rem' }}>{job.company} · {job.location} · {job.workplace_type}</p>
                                    </div>
                                    <span className="clay-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clay-success)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                        {job.fit_score}% Match
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                <Roadmap path={roadmap} />

                <motion.div
                    className="clay-card shadow-clay-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    style={{ marginTop: 'var(--spacing-xl)', padding: 'var(--spacing-xl)' }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        <div>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)', fontSize: '1.3rem' }}>
                                <div className="clay-icon clay-icon-purple" style={{ width: '44px', height: '44px' }}>
                                    <BookOpen size={20} />
                                </div>
                                Learning Resources
                            </h2>
                            <p style={{ margin: 0, color: 'var(--clay-muted)' }}>Curated tutorials for your skill gaps.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                            <span className="clay-badge clay-badge-primary">Tutorials {videos?.tutorials?.length || 0}</span>
                            <span className="clay-badge clay-badge-success">Resume {videos?.resume?.length || 0}</span>
                            <span className="clay-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--clay-warning)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>Interview {videos?.interview?.length || 0}</span>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                        {videos.tutorials && videos.tutorials.length > 0 ? (
                            videos.tutorials.slice(0, 6).map((video, i) => (
                                <a
                                    key={i}
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.1)', minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--clay-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                Tutorial
                                            </span>
                                            <PlayCircle size={16} color="var(--clay-accent)" />
                                        </div>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--clay-foreground)', lineHeight: 1.4 }}>{video.title}</h4>
                                        <p style={{ margin: 'var(--spacing-xs) 0 0 0', color: 'var(--clay-muted)', fontSize: '0.8rem' }}>Open on YouTube</p>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <div style={{ padding: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-lg)', border: '2px dashed rgba(124, 58, 237, 0.2)', color: 'var(--clay-muted)', textAlign: 'center' }}>
                                No tutorials found.
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 'var(--spacing-md)' }}>
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Resume Tips</h3>
                            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                                {videos.resume && videos.resume.length > 0 ? (
                                    videos.resume.slice(0, 2).map((url, i) => {
                                        const vidId = url.split('youtu.be/')[1] || url.split('v=')[1];
                                        return (
                                            <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
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
                                    <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', color: 'var(--clay-muted)', textAlign: 'center' }}>
                                        Resume tips unavailable.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1rem' }}>Interview Prep</h3>
                            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                                {videos.interview && videos.interview.length > 0 ? (
                                    videos.interview.slice(0, 2).map((url, i) => {
                                        const vidId = url.split('youtu.be/')[1] || url.split('v=')[1];
                                        return (
                                            <div key={i} style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
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
                                    <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.5)', borderRadius: 'var(--radius-md)', color: 'var(--clay-muted)', textAlign: 'center' }}>
                                        Interview videos unavailable.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="clay-card shadow-clay-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    style={{ marginTop: 'var(--spacing-xl)', marginBottom: 'var(--spacing-2xl)', padding: 'var(--spacing-xl)', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
                        <div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: 'var(--spacing-xs)' }}>Rate Your Experience</h3>
                            <p style={{ color: 'var(--clay-muted)', margin: 0, fontSize: '0.9rem' }}>Help us improve our recommendations.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(124, 58, 237, 0.08))', width: '56px', height: '56px', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.2)' }}>
                            <Star size={24} color="var(--clay-accent)" fill="var(--clay-accent)" />
                        </div>
                    </div>

                    {feedbackSent ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ padding: 'var(--spacing-lg)', background: 'rgba(16, 185, 129, 0.08)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}
                        >
                            <h4 style={{ color: 'var(--clay-success)', fontSize: '1.1rem', marginBottom: 'var(--spacing-xs)' }}>Feedback Submitted!</h4>
                            <p style={{ color: 'var(--clay-success)', margin: 0 }}>Thanks for your input.</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div style={{ padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(124, 58, 237, 0.1)' }}>
                                <p style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--clay-muted)', marginBottom: 'var(--spacing-md)', fontWeight: 700 }}>
                                    Overall Rating
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                type="button"
                                                whileHover={{ scale: 1.15 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                                            >
                                                <Star
                                                    size={32}
                                                    color={(hoverRating || rating) >= star ? 'var(--clay-accent)' : 'var(--clay-muted)'}
                                                    fill={(hoverRating || rating) >= star ? 'var(--clay-accent)' : 'transparent'}
                                                    style={{ transition: 'all 0.2s' }}
                                                />
                                            </motion.button>
                                        ))}
                                    </div>
                                    <span className="clay-badge clay-badge-primary">
                                        {rating === 5 ? 'Excellent' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--spacing-sm)', color: 'var(--clay-muted)', fontWeight: 700 }}>
                                    Comments
                                </label>
                                <textarea
                                    name="comments"
                                    rows="4"
                                    placeholder="What should we improve?"
                                    required
                                    className="clay-input clay-textarea"
                                    style={{ width: '100%', height: 'auto', minHeight: '120px' }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="clay-btn clay-btn-primary shadow-clay-button"
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
