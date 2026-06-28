import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Sparkles, Settings, User, Shield, LogOut,
  ChevronLeft, ChevronRight, BarChart3, FileSearch, AlertTriangle, MessageSquare,
  LayoutDashboard, Activity, Users, MessageSquareText, BookOpen, Briefcase, Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'skillpath_sidebar_collapsed';

const SECTIONS = [
  {
    label: 'Analyze',
    items: [
      { path: '/app', icon: Sparkles, label: 'Resume Analyzer' },
      { path: '/analysis', icon: FileSearch, label: 'Latest Analysis' },
      { path: '/mock-interview', icon: MessageSquare, label: 'Mock Interview' },
    ],
  },
  {
    label: 'Track',
    items: [
      { path: '/profile', icon: BarChart3, label: 'Profile' },
    ],
  },
];

const BOTTOM_LINKS = [
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch (_) {}
  }, [collapsed]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);

  const isActive = (path) => location.pathname === path;
  const sidebarWidth = collapsed ? 64 : 220;

  const isAdmin = user?.role === 'admin';
  const sectionsToRender = isAdmin
    ? []
    : [...SECTIONS];
  if (isAdmin) {
    sectionsToRender.push({
      label: 'Manage',
      items: [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/resumes', icon: Activity, label: 'Resume Logs' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/feedback', icon: MessageSquareText, label: 'Feedback' },
        { path: '/admin/courses', icon: BookOpen, label: 'Courses' },
        { path: '/admin/job-roles', icon: Briefcase, label: 'Job Roles' },
        { path: '/admin/ai-monitoring', icon: Database, label: 'AI Monitoring' },
      ],
    });
  }

  const userSubtitle = user?.email || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '');

  return (
    <>
      <aside
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: sidebarWidth,
          minWidth: sidebarWidth,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 200ms ease, min-width 200ms ease',
          overflow: 'hidden',
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: '64px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Link to="/app" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            {collapsed ? (
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'var(--color-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Zap size={18} color="white" />
              </div>
            ) : (
              <span style={{
                fontWeight: '800', fontSize: '18px',
                letterSpacing: '-0.02em', color: 'var(--color-text)',
              }}>
                Skill<span style={{ color: 'var(--color-secondary)' }}>Path</span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: 'none', background: 'transparent',
                color: 'var(--color-text-light)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {sectionsToRender.map((section) => (
            <div key={section.label} style={{ marginBottom: '20px' }}>
              {!collapsed && (
                <div style={{
                  fontSize: '11px', fontWeight: '600',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: 'var(--color-text-light)',
                  padding: '0 8px', marginBottom: '6px',
                }}>
                  {section.label}
                </div>
              )}
              {section.items.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    title={collapsed ? link.label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      height: '36px',
                      padding: collapsed ? '0' : '0 10px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      fontSize: '13px', fontWeight: active ? '600' : '500',
                      textDecoration: 'none',
                      color: active ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                      background: active ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                      marginBottom: '2px',
                      transition: 'background 100ms ease, color 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = 'var(--color-bg)';
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Icon size={18} />
                    {!collapsed && <span>{link.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}

          <div style={{ marginBottom: '20px' }}>
            {!collapsed && (
              <div style={{
                fontSize: '11px', fontWeight: '600',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                color: 'var(--color-text-light)',
                padding: '0 8px', marginBottom: '6px',
              }}>
                Account
              </div>
            )}
            {BOTTOM_LINKS.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  title={collapsed ? link.label : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    height: '36px',
                    padding: collapsed ? '0' : '0 10px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderRadius: '8px',
                    fontSize: '13px', fontWeight: active ? '600' : '500',
                    textDecoration: 'none',
                    color: active ? 'var(--color-secondary)' : 'var(--color-text-muted)',
                    background: active ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                    transition: 'background 100ms ease, color 100ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = 'var(--color-bg)';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div style={{ padding: '0 8px 8px' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                width: '100%', height: '36px', borderRadius: '8px',
                border: 'none', background: 'var(--color-bg)',
                color: 'var(--color-text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* User */}
        <div
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '8px',
            position: 'relative',
          }}
          ref={userMenuRef}
        >
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                style={{
                  position: 'fixed',
                  bottom: '70px',
                  left: collapsed ? '72px' : '8px',
                  width: '200px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                  padding: '6px', zIndex: 100,
                }}
              >
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)', margin: 0 }}>
                    {user?.full_name || user?.username}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {userSubtitle}
                  </p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    fontSize: '13px', color: 'var(--color-text)', textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={14} /> View profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    fontSize: '13px', color: 'var(--color-text)', textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} /> Settings
                </Link>
                <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    fontSize: '13px', color: 'var(--color-error)',
                    background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-error-light)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%',
              padding: collapsed ? '6px' : '8px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--color-text)',
              transition: 'background 100ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'var(--color-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0,
            }}>
              {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.full_name || user?.username}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userSubtitle}
                </div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Logout modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 910,
              background: 'rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: '16px', width: '100%', maxWidth: '360px',
                boxShadow: '0 24px 64px rgba(0,0,0,0.2)', padding: '28px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--color-error-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <AlertTriangle size={22} color="var(--color-error)" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Log out?
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
                You'll need to sign in again to access your data.
              </p>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: '1px solid var(--color-border)', background: 'var(--color-surface)',
                    color: 'var(--color-text)', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { await logout(); }}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: 'none', background: 'var(--color-error)',
                    color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
