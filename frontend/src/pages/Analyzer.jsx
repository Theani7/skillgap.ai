import React, { useState, useRef } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Sparkles, Briefcase } from 'lucide-react';
import ResultsDisplay from '../components/ResultsDisplay';
import { useAuth } from '../context/AuthContext';

const Analyzer = () => {
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
            const response = await api.post('/api/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
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
        <div style={{ 
            minHeight: 'calc(100vh - 200px)', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12) var(--space-4)',
            background: 'var(--color-neutral-50)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', maxWidth: '800px' }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                    <h1 style={{
                        fontSize: 'var(--font-size-5xl)',
                        fontWeight: 'var(--font-weight-extrabold)',
                        letterSpacing: 'var(--letter-spacing-tight)',
                        color: 'var(--color-neutral-900)',
                        marginBottom: 'var(--space-4)'
                    }}>
                        Resume Intelligence
                    </h1>
                    <p style={{
                        fontSize: 'var(--font-size-lg)',
                        color: 'var(--color-neutral-500)',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: 'var(--line-height-relaxed)'
                    }}>
                        Upload your resume and let our AI identify skill gaps and recommend personalized learning paths.
                    </p>
                </div>

                {/* Canvas Area */}
                <div style={{
                    background: 'white',
                    borderRadius: 'var(--border-radius-2xl)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--color-neutral-200)',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: '450px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Progress Bar */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '4px',
                                    background: 'var(--color-primary-100)',
                                    zIndex: 10,
                                    overflow: 'hidden'
                                }}
                            >
                                <motion.div
                                    animate={{ 
                                        x: ['-100%', '100%'],
                                    }}
                                    transition={{ 
                                        repeat: Infinity, 
                                        duration: 1.5, 
                                        ease: "linear" 
                                    }}
                                    style={{
                                        position: 'absolute',
                                        width: '40%',
                                        height: '100%',
                                        background: 'var(--color-primary-500)'
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div style={{ padding: 'var(--space-12)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <AnimatePresence mode="wait">
                            {!loading ? (
                                <motion.div
                                    key="upload-ui"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Target Role Selector */}
                                    <div style={{ marginBottom: 'var(--space-8)' }}>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-2)',
                                            color: 'var(--color-neutral-700)',
                                            marginBottom: 'var(--space-3)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-semibold)'
                                        }}>
                                            <Briefcase size={16} />
                                            What's your target role?
                                        </label>

                                        <select
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: 'var(--space-3) var(--space-4)',
                                                borderRadius: 'var(--border-radius-lg)',
                                                border: '1px solid var(--color-neutral-200)',
                                                fontSize: 'var(--font-size-base)',
                                                background: 'var(--color-neutral-50)',
                                                cursor: 'pointer',
                                                transition: 'var(--transition-duration-normal)',
                                                outline: 'none',
                                                appearance: 'none',
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 12px center',
                                                backgroundSize: '16px'
                                            }}
                                        >
                                            {targetRoles.map(role => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Drop Zone */}
                                    <div 
                                      className="dropzone" 
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={handleDrop}
                                      onClick={() => fileInputRef.current.click()}
                                      style={{
                                        border: `2px dashed ${isDragOver ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                                        borderRadius: 'var(--border-radius-lg)',
                                        padding: 'var(--space-12)',
                                        textAlign: 'center',
                                        background: isDragOver ? 'var(--color-primary-50)' : 'transparent',
                                        transition: 'var(--transition-duration-normal)',
                                        cursor: 'pointer',
                                        marginBottom: 'var(--space-8)'
                                      }}
                                    >
                                      <UploadCloud size={40} color="var(--color-primary-600)" style={{ margin: '0 auto var(--space-4)' }} />
                                      <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'bold' }}>
                                        {file ? file.name : 'Click or drag your resume here'}
                                      </h3>
                                      <p style={{ color: 'var(--color-neutral-500)' }}>
                                        PDF or DOCX accepted
                                      </p>
                                    </div>

                                    <input
                                        type="file"
                                        accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />

                                    {/* Error Message */}
                                    {error && (
                                        <div style={{
                                            color: 'var(--color-error-600)',
                                            marginBottom: 'var(--space-6)',
                                            textAlign: 'center',
                                            background: 'var(--color-error-50)',
                                            padding: 'var(--space-3)',
                                            borderRadius: 'var(--border-radius-lg)',
                                            fontSize: 'var(--font-size-sm)',
                                            fontWeight: 'var(--font-weight-medium)'
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    {/* Analyze Button */}
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={!file}
                                        style={{
                                            width: '100%',
                                            padding: 'var(--space-4)',
                                            background: file ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 'var(--border-radius-lg)',
                                            fontWeight: 'var(--font-weight-bold)',
                                            fontSize: 'var(--font-size-lg)',
                                            cursor: file ? 'pointer' : 'not-allowed',
                                            transition: 'var(--transition-duration-normal)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 'var(--space-2)'
                                        }}
                                    >
                                        <Sparkles size={20} />
                                        Analyze My Resume
                                    </button>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Analyzer;
