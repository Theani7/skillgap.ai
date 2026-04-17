import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Trash2, Edit2, Save, X, MapPin, Building, DollarSign, ExternalLink, CheckCircle, Clock, XCircle, AlertCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: '#7395c0', icon: Send },
  { value: 'interview', label: 'Interview', color: '#e17f34', icon: Clock },
  { value: 'offer', label: 'Offer', color: '#2d7a2d', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', color: '#c62828', icon: XCircle },
  { value: 'withdrawn', label: 'Withdrawn', color: '#7a7a7a', icon: AlertCircle }
];

const Jobs = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [filter, setFilter] = useState('all');

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'applied',
    location: '',
    salary: '',
    url: '',
    notes: ''
  });

  useEffect(() => {
    if (user && user.token) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/api/jobs/applications');
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await api.put(`/api/jobs/applications/${editingJob}`, formData);
      } else {
        await api.post('/api/jobs/applications', formData);
      }
      setFormData({ company: '', role: '', status: 'applied', location: '', salary: '', url: '', notes: '' });
      setShowForm(false);
      setEditingJob(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (app) => {
    setFormData({
      company: app.company,
      role: app.role,
      status: app.status,
      location: app.location || '',
      salary: app.salary || '',
      url: app.url || '',
      notes: app.notes || ''
    });
    setEditingJob(app.id);
    setShowForm(true);
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/api/jobs/applications/${appId}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await api.delete(`/api/jobs/applications/${id}`);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNew = () => {
    setFormData({ company: '', role: '', status: 'applied', location: '', salary: '', url: '', notes: '' });
    setEditingJob(null);
    setShowForm(true);
  };

  const filteredApps = applications.filter(app => filter === 'all' || app.status === filter);

  const getStatusInfo = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length
  };

  if (loading) {
    return (
      <div className="clay-loader" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="clay-spinner" style={{ width: '48px', height: '48px' }} />
        <p style={{ color: 'var(--clay-accent)', fontWeight: 700 }}>Loading...</p>
      </div>
    );
  }

  return (
    <motion.div className="clay-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div className="clay-icon clay-icon-purple" style={{ width: '52px', height: '52px' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: 0 }}>Job Applications</h1>
                <p style={{ color: 'var(--clay-muted)', margin: 0 }}>Track your job search</p>
              </div>
            </div>
            <button onClick={handleAddNew} className="clay-btn clay-btn-primary shadow-clay-button" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <Plus size={18} /> Add Application
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
          {[
            { label: 'Total', value: stats.total, color: 'var(--clay-accent)' },
            { label: 'Applied', value: stats.applied, color: '#7395c0' },
            { label: 'Interview', value: stats.interview, color: '#e17f34' },
            { label: 'Offers', value: stats.offer, color: '#2d7a2d' }
          ].map((stat, i) => (
            <div key={i} className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: stat.color, fontFamily: 'var(--font-display)' }}>{stat.value}</div>
              <div style={{ color: 'var(--clay-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}>
          {[{ value: 'all', label: 'All' }, ...STATUS_OPTIONS].map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} className={`clay-btn ${filter === opt.value ? 'clay-btn-primary' : 'clay-btn-secondary'}`} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>
              {opt.label}
            </button>
          ))}
        </motion.div>

        {filteredApps.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto var(--spacing-lg)', width: '64px', height: '64px' }}><Briefcase size={28} /></div>
            <h3>No Applications Yet</h3>
            <p style={{ color: 'var(--clay-muted)', marginBottom: 'var(--spacing-lg)' }}>Start tracking your job applications.</p>
            <button onClick={handleAddNew} className="clay-btn clay-btn-primary shadow-clay-button"><Plus size={18} /> Add Application</button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {[...filteredApps].reverse().map((app, i) => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <motion.div key={app.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{app.role}</h3>
                        {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay-accent)' }}><ExternalLink size={14} /></a>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--clay-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Building size={14} />{app.company}</span>
                        {app.location && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} />{app.location}</span>}
                        {app.salary && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={14} />{app.salary}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-lg)',
                          background: `${statusInfo.color}15`,
                          color: statusInfo.color,
                          fontWeight: 600,
                          border: `1px solid ${statusInfo.color}30`,
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} style={{ color: statusInfo.color }}>{opt.label}</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                        <button onClick={() => handleEdit(app)} className="clay-btn clay-btn-secondary" style={{ padding: '8px', height: 'auto' }}><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(app.id)} className="clay-btn clay-btn-secondary" style={{ padding: '8px', height: 'auto' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {showForm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(51, 47, 58, 0.6)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-lg)' }}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', background: 'var(--clay-cardBg)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-xl)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{editingJob ? 'Edit Application' : 'Add Application'}</h2>
                  <button onClick={() => { setShowForm(false); setEditingJob(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Company *</label>
                      <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="clay-input" style={{ height: '48px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Role *</label>
                      <input type="text" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="clay-input" style={{ height: '48px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="clay-input" style={{ height: '48px' }}>
                      {STATUS_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Location</label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="clay-input" style={{ height: '48px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Salary</label>
                      <input type="text" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="clay-input" placeholder="e.g., $80,000" style={{ height: '48px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Job URL</label>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="clay-input" style={{ height: '48px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Notes</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="clay-input" rows={3} style={{ minHeight: '80px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                    <button type="button" onClick={() => { setShowForm(false); setEditingJob(null); }} className="clay-btn clay-btn-secondary" style={{ flex: 1 }}>Cancel</button>
                    <button type="submit" className="clay-btn clay-btn-primary shadow-clay-button" style={{ flex: 1 }}><Save size={16} />{editingJob ? 'Update' : 'Save'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Jobs;