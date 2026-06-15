import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, Sparkles, Settings, User, Shield, LogOut,
  Menu, X, BarChart3, FileSearch, AlertTriangle, MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'skillgap_sidebar_collapsed';

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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch (_) { /* noop */ }
  }, [collapsed]);

  useEffect(() => {
    const t = setTimeout(() => setMobileOpen(false), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

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
  const width = collapsed ? 72 : 240;

  const renderLink = (link) => {
    const active = isActive(link.path);
    const Icon = link.icon;
    return (
      <Link
        key={link.path}
        to={link.path}
        title={collapsed ? link.label : undefined}
        style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', gap: '12px',
          height: '40px', padding: collapsed ? '0' : '0 12px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px', fontWeight: active ? 'var(--font-semibold)' : '500',
          textDecoration: 'none',
          color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
          background: active ? 'var(--indigo-50)' : 'transparent',
          transition: 'background 150ms ease, color 150ms ease',
        }}
        onMouseEnter={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'var(--color-bg)';
            e.currentTarget.style.color = 'var(--color-text)';
          }
        }}
        onMouseLeave={(e) => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }
        }}
      >
        {active && !collapsed && (
          <motion.div
            layoutId="sidebar-active-indicator"
            style={{
              position: 'absolute', left: 0, top: '8px', bottom: '8px',
              width: '3px', borderRadius: '0 3px 3px 0',
              background: 'var(--color-primary)',
            }}
          />
        )}
        <Icon size={18} style={{ flexShrink: 0 }} />
        {!collapsed && (
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {link.label}
          </span>
        )}
      </Link>
    );
  };

  const isAdmin = user?.role === 'admin';
  const sectionsToRender = [...SECTIONS];
  if (isAdmin) {
    sectionsToRender.push({
      label: 'Manage',
      items: [{ path: '/admin', icon: Shield, label: 'Admin' }],
    });
  }

  const userSubtitle = user?.email || (user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '');

  const sidebarContent = (isMobile) => (
    <aside
      onMouseEnter={!isMobile ? () => setCollapsed(false) : undefined}
      onMouseLeave={!isMobile ? () => setCollapsed(true) : undefined}
      style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, left: 0,
        height: '100vh',
        width: isMobile ? 280 : width,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex', flexDirection: 'column',
        zIndex: isMobile ? 60 : 30,
        transition: isMobile ? 'none' : 'width 200ms ease',
        boxShadow: isMobile ? '0 10px 40px rgba(15, 23, 42, 0.15)' : 'none',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        padding: collapsed && !isMobile ? '20px 0' : '20px 20px',
        minHeight: '72px',
      }}>
        <Link
          to="/app"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', overflow: 'hidden',
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
            flexShrink: 0,
          }}>
            <Zap size={16} color="white" />
          </div>
          {(!collapsed || isMobile) && (
            <span style={{
              fontWeight: 'var(--font-extrabold)', fontSize: '16px',
              letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text)',
              whiteSpace: 'nowrap',
            }}>
              SkillGap<span style={{ color: 'var(--color-primary)' }}>.ai</span>
            </span>
          )}
        </Link>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)', background: 'transparent',
              color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      <nav style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden',
        padding: '8px 12px 16px',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        {sectionsToRender.map((section) => (
          <div key={section.label}>
            {(!collapsed || isMobile) && (
              <h3 style={{
                fontSize: '11px', fontWeight: 'var(--font-bold)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--color-text-light)', margin: '0 12px 8px',
              }}>
                {section.label}
              </h3>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((link) => renderLink(link))}
            </div>
          </div>
        ))}

        <div>
          {(!collapsed || isMobile) && (
            <h3 style={{
              fontSize: '11px', fontWeight: 'var(--font-bold)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              color: 'var(--color-text-light)', margin: '0 12px 8px',
            }}>
              Account
            </h3>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {BOTTOM_LINKS.map((link) => renderLink(link))}
          </div>
        </div>
      </nav>

      <div style={{
        borderTop: '1px solid var(--color-border)',
        padding: collapsed && !isMobile ? '12px 8px' : '12px 12px',
        position: 'relative',
      }} ref={userMenuRef}>
        <AnimatePresence>
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', bottom: 'calc(100% + 8px)', left: '12px', right: '12px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px', zIndex: 50,
              }}
            >
              <div style={{
                padding: '8px 10px', marginBottom: '4px',
                borderBottom: '1px solid var(--color-border)',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
                  {user?.full_name || user?.username}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {userSubtitle}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setUserMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: '500', color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={14} color="var(--color-text-muted)" />
                View profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setUserMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: '500', color: 'var(--color-text)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Settings size={14} color="var(--color-text-muted)" />
                Settings
              </Link>
              <div style={{ height: '1px', background: 'var(--color-border)', margin: '4px 0' }} />
              <button
                onClick={() => setShowLogoutConfirm(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  fontSize: '13px', fontWeight: '500', color: 'var(--color-error)',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  width: '100%', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-error-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={14} />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: collapsed && !isMobile ? '6px' : '8px 10px',
            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            cursor: 'pointer',
            color: 'var(--color-text)',
            transition: 'border-color 150ms ease, background 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--indigo-200)';
            e.currentTarget.style.background = 'var(--color-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.background = 'var(--color-surface)';
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '13px', fontWeight: 'var(--font-bold)',
            flexShrink: 0,
          }}>
            {(user?.full_name || user?.username || '?').charAt(0).toUpperCase()}
          </div>
          {(!collapsed || isMobile) && (
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{
                fontSize: '13px', fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text)', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {user?.full_name || user?.username}
              </p>
              <p style={{
                fontSize: '11px', color: 'var(--color-text-muted)', margin: 0,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {userSubtitle}
              </p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="sidebar-mobile-trigger"
        style={{
          position: 'fixed', top: '12px', left: '12px', zIndex: 25,
          width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)', background: 'var(--color-surface)',
          color: 'var(--color-text-muted)', cursor: 'pointer',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Menu size={18} />
      </button>

      {sidebarContent(false)}

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
                zIndex: 55,
              }}
            />
            {sidebarContent(true)}
          </>
        )}
      </AnimatePresence>

      <style>{`
        .sidebar-mobile-trigger { display: none; }
        @media (max-width: 1023px) {
          aside { display: none !important; }
          .sidebar-mobile-trigger { display: flex !important; }
        }
      `}</style>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 910,
              background: 'rgba(15, 15, 30, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '380px',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)', padding: '28px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'var(--color-error-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
              }}>
                <AlertTriangle size={24} color="var(--color-error)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 6 }}>
                Log out of your account?
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                You'll need to sign in again to access your analyses and saved data.
              </p>
              <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: '1.5px solid var(--color-border)', background: 'var(--color-surface)',
                    color: 'var(--color-text)', fontWeight: 600, fontSize: '0.9rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
<button
                    onClick={async () => {
                      await logout();
                    }}
                    style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: 'none', background: 'var(--color-error)',
                    color: 'white', fontWeight: 600, fontSize: '0.9rem',
                    cursor: 'pointer',
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
