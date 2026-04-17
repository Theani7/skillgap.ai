import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingBlobs from './components/FloatingBlobs';
import Landing from './pages/Landing';
import Analyzer from './pages/Analyzer';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import CoverLetter from './pages/CoverLetter';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-shell">
            <FloatingBlobs />

            <Navbar />

            <main className="main-content" style={{ paddingTop: '24px' }}>
              <Routes>
                {/* Public Marketing Page */}
                <Route path="/" element={<Landing />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Tool Dashboard - Protected */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Analyzer />
                  </ProtectedRoute>
                } />

                {/* Jobs Application Tracker */}
                <Route path="/jobs" element={
                  <ProtectedRoute>
                    <Jobs />
                  </ProtectedRoute>
                } />

                {/* Cover Letter Generator */}
                <Route path="/cover-letter" element={
                  <ProtectedRoute>
                    <CoverLetter />
                  </ProtectedRoute>
                } />

                {/* Settings */}
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />

                {/* Admin Dashboard - Protected */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <Admin />
                    </ProtectedRoute>
                  }
                />

                {/* User Dashboard - Protected */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>

            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;