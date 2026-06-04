import React, { useState, useRef } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Sparkles, Briefcase } from 'lucide-react';
import ResultsDisplay from '../components/ResultsDisplay';

const Analyzer = () => {
    const [file, setFile] = useState(null);
    const [targetRole, setTargetRole] = useState('Data Science');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef(null);

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
        <div className="bg-secondary" style={{ 
            minHeight: 'calc(100vh - 200px)', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-12) var(--space-4)'
        }}>
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-3xl"
            >
                {/* Header */}
                <div className="text-center" style={{ marginBottom: 'var(--space-12)' }}>
                    <h1 className="text-5xl font-bold tracking-tight text-primary" style={{ marginBottom: 'var(--space-4)' }}>
                        Resume Intelligence
                    </h1>
                    <p className="text-lg text-tertiary mx-auto leading-relaxed" style={{ maxWidth: '600px' }}>
                        Upload your resume and let our AI identify skill gaps and recommend personalized learning paths.
                    </p>
                </div>

                {/* Canvas Area */}
                <div className="card overflow-hidden relative flex flex-col" style={{ minHeight: '450px' }}>
                    {/* Progress Bar */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute top-0 left-0 w-full z-10 overflow-hidden"
                                style={{ height: '4px', background: 'var(--color-primary-100)' }}
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
                                    className="absolute h-full bg-primary-600"
                                    style={{ width: '40%' }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="p-12 flex-1 flex flex-col">
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
                                        <label className="flex items-center text-sm font-semibold text-secondary" style={{ gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                            <Briefcase size={16} />
                                            What's your target role?
                                        </label>

                                        <select
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            className="input cursor-pointer"
                                            style={{
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
                                      className="dropzone rounded-lg p-12 text-center cursor-pointer" 
                                      onDragOver={handleDragOver}
                                      onDragLeave={handleDragLeave}
                                      onDrop={handleDrop}
                                      onClick={() => fileInputRef.current.click()}
                                      style={{
                                        border: `2px dashed ${isDragOver ? 'var(--color-primary-500)' : 'var(--color-neutral-200)'}`,
                                        background: isDragOver ? 'var(--color-primary-50)' : 'transparent',
                                        transition: 'var(--transition-duration-normal)',
                                        marginBottom: 'var(--space-8)'
                                      }}
                                    >
                                      <UploadCloud size={40} className="text-primary-600 mx-auto" style={{ marginBottom: 'var(--space-4)' }} />
                                      <h3 className="text-xl font-bold">
                                        {file ? file.name : 'Click or drag your resume here'}
                                      </h3>
                                      <p className="text-tertiary">
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
                                        <div className="text-error text-sm font-medium text-center rounded-lg" style={{
                                            marginBottom: 'var(--space-6)',
                                            background: 'var(--color-error-50)',
                                            padding: 'var(--space-3)'
                                        }}>
                                            {error}
                                        </div>
                                    )}

                                    {/* Analyze Button */}
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={!file}
                                        className={`btn w-full font-bold text-lg flex items-center justify-center gap-4 ${file ? 'btn-primary' : 'bg-tertiary cursor-not-allowed'}`}
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
