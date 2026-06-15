import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';

const PublicTopBar = ({ openAuthModal }) => {
  const location = useLocation();
  const isAuth = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 24px', height: '64px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
        className="public-topbar-inner"
      >
        <Link
          to="/"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            textDecoration: 'none', color: 'var(--color-text)',
          }}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.25)',
          }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{
            fontWeight: 'var(--font-extrabold)', fontSize: '16px',
            letterSpacing: 'var(--tracking-tight)',
          }}>
            SkillGap<span style={{ color: 'var(--color-primary)' }}>.ai</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAuth ? (
            <Link
              to="/"
              style={{
                padding: '8px 14px', borderRadius: 'var(--radius-md)',
                fontSize: '14px', fontWeight: '500',
                color: 'var(--color-text-muted)', textDecoration: 'none',
                transition: 'color 150ms ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
              ← Back to home
            </Link>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('login')}
                style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-md)',
                  fontSize: '14px', fontWeight: '500',
                  color: 'var(--color-text-muted)', textDecoration: 'none',
                  transition: 'color 150ms ease',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                Log in
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '14px' }}
              >
                Get started
              </button>
            </>
          )}
        </nav>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .public-topbar-inner { padding: 0 16px !important; }
        }
      `}</style>
    </header>
  );
};

export default PublicTopBar;
