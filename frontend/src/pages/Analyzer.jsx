import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Sparkles, Briefcase, FileText, X, CheckCircle2, Clock, Zap,
} from 'lucide-react';

const defaultRoles = [
  'Software Engineering', 'Frontend Development', 'Backend Development',
  'Data Science', 'DevOps', 'Mobile Development', 'Full Stack Development',
  'Cybersecurity',
];

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Analyzer = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [targetRoles, setTargetRoles] = useState(defaultRoles);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/api/job-roles');
        if (res.data?.roles?.length > 0) {
          setTargetRoles(res.data.roles);
        }
      } catch {
        // use defaults
      }
    };
    fetchRoles();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const validateAndSetFile = (selected) => {
    if (!selected) return;
    if (selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf') ||
        selected.name.toLowerCase().endsWith('.docx')) {
      setFile(selected);
      setError('');
    } else {
      setError('Please upload a valid PDF or DOCX file.');
      setFile(null);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_role', targetRole);
    try {
      await api.post('/api/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The result is now persisted in user_data.analysis_data.
      // Hand off to the persistent analysis page (loads from DB, no Gemini call).
      navigate('/analysis', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--color-bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background glow */}
      <div style={{
        position: 'absolute', top: '-160px', right: '-160px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.06, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-200px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.05, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '720px', margin: '0 auto' }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 12px', borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
              color: 'var(--color-primary)', background: 'var(--indigo-50)',
              border: '1px solid var(--indigo-100)',
              marginBottom: '20px',
            }}>
              <Sparkles size={11} />
              AI-Powered Analysis
            </div>
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 'var(--font-extrabold)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--color-text)',
              marginBottom: '12px',
            }}>
              Resume Intelligence
            </h1>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              maxWidth: '480px',
              margin: '0 auto',
            }}>
              Upload your resume and let our AI identify skill gaps and recommend a personalized learning path.
            </p>
          </div>

          {/* Steps indicator */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px',
          }}>
            {['Upload', 'Analyze', 'Get Roadmap'].map((step, i) => (
              <div key={step} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                color: i === 0 ? 'var(--color-text)' : 'var(--color-text-light)',
              }}>
                <span style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: i === 0 ? 'var(--color-primary)' : 'var(--color-border)',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700,
                }}>
                  {i + 1}
                </span>
                <span>{step}</span>
                {i < 2 && (
                  <span style={{
                    width: '24px', height: '1px',
                    background: 'var(--color-border)',
                    marginLeft: '6px',
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Main card */}
          <div className="card" style={{ overflow: 'hidden', position: 'relative' }}>
            {/* Loading bar */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '100%',
                    height: '3px', background: 'var(--indigo-100)',
                    overflow: 'hidden', zIndex: 10,
                  }}
                >
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    style={{
                      position: 'absolute', height: '100%', width: '40%',
                      background: 'var(--color-primary)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ padding: '32px' }}>
              <AnimatePresence mode="wait">
                {!loading ? (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Target role */}
                    <div style={{ marginBottom: '24px' }}>
                      <label className="label" style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <Briefcase size={14} />
                        Target role
                      </label>
                      <select
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text)',
                          background: 'var(--color-surface)',
                          outline: 'none',
                          transition: 'border-color 150ms ease',
                          height: '44px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 12px center',
                          paddingRight: '40px',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                      >
                        {targetRoles.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </div>

                    {/* Drop zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !file && fileInputRef.current?.click()}
                      style={{
                        borderRadius: 'var(--radius-xl)',
                        padding: file ? '20px' : '48px 24px',
                        textAlign: 'center',
                        cursor: file ? 'default' : 'pointer',
                        transition: 'all 200ms ease',
                        border: `2px dashed ${
                          isDragOver ? 'var(--color-primary)' :
                          file ? 'var(--color-success)' : 'var(--color-border)'
                        }`,
                        background: isDragOver ? 'var(--indigo-50)' :
                                    file ? 'var(--emerald-50)' : 'var(--color-bg)',
                        marginBottom: '20px',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {file ? (
                          <motion.div
                            key="file"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '14px',
                              textAlign: 'left',
                            }}
                          >
                            <div style={{
                              width: '44px', height: '44px', borderRadius: 'var(--radius-lg)',
                              background: 'var(--color-success)', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <FileText size={20} color="white" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{
                                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)',
                                color: 'var(--color-text)',
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              }}>
                                {file.name}
                              </div>
                              <div style={{
                                fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                                marginTop: '2px',
                                display: 'flex', alignItems: 'center', gap: '4px',
                              }}>
                                <CheckCircle2 size={12} color="var(--color-success)" />
                                {formatFileSize(file.size)} &middot; ready to analyze
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              style={{
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--color-text-muted)',
                                flexShrink: 0,
                              }}
                              title="Remove file"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <div style={{
                              width: '56px', height: '56px', borderRadius: 'var(--radius-xl)',
                              background: 'var(--indigo-50)', color: 'var(--color-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              margin: '0 auto 16px',
                              transition: 'transform 200ms ease',
                              transform: isDragOver ? 'scale(1.1)' : 'scale(1)',
                            }}>
                              <UploadCloud size={26} />
                            </div>
                            <h3 style={{
                              fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)',
                              color: 'var(--color-text)', marginBottom: '4px',
                            }}>
                              {isDragOver ? 'Drop your resume here' : 'Click or drag your resume'}
                            </h3>
                            <p style={{
                              fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                              margin: 0,
                            }}>
                              PDF or DOCX &middot; up to 10MB
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <input
                      type="file"
                      accept="application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />

                    {error && (
                      <div style={{
                        background: 'var(--color-error-light)',
                        color: 'var(--color-error)',
                        fontSize: '13px', fontWeight: 500,
                        padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                        marginBottom: '20px', textAlign: 'center',
                      }}>
                        {error}
                      </div>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={!file}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        width: '100%', height: '46px', padding: '0 20px',
                        borderRadius: 'var(--radius-lg)', border: 'none',
                        background: file ? 'var(--color-text)' : 'var(--color-border)',
                        color: file ? 'white' : 'var(--color-text-light)',
                        fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
                        cursor: file ? 'pointer' : 'not-allowed',
                        transition: 'background 150ms ease',
                      }}
                    >
                      <Zap size={16} />
                      Analyze My Resume
                    </button>

                    <p style={{
                      textAlign: 'center', fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-light)', margin: '16px 0 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                      <Clock size={11} />
                      Analysis usually takes 5&ndash;10 seconds
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      padding: '40px 0', textAlign: 'center',
                    }}
                  >
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '50%',
                      background: 'var(--indigo-50)', color: 'var(--color-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}>
                      <span style={{
                        width: '24px', height: '24px',
                        border: '3px solid var(--indigo-200)',
                        borderTopColor: 'var(--color-primary)',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.8s linear infinite',
                      }} />
                    </div>
                    <h3 style={{
                      fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text)', marginBottom: '4px',
                    }}>
                      Analyzing your resume
                    </h3>
                    <p style={{
                      fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                      margin: 0,
                    }}>
                      Parsing content, scoring skills, and matching against <strong>{targetRole}</strong>...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analyzer;
