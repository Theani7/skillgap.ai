import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Trash2, X, CheckCircle, AlertTriangle,
  ChevronDown, ChevronRight, Edit3, Save, GripVertical,
  FileText, Sparkles, Clipboard, Layers,
} from 'lucide-react';
import api from '../services/api';
import PageLoader from '../components/Skeleton';

const fieldStyle = (focus) => ({
  width: '100%', height: '40px', padding: '0 12px',
  border: `1px solid ${focus ? 'var(--color-primary)' : 'var(--color-border)'}`,
  borderRadius: 'var(--radius-lg)', fontSize: '14px', color: 'var(--color-text)',
  background: 'var(--color-surface)', outline: 'none',
});

const JobRoles = () => {
  const [loading, setLoading] = useState(true);
  const [jobRoles, setJobRoles] = useState([]);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [roadmaps, setRoadmaps] = useState({});
  const [showRoadmapForm, setShowRoadmapForm] = useState(null);
  const [roadmapMode, setRoadmapMode] = useState('manual');
  const [templates, setTemplates] = useState({});
  const [showTemplates, setShowTemplates] = useState(null);
  const [bulkText, setBulkText] = useState('');
  const [bulkTitle, setBulkTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const toastTimerRef = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', category: '', skills: [],
  });
  const [skillInput, setSkillInput] = useState('');

  const [roadmapForm, setRoadmapForm] = useState({
    title: '', description: '', duration_weeks: 12, steps: [],
  });
  const [stepInput, setStepInput] = useState({ title: '', description: '', duration_weeks: 2, skills: '', resources: '' });

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3500);
  };

  const fetchJobRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/job-roles');
      setJobRoles(res.data.job_roles || []);
    } catch {
      showToast('error', 'Failed to load job roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobRoles(); }, [fetchJobRoles]);

  const handleAddSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('error', 'Title is required.'); return; }
    try {
      if (editingRole) {
        await api.patch(`/api/admin/job-roles/${editingRole.id}`, form);
        showToast('success', 'Job role updated.');
      } else {
        await api.post('/api/admin/job-roles', form);
        showToast('success', 'Job role created.');
      }
      setForm({ title: '', description: '', category: '', skills: [] });
      setEditingRole(null);
      setShowForm(false);
      await fetchJobRoles();
    } catch {
      showToast('error', 'Failed to save job role.');
    }
  };

  const handleEdit = (role) => {
    setForm({ title: role.title, description: role.description || '', category: role.category || '', skills: role.skills?.map((s) => s.skill_name) || [] });
    setEditingRole(role);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job role and all its roadmaps?')) return;
    try {
      await api.delete(`/api/admin/job-roles/${id}`);
      showToast('success', 'Job role deleted.');
      await fetchJobRoles();
    } catch {
      showToast('error', 'Failed to delete job role.');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.patch(`/api/admin/job-roles/${id}/status`);
      await fetchJobRoles();
    } catch {
      showToast('error', 'Failed to update status.');
    }
  };

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
    if (stepInput.title.trim()) {
      setRoadmapForm({ ...roadmapForm, steps: [...roadmapForm.steps, { ...stepInput }] });
      setStepInput({ title: '', description: '', duration_weeks: 2, skills: '', resources: '' });
    }
  };

  const handleRemoveStep = (idx) => {
    setRoadmapForm({ ...roadmapForm, steps: roadmapForm.steps.filter((_, i) => i !== idx) });
  };

  const handleCreateRoadmap = async () => {
    if (!roadmapForm.title.trim()) { showToast('error', 'Roadmap title is required.'); return; }
    try {
      await api.post(`/api/admin/job-roles/${showRoadmapForm}/roadmaps`, roadmapForm);
      showToast('success', 'Roadmap created.');
      setRoadmapForm({ title: '', description: '', duration_weeks: 12, steps: [] });
      setShowRoadmapForm(null);
      await fetchRoadmaps(showRoadmapForm);
    } catch {
      showToast('error', 'Failed to create roadmap.');
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

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/api/admin/roadmap-templates');
      setTemplates(res.data.templates || {});
      setShowTemplates(expandedRole);
    } catch {
      showToast('error', 'Failed to load templates.');
    }
  };

  const handleImportTemplate = async (roleId, template) => {
    try {
      await api.post(`/api/admin/job-roles/${roleId}/roadmaps`, template);
      showToast('success', 'Template imported successfully.');
      setShowTemplates(null);
      await fetchRoadmaps(roleId);
    } catch {
      showToast('error', 'Failed to import template.');
    }
  };

  const handleBulkImport = async (roleId) => {
    if (!bulkText.trim()) { showToast('error', 'Please paste roadmap steps.'); return; }
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
      setShowRoadmapForm(null);
      await fetchRoadmaps(roleId);
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'Failed to import steps.');
    }
  };

  const handleAIGenerate = async (roleId) => {
    setGenerating(true);
    try {
      const res = await api.post(`/api/admin/job-roles/${roleId}/roadmaps/ai-generate`);
      showToast('success', 'AI roadmap generated.');
      setShowRoadmapForm(null);
      await fetchRoadmaps(roleId);
    } catch (err) {
      showToast('error', err.response?.data?.detail || 'AI generation failed.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={22} color="var(--color-primary)" /> Job Roles
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Manage job roles, required skills, and career roadmaps.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingRole(null); setForm({ title: '', description: '', category: '', skills: [] }); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-secondary)', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={14} /> Add Job Role
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginBottom: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 16px' }}>{editingRole ? 'Edit Job Role' : 'New Job Role'}</h3>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input placeholder="Title (e.g. Software Engineer)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={fieldStyle(false)} />
                  <input placeholder="Category (e.g. Engineering)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={fieldStyle(false)} />
                </div>
                <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...fieldStyle(false), height: '80px', padding: '10px 12px', resize: 'vertical' }} />
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block' }}>Required Skills</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input placeholder="Add a skill..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} style={{ ...fieldStyle(false), flex: 1 }} />
                    <button type="button" onClick={handleAddSkill} style={{ padding: '0 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px' }}>Add</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {form.skills.map((s) => (
                      <span key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', background: 'var(--color-bg)', fontSize: '12px', color: 'var(--color-text)' }}>
                        {s} <button type="button" onClick={() => handleRemoveSkill(s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, display: 'flex' }}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { setShowForm(false); setEditingRole(null); }} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                  <button type="submit" style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>{editingRole ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {jobRoles.length === 0 ? (
        <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
          <Briefcase size={40} color="var(--color-text-light)" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>No job roles yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobRoles.map((role) => (
            <div key={role.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', gap: '12px', cursor: 'pointer' }} onClick={() => handleExpandRole(role.id)}>
                <div style={{ color: 'var(--color-text-muted)' }}>{expandedRole === role.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '600', fontSize: '15px', color: 'var(--color-text)' }}>{role.title}</span>
                    {role.category && <span style={{ padding: '2px 8px', borderRadius: '10px', background: 'var(--color-bg)', fontSize: '11px', color: 'var(--color-text-muted)' }}>{role.category}</span>}
                    <span style={{ padding: '2px 8px', borderRadius: '10px', background: role.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: role.is_active ? 'var(--color-success)' : 'var(--color-error)', fontSize: '11px', fontWeight: '600' }}>{role.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    <span>{role.skills?.length || 0} skills</span>
                    <span>{role.roadmap_count || 0} roadmaps</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleEdit(role)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}><Edit3 size={13} /></button>
                  <button onClick={() => handleToggleStatus(role.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}>{role.is_active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleDelete(role.id)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-error)', cursor: 'pointer', fontSize: '12px' }}><Trash2 size={13} /></button>
                </div>
              </div>

              <AnimatePresence>
                {expandedRole === role.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '16px 20px' }}>
                      {role.description && <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>{role.description}</p>}
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', margin: 0 }}>Career Roadmaps</p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setShowRoadmapForm(role.id); setRoadmapMode('manual'); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}><Plus size={12} /> Manual</button>
                          <button onClick={() => { setShowRoadmapForm(role.id); setRoadmapMode('template'); fetchTemplates(); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}><Layers size={12} /> Templates</button>
                          <button onClick={() => { setShowRoadmapForm(role.id); setRoadmapMode('bulk'); }} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}><Clipboard size={12} /> Bulk Import</button>
                          <button onClick={() => handleAIGenerate(role.id)} disabled={generating} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: 'none', background: generating ? 'var(--color-text-light)' : 'var(--color-primary)', color: 'white', cursor: generating ? 'not-allowed' : 'pointer', fontSize: '12px' }}><Sparkles size={12} /> {generating ? 'Generating...' : 'AI Generate'}</button>
                        </div>
                      </div>
                      {roadmaps[role.id]?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {roadmaps[role.id].map((rm) => (
                            <div key={rm.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontWeight: '500', fontSize: '13px' }}>{rm.title}</span>
                                <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>{rm.duration_weeks} weeks · {rm.steps?.length || 0} steps</span>
                              </div>
                              <button onClick={() => handleDeleteRoadmap(rm.id, role.id)} style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: 'transparent', color: 'var(--color-error)', cursor: 'pointer' }}><Trash2 size={13} /></button>
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

              <AnimatePresence>
                {showRoadmapForm === role.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ padding: '16px 20px', background: 'var(--color-bg)' }}>
                      {roadmapMode === 'manual' && (
                        <>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px' }}>New Roadmap (Manual)</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input placeholder="Roadmap title" value={roadmapForm.title} onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })} style={fieldStyle(false)} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                              <textarea placeholder="Description (optional)" value={roadmapForm.description} onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })} style={{ ...fieldStyle(false), height: '60px', padding: '8px 12px', resize: 'vertical' }} />
                              <input type="number" placeholder="Duration (weeks)" value={roadmapForm.duration_weeks} onChange={(e) => setRoadmapForm({ ...roadmapForm, duration_weeks: parseInt(e.target.value) || 12 })} style={fieldStyle(false)} />
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                              <p style={{ fontSize: '12px', fontWeight: '600', margin: '0 0 8px' }}>Steps ({roadmapForm.steps.length})</p>
                              {roadmapForm.steps.map((step, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', borderBottom: idx < roadmapForm.steps.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '20px' }}>#{idx + 1}</span>
                                  <span style={{ flex: 1, fontSize: '13px' }}>{step.title}</span>
                                  <button onClick={() => handleRemoveStep(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 0 }}><X size={12} /></button>
                                </div>
                              ))}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '6px', marginTop: '8px' }}>
                                <input placeholder="Step title" value={stepInput.title} onChange={(e) => setStepInput({ ...stepInput, title: e.target.value })} style={{ ...fieldStyle(false), height: '34px', fontSize: '12px' }} />
                                <input type="number" placeholder="Weeks" value={stepInput.duration_weeks} onChange={(e) => setStepInput({ ...stepInput, duration_weeks: parseInt(e.target.value) || 2 })} style={{ ...fieldStyle(false), height: '34px', fontSize: '12px' }} />
                              </div>
                              <input placeholder="Skills (comma-separated)" value={stepInput.skills} onChange={(e) => setStepInput({ ...stepInput, skills: e.target.value })} style={{ ...fieldStyle(false), height: '34px', fontSize: '12px', marginTop: '6px' }} />
                              <button type="button" onClick={handleAddStep} style={{ marginTop: '6px', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '12px' }}>Add Step</button>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setShowRoadmapForm(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                              <button onClick={handleCreateRoadmap} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Create Roadmap</button>
                            </div>
                          </div>
                        </>
                      )}

                      {roadmapMode === 'template' && (
                        <>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px' }}>Import from Template</h4>
                          {templates[role.title] ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {templates[role.title].map((tpl, idx) => (
                                <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '600' }}>{tpl.title}</p>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>{tpl.description} · {tpl.duration_weeks} weeks · {tpl.steps.length} steps</p>
                                  </div>
                                  <button onClick={() => handleImportTemplate(role.id, tpl)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>Import</button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>No templates available for this role.</p>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                            <button onClick={() => setShowRoadmapForm(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                          </div>
                        </>
                      )}

                      {roadmapMode === 'bulk' && (
                        <>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>Bulk Import Roadmap</h4>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '0 0 12px' }}>
                            Paste steps one per line. Format: <code>Title | Description | Weeks | Skills | Resources</code>
                          </p>
                          <input placeholder="Roadmap title" value={bulkTitle} onChange={(e) => setBulkTitle(e.target.value)} style={{ ...fieldStyle(false), marginBottom: '8px' }} />
                          <textarea
                            placeholder={"Example:\nProgramming Fundamentals | Learn core concepts | 4 | Python,OOP | https://youtube.com/...\nVersion Control | Master Git | 2 | Git,GitHub | https://youtube.com/..."}
                            value={bulkText}
                            onChange={(e) => setBulkText(e.target.value)}
                            style={{ ...fieldStyle(false), height: '150px', padding: '10px 12px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button onClick={() => setShowRoadmapForm(null)} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
                            <button onClick={() => handleBulkImport(role.id)} style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Import Steps</button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} role="status" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)', color: 'white', padding: '12px 20px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', fontSize: '14px', fontWeight: '600', zIndex: 50, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobRoles;
