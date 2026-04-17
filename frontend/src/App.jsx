import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingBlobs from './components/FloatingBlobs';
import Landing from './pages/Landing';
import Analyzer from './pages/Analyzer';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          {/* Ambient floating background blobs - essential for Claymorphism */}
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
  );
}

export default App;
