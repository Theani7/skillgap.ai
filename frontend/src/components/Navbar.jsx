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

        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
