import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FileText, Sparkles, Copy, Check, Download, Loader2, Building, Briefcase, User, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const CoverLetter = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    job_description: '',
    name: user?.full_name || '',
    email: user?.email || ''
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;
    
    setLoading(true);
    try {
      const res = await api.post('/api/cover-letter/generate', {
        company: formData.company,
        role: formData.role,
        job_description: formData.job_description,
        name: formData.name,
        email: formData.email
      });
      setCoverLetter(res.data.cover_letter || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${formData.company.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="clay-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: 'calc(100vh - 200px)' }}
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 'var(--spacing-xl)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div className="clay-icon clay-icon-purple" style={{ width: '52px', height: '52px' }}>
              <FileText size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 'var(--spacing-xs)', margin: 0 }}>
                Cover Letter Generator
              </h1>
              <p style={{ color: 'var(--clay-muted)', margin: 0 }}>
                AI-powered cover letter tailored to each application
              </p>
            </div>
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 'var(--spacing-xl)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="clay-card shadow-clay-card"
            style={{ padding: 'var(--spacing-xl)' }}
          >
            <h3 style={{ marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <Sparkles size={18} />
              Generate Cover Letter
            </h3>
            <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="clay-input"
                  placeholder="John Doe"
                  style={{ height: '48px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="clay-input"
                  placeholder="john@example.com"
                  style={{ height: '48px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="clay-input"
                  placeholder="e.g., Google, Amazon, Startup"
                  style={{ height: '48px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                  Target Role *
                </label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="clay-input"
                  placeholder="e.g., Software Engineer, Data Scientist"
                  style={{ height: '48px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>
                  Job Description (Optional)
                </label>
                <textarea
                  value={formData.job_description}
                  onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
                  className="clay-input"
                  rows={4}
                  placeholder="Paste the job description here for more tailored content..."
                  style={{ minHeight: '120px' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !formData.company || !formData.role}
                className="clay-btn clay-btn-primary shadow-clay-button"
                style={{ marginTop: 'var(--spacing-md)' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Cover Letter
                  </>
                )}
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="clay-card shadow-clay-card"
            style={{ padding: 'var(--spacing-xl)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <FileText size={18} />
                Generated Cover Letter
              </h3>
              {coverLetter && (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  <button
                    onClick={handleCopy}
                    className="clay-btn clay-btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="clay-btn clay-btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  >
                    <Download size={16} />
                    Save
                  </button>
                </div>
              )}
            </div>
            <div
              style={{
                flex: 1,
                background: 'var(--clay-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-lg)',
                whiteSpace: 'pre-wrap',
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--clay-foreground)',
                overflowY: 'auto',
                minHeight: '300px'
              }}
            >
              {coverLetter || (
                <div style={{ textAlign: 'center', color: 'var(--clay-muted)', padding: 'var(--spacing-xl)' }}>
                  <FileText size={48} style={{ opacity: 0.3, marginBottom: 'var(--spacing-md)' }} />
                  <p>Fill in the details and click generate to create your personalized cover letter.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default CoverLetter;