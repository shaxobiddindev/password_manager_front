import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); // Prevent page refresh
    if (!form.username || !form.password) return;
    setLoading(true);
    try {
      await login(form.username, form.password);
      addToast('Welcome back!', 'success');
      navigate('/lock');
    } catch (e) {
      setForm(p => ({ ...p, password: '' })); // Clear password on error
      const data = e.response?.data;
      if (data?.details && typeof data.details === 'object') {
        const errorMsgs = Object.values(data.details).join(', ');
        addToast(errorMsgs, 'error');
      } else {
        addToast(data?.message || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="noise" />

      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="animate-fadeIn relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Logo size="lg" className="mb-5" />
          <h1 className="font-display text-2xl font-bold text-white">Company Vault</h1>
          <p className="text-sm text-slate-500 mt-1">Secure credential management</p>
        </div>

        {/* Card Form */}
        <form 
          onSubmit={handleLogin}
          className="rounded-2xl border border-white/8 bg-[#0d1424]/80 backdrop-blur-xl p-8 space-y-5"
        >
          <div>
            <label className="text-xs text-slate-400 font-display mb-2 block">Username</label>
            <input
              className="input-field w-full rounded-xl px-4 py-3 text-sm"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-display mb-2 block">Password</label>
            <div className="relative">
              <input
                className="input-field w-full rounded-xl px-4 py-3 text-sm pr-11"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-white transition-all"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-primary font-display font-semibold text-white text-sm disabled:opacity-50 transition-all"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Signing in
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-slate-500 font-display">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
              Create account
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">Protected by end-to-end encryption</p>
      </div>
    </div>
  );
}
