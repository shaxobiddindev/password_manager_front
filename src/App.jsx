import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import LockPage from './pages/LockPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import ToastContainer from './components/Toast';

function ProtectedRoute({ children, requireUnlocked = false }) {
  const { token, isUnlocked } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (requireUnlocked && !isUnlocked) return <Navigate to="/lock" replace />;
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname}>
      <Routes location={location}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/lock" element={
          <ProtectedRoute><LockPage /></ProtectedRoute>
        } />
        <Route path="/vault" element={
          <ProtectedRoute requireUnlocked><VaultPage /></ProtectedRoute>
        } />
        <Route path="/vault/:category" element={
          <ProtectedRoute requireUnlocked><VaultPage /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requireUnlocked><SettingsPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe().catch(() => {});
  }, [token]);

  return (
    <BrowserRouter>
      <AnimatedRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
}
