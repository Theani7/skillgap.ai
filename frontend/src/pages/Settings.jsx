import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Target, Save, LogOut, Sparkles, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
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

  const fetchData = useCallback(async () => {
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
    } catch (_err) {
      console.error(_err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [user, fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/api/user/profile', profileData);
      await api.put('/api/user/preferences', preferences);
      updateUser({ full_name: profileData.full_name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (_err) {
      console.error(_err);
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
        <div className="animate-spin w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4" />
        <p className="text-secondary font-medium">Loading Settings...</p>
      </div>
    );
  }

  return (
    <motion.div className="py-12 px-4 min-h-[calc(100vh-200px)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="container mx-auto max-w-[800px]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-3xl font-bold m-0 flex items-center gap-3">
            <SettingsIcon size={28} className="text-primary-600" /> Settings
          </h1>
          <p className="text-secondary mt-2">Manage your profile and career preferences</p>
        </motion.div>

        <div className="flex flex-col gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
            <h3 className="m-0 mb-8 flex items-center gap-2 text-lg font-bold"><Target size={20} className="text-primary-600" /> Career Preferences</h3>
            <div className="grid gap-6">
              <div>
                <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Target Role</label>
                <select value={preferences.target_role} onChange={(e) => setPreferences({ ...preferences, target_role: e.target.value })} className="input h-12">
                  <option value="">Select your target role...</option>
                  {targetRoles.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Timeline</label>
                  <select value={preferences.timeline_months} onChange={(e) => setPreferences({ ...preferences, timeline_months: parseInt(e.target.value) })} className="input h-12">
                    <option value={3}>3 months</option>
                    <option value={6}>6 months</option>
                    <option value={12}>12 months</option>
                    <option value={18}>18 months</option>
                    <option value={24}>24 months</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Salary Target ($)</label>
                  <input type="number" value={preferences.salary_target} onChange={(e) => setPreferences({ ...preferences, salary_target: parseInt(e.target.value) || 0 })} className="input h-12" placeholder="e.g., 100000" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Preferred Location</label>
                <input type="text" value={preferences.preferred_location} onChange={(e) => setPreferences({ ...preferences, preferred_location: e.target.value })} className="input h-12" placeholder="e.g., Remote, San Francisco" />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-8">
            <h3 className="m-0 mb-8 flex items-center gap-2 text-lg font-bold"><User size={20} className="text-primary-600" /> Profile Information</h3>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Full Name</label>
                  <input type="text" value={profileData.full_name} onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })} className="input h-12" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Phone</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} className="input h-12" />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Location</label>
                <input type="text" value={profileData.location} onChange={(e) => setProfileData({ ...profileData, location: e.target.value })} className="input h-12" placeholder="City, State" />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Bio</label>
                <textarea value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} className="input min-h-[100px]" rows={3} placeholder="Tell us about yourself..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Current Role</label>
                  <input type="text" value={profileData.current_role} onChange={(e) => setProfileData({ ...profileData, current_role: e.target.value })} className="input h-12" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">Experience (years)</label>
                  <input type="text" value={profileData.experience_years} onChange={(e) => setProfileData({ ...profileData, experience_years: e.target.value })} className="input h-12" placeholder="e.g., 3" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">LinkedIn URL</label>
                  <input type="url" value={profileData.linkedin_url} onChange={(e) => setProfileData({ ...profileData, linkedin_url: e.target.value })} className="input h-12" />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-secondary text-xs uppercase tracking-wider">GitHub URL</label>
                  <input type="url" value={profileData.github_url} onChange={(e) => setProfileData({ ...profileData, github_url: e.target.value })} className="input h-12" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary p-6 rounded-2xl border border-neutral-100">
            <button onClick={() => setShowLogoutConfirm(true)} className="btn btn-secondary w-full sm:w-auto flex items-center gap-2 hover:bg-error-50 hover:text-error-600 hover:border-error-200">
              <LogOut size={18} /> Logout
            </button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary w-full sm:w-auto flex items-center gap-2 shadow-md">
              {saving ? 'Saving...' : saved ? <><CheckCircle size={18} /> Saved!</> : <><Save size={18} /> Save Changes</>}
            </button>
          </motion.div>
        </div>
...
        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-6"
              style={{ zIndex: 'var(--z-modal-backdrop)', backgroundColor: 'rgba(0,0,0,0.5)' }}
              onClick={() => setShowLogoutConfirm(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-primary rounded-2xl p-8 max-w-[400px] w-full text-center shadow-xl border border-neutral-200"
                style={{ zIndex: 'var(--z-modal)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 rounded-full bg-error-50 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} className="text-error-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-primary">Logout?</h2>
                <p className="text-secondary mb-8">Are you sure you want to logout? You'll need to sign in again to access your profile.</p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)} 
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="btn flex-1 bg-error-600 text-white hover:bg-error-700 border-none"
                  >
                    Logout
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Settings;