import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Target, Save, LogOut, Sparkles, DollarSign, MapPin, Clock, ExternalLink, Monitor, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
    current_role: '',
    experience_years: '',
    linkedin_url: '',
    github_url: ''
  });
  
  const [preferences, setPreferences] = useState({
    target_role: '',
    timeline_months: 6,
    preferred_location: '',
    salary_target: 0,
  });

  const targetRoles = [
    'Data Science', 'Web Development', 'Android Development', 'IOS Development',
    'UI/UX Design', 'Quality Assurance', 'DevOps', 'Cloud Engineering',
    'Data Engineering', 'Machine Learning', 'Cybersecurity', 'Product Management',
    'Business Analysis', 'Frontend Development', 'Backend Development',
    'Full Stack Development', 'Mobile Development', 'Cloud Architecture',
    'Software Engineering', 'Technical Writing', 'IT Support', 'Network Administration'
  ];

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.token) return;
    try {
      const [profileRes, prefRes] = await Promise.all([
        api.get('/api/user/profile'),
        api.get('/api/user/preferences')
      ]);
      setProfileData({
        full_name: profileRes.data.profile?.full_name || user?.full_name || '',
        phone: profileRes.data.profile?.phone || '',
        location: profileRes.data.profile?.location || '',
        bio: profileRes.data.profile?.bio || '',
        current_role: profileRes.data.profile?.current_role || '',
        experience_years: profileRes.data.profile?.experience_years || '',
        linkedin_url: profileRes.data.profile?.linkedin_url || '',
        github_url: profileRes.data.profile?.github_url || ''
      });
      setPreferences({
        target_role: prefRes.data.preferences?.target_role || '',
        timeline_months: prefRes.data.preferences?.timeline_months || 6,
        preferred_location: prefRes.data.preferences?.preferred_location || '',
        salary_target: prefRes.data.preferences?.salary_target || 0,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/user/profile', profileData);
      await api.put('/api/user/preferences', preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="clay-loader" style={{ minHeight: '100vh' }}>
        <div className="clay-spinner" style={{ width: '48px', height: '48px' }} />
        <p>Loading Settings...</p>
      </div>
    );
  }

  return (
    <motion.div className="clay-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ minHeight: 'calc(100vh - 200px)', padding: 'var(--spacing-xl) 0' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <h1 style={{ fontSize: '1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <SettingsIcon size={28} /> Settings
          </h1>
          <p style={{ color: 'var(--clay-muted)', margin: '8px 0 0' }}>Manage your profile and preferences</p>
        </motion.div>

        {/* Career Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}><Target size={20} /> Career Preferences</h3>
          
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Target Role</label>
              <select value={preferences.target_role} onChange={(e) => setPreferences({ ...preferences, target_role: e.target.value })} className="clay-input" style={{ height: '48px' }}>
                <option value="">Select your target role...</option>
                {targetRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Timeline</label>
                <select value={preferences.timeline_months} onChange={(e) => setPreferences({ ...preferences, timeline_months: parseInt(e.target.value) })} className="clay-input" style={{ height: '48px' }}>
                  <option value={3}>3 months</option>
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Salary Target ($)</label>
                <input type="number" value={preferences.salary_target} onChange={(e) => setPreferences({ ...preferences, salary_target: parseInt(e.target.value) || 0 })} className="clay-input" placeholder="e.g., 100000" style={{ height: '48px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Preferred Location</label>
              <input type="text" value={preferences.preferred_location} onChange={(e) => setPreferences({ ...preferences, preferred_location: e.target.value })} className="clay-input" placeholder="e.g., Remote, San Francisco" style={{ height: '48px' }} />
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'var(--clay-cardBg)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ margin: '0 0 var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> Profile Information</h3>
          
          <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Full Name</label>
                <input type="text" value={profileData.full_name} onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })} className="clay-input" style={{ height: '48px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Phone</label>
                <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="clay-input" style={{ height: '48px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Location</label>
              <input type="text" value={profileData.location} onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} className="clay-input" placeholder="City, State" style={{ height: '48px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Bio</label>
              <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} className="clay-input" rows={3} placeholder="Tell us about yourself..." style={{ minHeight: '100px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Current Role</label>
                <input type="text" value={profileData.current_role} onChange={(e) => setProfileData({ ...profileData, current_role: e.target.value })} className="clay-input" style={{ height: '48px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>Experience (years)</label>
                <input type="text" value={profileData.experience_years} onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })} className="clay-input" placeholder="e.g., 3" style={{ height: '48px' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>LinkedIn URL</label>
                <input type="url" value={profileData.linkedin_url} onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })} className="clay-input" style={{ height: '48px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, color: 'var(--clay-muted)', fontSize: '0.85rem' }}>GitHub URL</label>
                <input type="url" value={profileData.github_url} onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })} className="clay-input" style={{ height: '48px' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
          <button onClick={handleLogout} className="clay-btn clay-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={18} /> Logout
          </button>
          <button onClick={handleSave} disabled={saving} className="clay-btn clay-btn-primary shadow-clay-button" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {saving ? 'Saving...' : saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Settings;