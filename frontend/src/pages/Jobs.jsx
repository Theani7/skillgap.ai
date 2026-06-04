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
    if (user) {
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
      await api.patch(`/api/jobs/applications/${appId}`, { status: newStatus });
      fetchApplications();
    } catch (err) {
      console.error('Status update error:', err);
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-secondary">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-primary-600 font-bold">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div className="py-12 px-4 min-h-[calc(100vh-200px)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="container mx-auto max-w-[800px]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shadow-sm">
                <Briefcase size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold m-0">Job Applications</h1>
                <p className="text-secondary m-0">Track your job search</p>
              </div>
            </div>
            <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2 shadow-md">
              <Plus size={18} /> Add Application
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-primary-600' },
            { label: 'Applied', value: stats.applied, color: 'text-info' },
            { label: 'Interview', value: stats.interview, color: 'text-warning' },
            { label: 'Offers', value: stats.offer, color: 'text-success' }
          ].map((stat, i) => (
            <div key={i} className="card p-6 text-center">
              <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-secondary text-[10px] font-bold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-2 mb-8 flex-wrap">
          {[{ value: 'all', label: 'All' }, ...STATUS_OPTIONS].map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} className={`btn ${filter === opt.value ? 'btn-primary' : 'btn-secondary'} px-4 py-2 min-h-0 h-auto text-xs`}>
              {opt.label}
            </button>
          ))}
        </motion.div>

        {filteredApps.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-6"><Briefcase size={28} /></div>
            <h3 className="text-xl font-bold mb-2">No Applications Yet</h3>
            <p className="text-secondary mb-8">Start tracking your job applications.</p>
            <button onClick={handleAddNew} className="btn btn-primary flex items-center gap-2 mx-auto"><Plus size={18} /> Add Application</button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-4">
            {[...filteredApps].reverse().map((app, i) => {
              const statusInfo = getStatusInfo(app.status);
              return (
                <motion.div key={app.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="m-0 text-lg font-bold">{app.role}</h3>
                        {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700"><ExternalLink size={14} /></a>}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-secondary text-sm">
                        <span className="flex items-center gap-1"><Building size={14} className="opacity-50" />{app.company}</span>
                        {app.location && <span className="flex items-center gap-1"><MapPin size={14} className="opacity-50" />{app.location}</span>}
                        {app.salary && <span className="flex items-center gap-1"><DollarSign size={14} className="opacity-50" />{app.salary}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="flex-1 md:flex-none p-2 px-4 rounded-lg font-semibold text-sm cursor-pointer transition-colors"
                        style={{
                          background: `${statusInfo.color}10`,
                          color: statusInfo.color,
                          border: `1px solid ${statusInfo.color}20`,
                        }}
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(app)} className="btn btn-secondary p-2 h-auto min-h-0 rounded-lg hover:bg-neutral-100"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(app.id)} className="btn btn-secondary p-2 h-auto min-h-0 rounded-lg hover:bg-error-50 hover:text-error-600 hover:border-error-200"><Trash2 size={16} /></button>
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
            <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-8 border border-neutral-200">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="m-0 text-xl font-bold">{editingJob ? 'Edit Application' : 'Add Application'}</h2>
                  <button onClick={() => { setShowForm(false); setEditingJob(null); }} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Company *</label>
                      <input type="text" required value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="input h-12" />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Role *</label>
                      <input type="text" required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input h-12" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="input h-12">
                      {STATUS_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Location</label>
                      <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input h-12" />
                    </div>
                    <div>
                      <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Salary</label>
                      <input type="text" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="input h-12" placeholder="e.g., $80,000" />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Job URL</label>
                    <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} className="input h-12" />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Notes</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="input min-h-[80px]" rows={3} />
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button type="button" onClick={() => { setShowForm(false); setEditingJob(null); }} className="btn btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1 shadow-md"><Save size={16} />{editingJob ? 'Update' : 'Save'}</button>
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