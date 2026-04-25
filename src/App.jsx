import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LockPage from './pages/LockPage';
import VaultPage from './pages/VaultPage';
import SettingsPage from './pages/SettingsPage';
import ToastContainer from './components/Toast';
import useAutoLock from './hooks/useAutoLock';

function ProtectedRoute({ children, requireUnlocked = false }) {
  const { token, isUnlocked } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (requireUnlocked && !isUnlocked) return <Navigate to="/lock" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token, isUnlocked } = useAuthStore();
  if (token) {
    return <Navigate to={isUnlocked ? "/vault" : "/lock"} replace />;
  }
  return children;
}

function AppContent() {
  const location = useLocation();
  useAutoLock();

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
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
  );
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe().catch(() => {});
  }, [token]);

  return (
    <BrowserRouter>
      <AppContent />
      <ToastContainer />
    </BrowserRouter>
  );
}
