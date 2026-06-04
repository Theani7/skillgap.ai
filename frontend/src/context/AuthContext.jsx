/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api, { registerLogoutHandler } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const PROFILE_CACHE_KEY = 'skillgap_profile';

const writeProfile = (profile) => {
  try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile)); } catch (_) { /* noop */ }
};
const clearProfile = () => {
  try { localStorage.removeItem(PROFILE_CACHE_KEY); } catch (_) { /* noop */ }
};
const readProfile = () => {
  try { return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY) || 'null'); } catch (_) { return null; }
};

const buildProfile = (data) => ({
  role: data.role,
  username: data.username,
  full_name: data.full_name,
  email: data.email,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readProfile());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/auth/me', { _skipAuthRedirect: true });
        if (!cancelled) {
          const profile = buildProfile(res.data);
          setUser(profile);
          writeProfile(profile);
        }
      } catch (_err) {
        if (!cancelled) {
          setUser(null);
          clearProfile();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUser();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me', { _skipAuthRedirect: true });
      const profile = buildProfile(res.data);
      setUser(profile);
      writeProfile(profile);
      return profile;
    } catch (_err) {
      setUser(null);
      clearProfile();
      return null;
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updates } : prev;
      if (next) writeProfile(next);
      return next;
    });
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/logout'); } catch (_) { /* noop */ }
    setUser(null);
    clearProfile();
  }, []);

  useEffect(() => {
    registerLogoutHandler(() => {
      setUser(null);
      clearProfile();
    });
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, updateUser }), [user, loading, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
