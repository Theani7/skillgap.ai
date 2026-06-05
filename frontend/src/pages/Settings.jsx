import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon, Database, AlertTriangle, LogOut,
  Download, Trash2, RefreshCw, ShieldAlert, ExternalLink, Check, FileDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import PageLoader from '../components/Skeleton';

const Section = (props) => {
  const { icon: Icon, title, description, children, action, accent = 'indigo' } = props;
  const colors = {
    indigo: { bg: 'var(--indigo-50)', fg: 'var(--color-primary)' },
    emerald: { bg: 'var(--emerald-50)', fg: 'var(--color-success)' },
    amber: { bg: '#FEF3C7', fg: '#D97706' },
    error: { bg: 'var(--color-error-light)', fg: 'var(--color-error)' },
  }[accent];
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{ padding: '24px' }}
    >
      <header style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
            background: colors.bg, color: colors.fg,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
              {title}
            </h2>
            {description && (
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                {description}
              </p>
            )}
          </div>
        </div>
        {action}
      </header>
      {children}
    </motion.section>
  );
};

const ConfirmModal = (props) => {
  const { open, onClose, onConfirm, title, message, confirmText, danger = false, busy = false } = props;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', zIndex: 50,
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            style={{
              background: 'var(--color-surface)', borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
              maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center',
            }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: danger ? 'var(--color-error-light)' : 'var(--indigo-50)',
              color: danger ? 'var(--color-error)' : 'var(--color-primary)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
            }}>
              <AlertTriangle size={26} />
            </div>
            <h3 id="confirm-modal-title" style={{ fontSize: '18px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: '0 0 8px' }}>
              {title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: '0 0 24px' }}>
              {message}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button" onClick={onClose} disabled={busy}
                style={{
                  flex: 1, height: '42px', padding: '0 20px', borderRadius: 'var(--radius-lg)',
                  background: 'transparent', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-muted)', fontWeight: 'var(--font-semibold)', fontSize: '14px',
                  cursor: busy ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button" onClick={onConfirm} disabled={busy}
                style={{
                  flex: 1, height: '42px', padding: '0 20px', borderRadius: 'var(--radius-lg)',
                  background: danger ? 'var(--color-error)' : 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)',
                  color: 'white', fontWeight: 'var(--font-semibold)', fontSize: '14px',
                  border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                  opacity: busy ? 0.7 : 1,
                }}
              >
                {busy ? 'Working…' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DataAction = (props) => {
  const { icon: Icon, iconColor, title, description, action } = props;
  const colors = {
    indigo: { bg: 'var(--indigo-50)', fg: 'var(--color-primary)' },
    amber: { bg: '#FEF3C7', fg: '#D97706' },
    error: { bg: 'var(--color-error-light)', fg: 'var(--color-error)' },
    emerald: { bg: 'var(--emerald-50)', fg: 'var(--color-success)' },
  }[iconColor] || { bg: 'var(--color-bg)', fg: 'var(--color-text-muted)' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
      padding: '14px 16px', borderRadius: 'var(--radius-lg)',
      background: 'var(--color-bg)', border: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
        background: colors.bg, color: colors.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={15} />
      </div>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: 'var(--font-bold)', color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0', lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
      {action}
    </div>
  );
};

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toastTimer = useRef(null);

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const [showLogout, setShowLogout] = useState(false);
  const [showClearHistory, setShowClearHistory] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/api/user/history');
      const profile = await api.get('/api/user/profile');
      const prefs = await api.get('/api/user/preferences');
      const blob = new Blob(
        [JSON.stringify({
          exported_at: new Date().toISOString(),
          user: { username: user?.username, email: user?.email, role: user?.role },
          profile: profile.data.profile,
          preferences: prefs.data.preferences,
          analyses: res.data.history,
        }, null, 2)],
        { type: 'application/json' }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skillgap-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Data exported');
    } catch (err) {
      console.error(err);
      showToast('Failed to export data', 'error');
    }
  };

  const handleClearHistory = async () => {
    setBusy(true);
    try {
      await api.delete('/api/user/history');
      setShowClearHistory(false);
      showToast('Analysis history cleared');
    } catch (err) {
      console.error(err);
      showToast('Failed to clear history', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{
      minHeight: '100%',
      background: 'var(--color-bg)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-180px', right: '-150px', width: '480px', height: '480px',
        borderRadius: '50%', opacity: 0.05, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-primary) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-200px', left: '-180px', width: '500px', height: '500px',
        borderRadius: '50%', opacity: 0.04, pointerEvents: 'none',
        background: 'radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '880px' }}>
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ marginBottom: '28px' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
            fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
            color: 'var(--color-primary)', background: 'var(--indigo-50)',
            border: '1px solid var(--indigo-100)', marginBottom: '14px',
          }}>
            <SettingsIcon size={11} /> Account
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 34px)', fontWeight: 'var(--font-extrabold)',
            letterSpacing: 'var(--tracking-tight)', color: 'var(--color-text)', margin: 0, marginBottom: '6px',
          }}>
            Settings
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-text-muted)', margin: 0 }}>
            Manage your data and account.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-light)', margin: '10px 0 0' }}>
            To update your name, contact info, or career preferences, visit{' '}
            <Link to="/profile" style={{ color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)' }}>Profile</Link>.
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Section
            icon={Database}
            title="Data & Privacy"
            description="Export your data or clear your analysis history."
            accent="emerald"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <DataAction
                icon={FileDown}
                iconColor="indigo"
                title="Export all data"
                description="Download a JSON file with your profile, preferences, and analysis history."
                action={
                  <button
                    onClick={handleExportData}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      height: '34px', padding: '0 14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                      color: 'var(--color-text)', fontSize: '12px', fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary)';
                      e.currentTarget.style.color = 'var(--color-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-text)';
                    }}
                  >
                    <Download size={13} /> Download
                  </button>
                }
              />
              <DataAction
                icon={RefreshCw}
                iconColor="amber"
                title="Reset analysis history"
                description="Remove every past resume analysis. Your profile and preferences stay intact."
                action={
                  <button
                    onClick={() => setShowClearHistory(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      height: '34px', padding: '0 14px', borderRadius: 'var(--radius-md)',
                      background: 'transparent', border: '1px solid var(--color-border)',
                      color: '#D97706', fontSize: '12px', fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#FEF3C7';
                      e.currentTarget.style.borderColor = '#D97706';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    <Trash2 size={13} /> Clear
                  </button>
                }
              />
            </div>
          </Section>

          <Section
            icon={ShieldAlert}
            title="Danger Zone"
            description="Irreversible actions. Proceed with care."
            accent="error"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <DataAction
                icon={LogOut}
                iconColor="error"
                title="Log out"
                description="Sign out of this device. You can log back in anytime."
                action={
                  <button
                    onClick={() => setShowLogout(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      height: '34px', padding: '0 14px', borderRadius: 'var(--radius-md)',
                      background: 'transparent', border: '1px solid var(--color-border)',
                      color: 'var(--color-error)', fontSize: '12px', fontWeight: 'var(--font-semibold)',
                      cursor: 'pointer', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-error-light)';
                      e.currentTarget.style.borderColor = '#FECACA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                    }}
                  >
                    <LogOut size={13} /> Log out
                  </button>
                }
              />
              <DataAction
                icon={Trash2}
                iconColor="error"
                title="Delete account"
                description="Permanently remove your account, profile, preferences, and all data."
                action={
                  <button
                    onClick={() => setShowDeleteAccount(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      height: '34px', padding: '0 14px', borderRadius: 'var(--radius-md)',
                      background: 'var(--color-error)', color: 'white',
                      fontSize: '12px', fontWeight: 'var(--font-semibold)',
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}
                  >
                    Delete account
                  </button>
                }
              />
              <p style={{
                fontSize: '11px', color: 'var(--color-text-light)', margin: '4px 0 0',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <ExternalLink size={10} />
                Account deletion is currently manual — contact support to complete.
              </p>
            </div>
          </Section>
        </div>
      </div>

      <ConfirmModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        title="Log out?"
        message="You'll need to sign in again to access your account."
        confirmText="Log out"
      />

      <ConfirmModal
        open={showClearHistory}
        onClose={() => setShowClearHistory(false)}
        onConfirm={handleClearHistory}
        title="Clear analysis history?"
        message="This permanently removes every past resume analysis. Your profile and preferences are kept."
        confirmText="Clear history"
        danger
        busy={busy}
      />

      <ConfirmModal
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={() => { setShowDeleteAccount(false); showToast('Contact support@skillgap.ai to complete account deletion', 'success'); }}
        title="Delete account?"
        message="This permanently removes your account and all associated data. This action cannot be undone."
        confirmText="Got it"
        danger
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }}
            style={{
              position: 'fixed', bottom: '24px', left: '50%',
              background: toast.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
              color: 'white', padding: '10px 18px', borderRadius: 'var(--radius-full)',
              fontSize: '13px', fontWeight: 'var(--font-semibold)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              zIndex: 100,
            }}
          >
            <Check size={14} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
