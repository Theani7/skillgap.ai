import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Plus, Trash2, Edit2, Save, X, MapPin, Building, Calendar, DollarSign, Search, Filter, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Send, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: '#7395c0', icon: Send },
  { value: 'interview', label: 'Interview', color: '#e17f34', icon: Clock },
  { value: 'offer', label: 'Offer', color: '#2d7a2d', icon: CheckCircle2 },
  { value: 'rejected', label: 'Rejected', color: '#c62828', icon: XCircle },
  { value: 'withdrawn', label: 'Withdrawn', color: '#7a7a7a', icon: X }
];

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'applied',
    location: '',
    salary: '',
    url: '',
    follow_up_date: '',
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
      if (editingId) {
        await api.put(`/api/jobs/applications/${editingId}`, formData);
      } else {
        await api.post('/api/jobs/applications', formData);
      }
      setFormData({ company: '', role: '', status: 'applied', location: '', salary: '', url: '', follow_up_date: '', notes: '' });
      setShowForm(false);
      setEditingId(null);
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
      follow_up_date: app.follow_up_date || '',
      notes: app.notes || ''
    });
    setEditingId(app.id);
    setShowForm(true);
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

  const getStatusInfo = (status) => STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

  const filteredApps = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = !search || 
      app.company?.toLowerCase().includes(search.toLowerCase()) ||
      app.role?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
        <p style={{ color: 'var(--clay-accent)', fontWeight: 700 }}>Loading Applications...</p>
      </div>
    );
  }

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <div className="clay-icon clay-icon-purple" style={{ width: '52px', height: '52px' }}>
                <Briefcase size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 'var(--spacing-xs)', margin: 0 }}>
                  Job Applications
                </h1>
                <p style={{ color: 'var(--clay-muted)', margin: 0 }}>
                  Track your job search progress
                </p>
              </div>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setFormData({ company: '', role: '', status: 'applied', location: '', salary: '', url: '', follow_up_date: '', notes: '' }); }}
              className="clay-btn clay-btn-primary shadow-clay-button"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
            >
              <Plus size={18} />
              Add Application
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}
        >
          {[
            { label: 'Total', value: stats.total, color: 'var(--clay-accent)' },
            { label: 'Applied', value: stats.apcent, color: '#7395c0' },
            { label: 'Interview', value: stats.interview, color: '#e17f34' },
            { label: 'Offers', value: stats.offer, color: '#2d7a2d' }
          ].map((stat, i) => (
            <div key={i} className="clay-card shadow-clay-card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 900, color: stat.color, fontFamily: 'var(--font-display)' }}>
                {stat.value}
              </div>
              <div style={{ color: 'var(--clay-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clay-muted)' }} />
            <input
              type="text"
              placeholder="Search companies or roles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="clay-input"
              style={{ paddingLeft: '48px', height: '48px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-xs)', flexWrap: 'wrap' }}>
            {[{ value: 'all', label: 'All' }, ...STATUS_OPTIONS].map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`clay-btn ${filter === opt.value ? 'clay-btn-primary' : 'clay-btn-secondary'}`}
                style={{ fontSize: '0.85rem', padding: '8px 16px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredApps.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="clay-card shadow-clay-card"
            style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}
          >
            <div className="clay-icon clay-icon-purple" style={{ margin: '0 auto var(--spacing-lg)', width: '64px', height: '64px' }}>
              <Briefcase size={28} />
            </div>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>No Applications Yet</h3>
            <p style={{ color: 'var(--clay-muted)', marginBottom: 'var(--spacing-lg)' }}>
              Start tracking your job applications to see them here.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="clay-btn clay-btn-primary shadow-clay-button"
            >
              <Plus size={18} />
              Add First Application
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {[...filteredApps].reverse().map((app, i) => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <motion.div
                  key={app.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="clay-card shadow-clay-card"
                  style={{ padding: 'var(--spacing-lg)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xs)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{app.role}</h3>
                        {app.url && (
                          <a href={app.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--clay-accent)' }}>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', color: 'var(--clay-muted)', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building size={14} />
                          {app.company}
                        </span>
                        {app.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={14} />
                            {app.location}
                          </span>
                        )}
                        {app.salary && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={14} />
                            {app.salary}
                          </span>
                        )}
                      </div>
                      {app.notes && (
                        <p style={{ margin: 'var(--spacing-sm) 0 0', color: 'var(--clay-muted)', fontSize: '0.9rem' }}>
                          {app.notes}
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-lg)',
                          background: `${statusInfo.color}15`,
                          color: statusInfo.color,
                          fontSize: '0.85rem',
                          fontWeight: 600
                        }}
                      >
                        <statusInfo.icon size={14} />
                        {statusInfo.label}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                        <button
                          onClick={() => handleEdit(app)}
                          className="clay-btn clay-btn-secondary"
                          style={{ padding: '8px', height: 'auto' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="clay-btn clay-btn-secondary"
                          style={{ padding: '8px', height: 'auto' }}
                        >
                          <Trash2 size={16} />
                        </button>
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
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(51, 47, 58, 0.6)',
                backdropFilter: 'blur(8px)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--spacing-lg)'
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  maxWidth: '500px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  borderRadius: 'var(--radius-2xl)',
                  background: 'var(--clay-cardBg)',
                  padding: 'var(--spacing-xl)',
                  boxShadow: 'var(--shadow-xl)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                    {editingId ? 'Edit Application' : 'Add Application'}
                  </h2>
                  <button
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Company *</label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="clay-input"
                        style={{ height: '48px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Role *</label>
                      <input
                        type="text"
                        required
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="clay-input"
                        style={{ height: '48px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="clay-input"
                      style={{ height: '48px' }}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="clay-input"
                        style={{ height: '48px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Salary</label>
                      <input
                        type="text"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                        className="clay-input"
                        placeholder="e.g., $80,000 - $100,000"
                        style={{ height: '48px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Job URL</label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="clay-input"
                      style={{ height: '48px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Follow-up Date</label>
                    <input
                      type="date"
                      value={formData.follow_up_date}
                      onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                      className="clay-input"
                      style={{ height: '48px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="clay-input"
                      rows={3}
                      style={{ minHeight: '80px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setEditingId(null); }}
                      className="clay-btn clay-btn-secondary"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="clay-btn clay-btn-primary shadow-clay-button"
                      style={{ flex: 1 }}
                    >
                      <Save size={16} />
                      {editingId ? 'Update' : 'Save'}
                    </button>
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