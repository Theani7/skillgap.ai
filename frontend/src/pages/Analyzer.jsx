import React, { useState, useRef } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, Sparkles, Briefcase, Loader2 } from 'lucide-react';
import ResultsDisplay from '../components/ResultsDisplay';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState('Data Science');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);
    const { user } = useAuth();

    const targetRoles = [
        'Data Science',
        'Web Development',
        'Android Development',
        'IOS Development',
        'UI/UX Design',
        'Quality Assurance',
        'DevOps',
        'Cloud Engineering',
        'Data Engineering',
        'Machine Learning',
        'Cybersecurity',
        'Product Management',
        'Business Analysis',
        'Frontend Development',
        'Backend Development',
        'Full Stack Development',
        'Mobile Development',
        'Cloud Architecture',
        'Software Engineering',
        'Technical Writing',
        'IT Support',
        'Network Administration'
    ];

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        validateAndSetFile(selected);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const selected = e.dataTransfer.files[0];
        validateAndSetFile(selected);
    };

    const validateAndSetFile = (selected) => {
        if (selected && (selected.type === 'application/pdf' || selected.name.endsWith('.docx'))) {
            setFile(selected);
            setError('');
        } else {
            setError('Please upload a valid PDF or DOCX file.');
            setFile(null);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('target_role', targetRole);

        try {
            const headers = { 'Content-Type': 'multipart/form-data' };
            if (user?.token) {
                headers['Authorization'] = `Bearer ${user.token}`;
            }

            const response = await api.post('/api/analyze', formData, { headers });
            setResults(response.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'An error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };

    if (results) {
        return <ResultsDisplay data={results} onReset={() => { setResults(null); setFile(null); }} />;
    }

    return (
        <div className="clay-section" style={{ minHeight: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ width: '100%' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    style={{ maxWidth: '800px', margin: '0 auto' }}
                >
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="clay-badge clay-badge-primary"
                            style={{ marginBottom: 'var(--spacing-md)', display: 'inline-flex' }}
                        >
                            <Sparkles size={14} />
                            AI-Driven Analysis
                        </motion.span>

                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            lineHeight: '1.1',
                            fontWeight: 900,
                            marginBottom: 'var(--spacing-md)',
                            letterSpacing: '-0.02em'
                        }}>
                            Analyze Your Resume
                        </h1>

                        <p style={{
                            color: 'var(--clay-muted)',
                            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                            maxWidth: '550px',
                            margin: '0 auto',
                            fontWeight: 500,
                            lineHeight: 1.7
                        }}>
                            Upload your resume and let our AI identify skill gaps and recommend personalized learning paths.
                        </p>
                    </div>

                    {/* Upload Zone */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className={`clay-upload ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        style={{ marginBottom: 'var(--spacing-xl)' }}
                    >
                        <div className={`clay-icon ${file ? 'clay-icon-green' : 'clay-icon-purple'}`} style={{ margin: '0 auto var(--spacing-md)' }}>
                            {file ? <CheckCircle2 size={28} /> : <UploadCloud size={28} />}
                        </div>

                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            marginBottom: 'var(--spacing-xs)',
                            fontFamily: 'var(--font-display)'
                        }}>
                            {file ? 'Resume Ready' : 'Upload Your Resume'}
                        </h3>

                        <p style={{
                            color: 'var(--clay-muted)',
                            margin: 0,
                            fontSize: '1rem'
                        }}>
                            {file ? (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 'var(--spacing-sm)',
                                    color: 'var(--clay-success)',
                                    fontWeight: 600
                                }}>
                                    <FileText size={18} />
                                    {file.name}
                                </span>
                            ) : 'Drag & drop or click to browse (PDF, DOCX)'}
                        </p>

                        <input
                            type="file"
                            accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                    </motion.div>

                    {/* Target Role Selector */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}
                    >
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 'var(--spacing-sm)',
                            color: 'var(--clay-foreground)',
                            marginBottom: 'var(--spacing-sm)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-display)'
                        }}>
                            <Briefcase size={18} />
                            Target Role
                        </label>

                        <select
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="clay-input"
                            style={{
                                maxWidth: '320px',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23635F69' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 16px center',
                                backgroundSize: '20px',
                                paddingRight: '48px'
                            }}
                        >
                            {targetRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                color: '#DC2626',
                                marginBottom: 'var(--spacing-md)',
                                textAlign: 'center',
                                background: 'rgba(220, 38, 38, 0.08)',
                                padding: 'var(--spacing-sm) var(--spacing-md)',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 500
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Analyze Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        style={{ textAlign: 'center' }}
                    >
                        {loading ? (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)'
                            }}>
                                <div className="clay-spinner" />
                                <p style={{
                                    color: 'var(--clay-accent)',
                                    fontWeight: 700,
                                    fontFamily: 'var(--font-display)',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}>
                                    Analyzing Resume...
                                </p>
                            </div>
                        ) : (
                            <button
                                className="clay-btn clay-btn-primary shadow-clay-button clay-btn-lg"
                                onClick={handleAnalyze}
                                disabled={!file}
                                style={{ opacity: file ? 1 : 0.5 }}
                            >
                                {file ? (
                                    <>
                                        <Sparkles size={20} />
                                        Analyze My Resume
                                    </>
                                ) : (
                                    'Upload Resume First'
                                )}
                            </button>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
