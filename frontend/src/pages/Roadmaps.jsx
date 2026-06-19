import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Route, ChevronDown, ChevronRight, Trash2, X, CheckCircle, AlertTriangle,
  Plus, Sparkles, Clock, Target,
} from 'lucide-react';
import api from '../services/api';
import PageLoader from '../components/Skeleton';

const inputStyle = {
  width: '100%', height: '36px', padding: '0 10px',
  border: '1px solid var(--color-border)', borderRadius: '8px',
  fontSize: '13px', color: 'var(--color-text)', background: 'var(--color-surface)', outline: 'none',
};

const Roadmaps = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [roadmaps, setRoadmaps] = useState({});
  const [expandedRole, setExpandedRole] = useState(null);
  const [expandedRoadmap, setExpandedRoadmap] = useState(null);
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);

  // New roadmap form
  const [showNewForm, setShowNewForm] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newWeeks, setNewWeeks] = useState(4);
  const [newSteps, setNewSteps] = useState([]);
  const [stepTitle, setStepTitle] = useState('');
  const [stepSkills, setStepSkills] = useState('');

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
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

  const handleAddStep = () => {
    if (!stepTitle.trim()) return;
    setNewSteps([...newSteps, { title: stepTitle.trim(), skills: stepSkills.trim() }]);
    setStepTitle('');
    setStepSkills('');
  };

  const handleRemoveStep = (idx) => {
    setNewSteps(newSteps.filter((_, i) => i !== idx));
  };

  const handleCreateRoadmap = async (roleId) => {
    if (!newTitle.trim()) { showToast('error', 'Title required.'); return; }
    if (newSteps.length === 0) { showToast('error', 'Add at least one step.'); return; }
    try {
      const steps = newSteps.map((s, i) => ({
        title: s.title,
        description: '',
        duration_weeks: 2,
        skills: s.skills,
        resources: '',
      }));
      await api.post(`/api/admin/job-roles/${roleId}/roadmaps`, {
        title: newTitle,
        description: '',
        duration_weeks: newWeeks,
        steps,
      });
      showToast('success', 'Roadmap created.');
      setShowNewForm(null);
      setNewTitle('');
      setNewWeeks(4);
      setNewSteps([]);
      await fetchRoadmaps(roleId);
    } catch {
      showToast('error', 'Failed to create roadmap.');
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
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Create and manage roadmaps for each job role.</p>
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
                  <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text)' }}>{role.title}</span>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <span>{role.skills?.length || 0} skills</span>
                    <span>{roadmaps[role.id]?.length || role.roadmap_count || 0} roadmaps</span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedRole === role.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '16px 20px' }}>
                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <button
                          onClick={() => { setShowNewForm(showNewForm === role.id ? null : role.id); setNewTitle(''); setNewWeeks(4); setNewSteps([]); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: showNewForm === role.id ? 'var(--color-primary)' : 'var(--color-surface)', color: showNewForm === role.id ? 'white' : 'var(--color-text)', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                        >
                          <Plus size={12} /> {showNewForm === role.id ? 'Cancel' : 'Add Roadmap'}
                        </button>
                        <button
                          onClick={() => handleAIGenerate(role.id)}
                          disabled={generating}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: generating ? 'var(--color-text-light)' : 'var(--color-secondary)', color: 'white', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '500' }}
                        >
                          <Sparkles size={12} /> {generating ? 'Generating...' : 'AI Generate'}
                        </button>
                      </div>

                      {/* New Roadmap Form */}
                      <AnimatePresence>
                        {showNewForm === role.id && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', marginBottom: '16px' }}>
                            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                                <input
                                  placeholder="Roadmap title"
                                  value={newTitle}
                                  onChange={(e) => setNewTitle(e.target.value)}
                                  style={{ ...inputStyle, flex: 2 }}
                                />
                                <input
                                  type="number"
                                  placeholder="Weeks"
                                  value={newWeeks}
                                  onChange={(e) => setNewWeeks(parseInt(e.target.value) || 4)}
                                  style={{ ...inputStyle, width: '80px' }}
                                />
                              </div>

                              {/* Steps List */}
                              {newSteps.length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                  {newSteps.map((step, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderBottom: idx < newSteps.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '18px' }}>#{idx + 1}</span>
                                      <span style={{ flex: 1, fontSize: '13px' }}>{step.title}</span>
                                      {step.skills && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{step.skills}</span>}
                                      <button onClick={() => handleRemoveStep(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 0 }}><X size={12} /></button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add Step Row */}
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                  placeholder="Step title"
                                  value={stepTitle}
                                  onChange={(e) => setStepTitle(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                                  style={{ ...inputStyle, flex: 2, height: '32px', fontSize: '12px' }}
                                />
                                <input
                                  placeholder="Skills (comma)"
                                  value={stepSkills}
                                  onChange={(e) => setStepSkills(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddStep()}
                                  style={{ ...inputStyle, flex: 1, height: '32px', fontSize: '12px' }}
                                />
                                <button onClick={handleAddStep} style={{ padding: '0 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', cursor: 'pointer', fontSize: '12px' }}>
                                  <Plus size={14} />
                                </button>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                  onClick={() => handleCreateRoadmap(role.id)}
                                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                >
                                  Create Roadmap ({newSteps.length} steps)
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

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

                              {/* Steps */}
                              <AnimatePresence>
                                {expandedRoadmap === rm.id && rm.steps?.length > 0 && (
                                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
                                    <div style={{ padding: '0 16px 12px' }}>
                                      {rm.steps.map((step, idx) => (
                                        <div key={step.id} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: idx < rm.steps.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', flexShrink: 0 }}>
                                            {step.step_number}
                                          </div>
                                          <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                              <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--color-text)' }}>{step.title}</span>
                                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{step.duration_weeks}w</span>
                                            </div>
                                            {step.skills && (
                                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                {step.skills.split(',').map((s, i) => (
                                                  <span key={i} style={{ padding: '2px 6px', borderRadius: '8px', background: 'var(--color-surface)', fontSize: '10px', color: 'var(--color-text-muted)' }}>{s.trim()}</span>
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
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No roadmaps yet.</p>
                      )}
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
