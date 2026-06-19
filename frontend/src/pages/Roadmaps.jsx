import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, ChevronDown, ChevronRight, Trash2, X, CheckCircle, AlertTriangle,
  Plus, Sparkles, Clipboard, Layers, Clock, Target,
} from 'lucide-react';
import api from '../services/api';
import PageLoader from '../components/Skeleton';

const fieldStyle = (focus) => ({
  width: '100%', height: '40px', padding: '0 12px',
  border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-lg)', fontSize: '14px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none',
});

const Roadmaps = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [roadmaps, setRoadmaps] = useState({});
  const [expandedRole, setExpandedRole] = useState(null);
  const [expandedRoadmap, setExpandedRoadmap] = useState(null);
  const [toast, setToast] = useState(null);
  const [templates, setTemplates] = useState({});
  const [showImport, setShowImport] = useState(null);
  const [bulkText, setBulkText] = useState('');
  const [bulkTitle, setBulkTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const toastTimerRef = { current: null };

  const showToast = (type, message) => {
    setToast({ type, message });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/job-roles');
      setRoles(res.data.job_roles || []);
    } catch {
      showToast('error', 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const fetchRoadmaps = async (roleId) => {
    try {
      const res = await api.get(`/api/admin/job-roles/${roleId}/roadmaps`);
      setRoadmaps((prev) => ({ ...prev, [roleId]: res.data.roadmaps || [] }));
    } catch {
      showToast('error', 'Failed to load roadmaps.');
    }
  };

  const handleExpandRole = (roleId) => {
    if (expandedRole === roleId) {
      setExpandedRole(null);
    } else {
      setExpandedRole(roleId);
      if (!roadmaps[roleId]) fetchRoadmaps(roleId);
    }
  };

  const fetchTemplates = async (roleId) => {
    try {
      const res = await api.get('/api/admin/roadmap-templates');
      setTemplates(res.data.templates || {});
      setShowImport(roleId);
    } catch {
      showToast('error', 'Failed to load templates.');
    }
  };

  const handleImportTemplate = async (roleId, template) => {
    try {
      await api.post(`/api/admin/job-roles/${roleId}/roadmaps`, template);
      showToast('success', 'Template imported.');
      setShowImport(null);
      await fetchRoadmaps(roleId);
    } catch {
      showToast('error', 'Failed to import template.');
    }
  };

  const handleBulkImport = async (roleId) => {
    if (!bulkText.trim()) { showToast('error', 'Paste roadmap steps.'); return; }
    try {
      const res = await api.post(`/api/admin/job-roles/${roleId}/roadmaps/bulk`, {
        title: bulkTitle || 'Imported Roadmap',
        description: '',
        duration_weeks: 12,
        steps_text: bulkText,
      });
      showToast('success', `Imported ${res.data.steps_imported} steps.`);
      setBulkText('');
      setBulkTitle('');
      setShowImport(null);
      await fetchRoadmaps(roleId);
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Import failed.');
    }
  };

  const handleAIGenerate = async (roleId) => {
    setGenerating(true);
    try {
      await api.post(`/api/admin/job-roles/${roleId}/roadmaps/ai-generate`);
      showToast('success', 'AI roadmap generated.');
      await fetchRoadmaps(roleId);
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'AI generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRoadmap = async (roadmapId, roleId) => {
    if (!confirm('Delete this roadmap?')) return;
    try {
      await api.delete(`/api/admin/roadmaps/${roadmapId}`);
      showToast('success', 'Roadmap deleted.');
      await fetchRoadmaps(roleId);
    } catch {
      showToast('error', 'Failed to delete roadmap.');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Route size={22} color="var(--color-primary)" /> Career Roadmaps
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Manage career roadmaps for each job role.</p>
      </div>

      {roles.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Route size={40} color="var(--color-text-light)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No job roles found. Create roles in Job Roles first.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {roles.map((role) => (
            <div key={role.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Role Header */}
              <div
                style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: '12px', cursor: 'pointer' }}
                onClick={() => handleExpandRole(role.id)}
              >
                <div style={{ color: 'var(--color-text-muted)' }}>
                  {expandedRole === role.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text)' }}>{role.title}</span>
                    {role.category && (
                      <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'var(--color-bg)', fontSize: '11px', color: 'var(--color-text-muted)' }}>{role.category}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <span>{role.skills?.length || 0} skills</span>
                    <span>{role.roadmap_count || 0} roadmaps</span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedRole === role.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '16px 20px' }}>
                      {/* Skills */}
                      {role.skills?.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>Required Skills</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {role.skills.map((s) => (
                              <span key={s.id} style={{ padding: '4px 10px', borderRadius: '12px', background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text)' }}>{s.skill_name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <button onClick={() => fetchTemplates(role.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}>
                          <Layers size={12} /> Import Template
                        </button>
                        <button onClick={() => { setShowImport(role.id); setBulkText(''); setBulkTitle(''); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}>
                          <Clipboard size={12} /> Bulk Import
                        </button>
                        <button onClick={() => handleAIGenerate(role.id)} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: generating ? 'var(--color-text-light)' : 'var(--color-primary)', color: 'white', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '12px' }}>
                          <Sparkles size={12} /> {generating ? 'Generating...' : 'AI Generate'}
                        </button>
                      </div>

                      {/* Roadmaps List */}
                      {roadmaps[role.id]?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {roadmaps[role.id].map((rm) => (
                            <div key={rm.id} style={{ borderRadius: '8px', background: 'var(--color-bg)', overflow: 'hidden' }}>
                              <div
                                style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', cursor: 'pointer' }}
                                onClick={() => setExpandedRoadmap(expandedRoadmap === rm.id ? null : rm.id)}
                              >
                                <div style={{ color: 'var(--color-text-muted)' }}>
                                  {expandedRoadmap === rm.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>{rm.title}</span>
                                  <div style={{ display: 'flex', gap: '12px', marginTop: '2px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={10} /> {rm.duration_weeks} weeks</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Target size={10} /> {rm.steps?.length || 0} steps</span>
                                  </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteRoadmap(rm.id, role.id); }} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer' }}>
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Roadmap Steps */}
                              <AnimatePresence>
                                {expandedRoadmap === rm.id && rm.steps?.length > 0 && (
                                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
                                    <div style={{ padding: '0 16px 12px' }}>
                                      {rm.steps.map((step, idx) => (
                                        <div key={step.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: idx < rm.steps.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', flexShrink: 0 }}>
                                            {step.step_number}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>{step.title}</span>
                                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{step.duration_weeks} weeks</span>
                                            </div>
                                            {step.description && (
                                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>{step.description}</p>
                                            )}
                                            {step.skills && (
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                                                {step.skills.split(',').map((s, i) => (
                                                  <span key={i} style={{ padding: '2px 8px', borderRadius: '10px', background: 'var(--color-surface)', fontSize: '10px', color: 'var(--color-text-muted)' }}>{s.trim()}</span>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No roadmaps yet. Use the buttons above to add one.</p>
                      )}

                      {/* Template Import Panel */}
                      <AnimatePresence>
                        {showImport === role.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', marginTop: '12px' }}>
                            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Import Roadmap</h4>
                                <button onClick={() => setShowImport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={16} /></button>
                              </div>

                              {templates[role.title] ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>Select a template to import:</p>
                                  {templates[role.title].map((tpl, idx) => (
                                    <div key={idx} style={{ padding: '10px 12px', borderRadius: '6px', background: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <div>
                                        <span style={{ fontWeight: '600', fontSize: '13px' }}>{tpl.title}</span>
                                        <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--color-text-muted)' }}>{tpl.duration_weeks} weeks · {tpl.steps.length} steps</span>
                                      </div>
                                      <button onClick={() => handleImportTemplate(role.id, tpl)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Import</button>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div>
                                  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 8px' }}>
                                    Bulk import: one step per line, format: <code>Title | Description | Weeks | Skills | Resources</code>
                                  </p>
                                  <input placeholder="Roadmap title" value={bulkTitle} onChange={(e) => setBulkTitle(e.target.value)} style={{ ...fieldStyle(false), marginBottom: '8px' }} />
                                  <textarea
                                    placeholder={"Programming Fundamentals | Learn core concepts | 4 | Python,OOP | https://youtube.com/..."}
                                    value={bulkText}
                                    onChange={(e) => setBulkText(e.target.value)}
                                    style={{ ...fieldStyle(false), height: '120px', padding: '10px 12px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
                                  />
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                    <button onClick={() => handleBulkImport(role.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Import</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)', color: 'white', padding: '12px 20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', fontSize: '14px', fontWeight: '600', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Roadmaps;
