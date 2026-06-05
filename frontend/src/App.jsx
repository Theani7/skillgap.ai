import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PublicTopBar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/Skeleton';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Analyzer = lazy(() => import('./pages/Analyzer'));
const AnalysisResult = lazy(() => import('./pages/AnalysisResult'));
const Jobs = lazy(() => import('./pages/Jobs'));
const CoverLetter = lazy(() => import('./pages/CoverLetter'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const SharedReport = lazy(() => import('./pages/SharedReport'));

const withBoundary = (node) => <ErrorBoundary>{node}</ErrorBoundary>;

const PUBLIC_PATHS = ['/', '/login', '/register'];

const Layout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const isPublic = PUBLIC_PATHS.includes(location.pathname) || location.pathname.startsWith('/shared/');

  if (loading && !isPublic) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <PageLoader />
      </div>
    );
  }

  if (isPublic) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <PublicTopBar />
        <main style={{ flex: 1, width: '100%' }}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={withBoundary(<Landing />)} />
              <Route path="/login" element={withBoundary(<Login />)} />
              <Route path="/register" element={withBoundary(<Register />)} />
              <Route path="/shared/:token" element={withBoundary(<SharedReport />)} />
            </Routes>
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div
      className="app-shell"
      style={{
        minHeight: '100vh', display: 'flex',
        flexDirection: 'row', alignItems: 'stretch',
        background: 'var(--color-bg)',
      }}
    >
      {user ? <ErrorBoundary><Sidebar /></ErrorBoundary> : <Navigate to="/login" replace />}
      <main
        style={{
          flex: 1, minWidth: 0,
          padding: '32px 32px 64px',
          background: 'var(--color-bg)',
        }}
        className="app-main"
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/app" element={<ProtectedRoute>{withBoundary(<Analyzer />)}</ProtectedRoute>} />
            <Route path="/analysis" element={<ProtectedRoute>{withBoundary(<AnalysisResult />)}</ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute>{withBoundary(<Jobs />)}</ProtectedRoute>} />
            <Route path="/cover-letter" element={<ProtectedRoute>{withBoundary(<CoverLetter />)}</ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute>{withBoundary(<Settings />)}</ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}>{withBoundary(<Admin />)}</ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute>{withBoundary(<Profile />)}</ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </Suspense>
      </main>

      <style>{`
        @media (max-width: 1023px) {
          .app-main { padding: 64px 20px 48px !important; }
        }
        @media (max-width: 480px) {
          .app-main { padding: 56px 16px 40px !important; }
        }
      `}</style>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
