
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, AuthState } from './types';
import { authService } from './services/authService';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import DiabetesTest from './components/DiabetesTest';
import UziAnalysis from './components/UziAnalysis';
import Navigation from './components/Navigation';
import AdminPanel from './components/AdminPanel';

import DoctorsList from './components/DoctorsList';
import ProfilePage from './components/ProfilePage';
import ChatPage from './components/ChatPage';
import DoctorConclusions from './components/DoctorConclusions';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true });
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setAuthState({ user, isAuthenticated: true });
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState({ user: null, isAuthenticated: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600 border-r-4 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        {authState.isAuthenticated && (
          <Navigation user={authState.user} onLogout={handleLogout} />
        )}

        <main className="flex-grow">
          <Routes>
            <Route
              path="/login"
              element={!authState.isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
            />
            <Route
              path="/register"
              element={!authState.isAuthenticated ? <Register /> : <Navigate to="/" />}
            />
            <Route
              path="/"
              element={authState.isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/diabetes"
              element={authState.isAuthenticated ? <DiabetesTest /> : <Navigate to="/login" />}
            />
            <Route
              path="/uzi"
              element={authState.isAuthenticated ? <UziAnalysis /> : <Navigate to="/login" />}
            />
            <Route
              path="/doctors"
              element={authState.isAuthenticated ? <DoctorsList currentUser={authState.user!} /> : <Navigate to="/login" />}
            />
            <Route
              path="/admin"
              element={authState.isAuthenticated && (authState.user?.role === 'admin' || authState.user?.role === 'super_admin') ? <AdminPanel /> : <Navigate to="/" />}
            />
            <Route
              path="/profile"
              element={authState.isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/chat"
              element={authState.isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
            />
            <Route
              path="/conclusions"
              element={authState.isAuthenticated ? <DoctorConclusions /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>

        <footer className="bg-white/80 backdrop-blur-md border-t py-8 text-center text-slate-400">
          <div className="max-w-4xl mx-auto px-4">
            <p className="font-bold text-sm">© {new Date().getFullYear()} PnevmoScan AI & Health. Barcha huquqlar himoyalangan.</p>
            <p className="mt-2 text-xs leading-relaxed">
              Diqqat: Sun'iy intellekt xulosalari faqat ma'lumot berish maqsadida yaratilgan.
              Har qanday tibbiy qaror qabul qilishdan oldin malakali shifokor bilan maslahatlashish shart.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
