import { Link } from 'react-router-dom';

const PublicTopBar = ({ openAuthModal }) => {
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
            textDecoration: 'none',
          }}
        >
          <span style={{
            fontWeight: 'var(--font-extrabold)', fontSize: '20px',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--color-text)',
          }}>
            Skill<span className="mc-gradient">Gap.ai</span>
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            to="/about"
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            About
          </Link>
          <Link
            to="/who-we-are"
            style={{
              fontSize: '15px',
              fontWeight: '500',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
          >
            Who we are
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
            <button
              onClick={() => openAuthModal('login')}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '50px',
              }}
            >
              Log in
            </button>
            <button
              onClick={() => openAuthModal('register')}
              className="btn btn-secondary"
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '50px',
                background: 'var(--slate-100)',
                border: '1px solid var(--slate-200)',
              }}
            >
              Sign up
            </button>
          </div>
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
