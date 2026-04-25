import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import Logo from '../components/Logo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await register({
        login: formData.login,
        email: formData.email,
        password: formData.password
      });
      addToast('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (e) {
      const data = e.response?.data;
      if (data?.details && typeof data.details === 'object') {
        const errorMsgs = Object.values(data.details).join(', ');
        addToast(errorMsgs, 'error');
      } else {
        addToast(data?.message || 'Registration failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="noise" />
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="animate-fadeIn relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" className="mb-4 mx-auto" />
          <h1 className="font-display text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 text-sm">Join Company Vault and secure your digital life</p>
        </div>

        <form onSubmit={handleRegister} className="rounded-3xl border border-white/10 bg-[#0d1424]/80 backdrop-blur-2xl p-8 shadow-2xl shadow-black/50 space-y-5">
          <div className="space-y-4">
            {/* Login */}
            <div>
              <label className="text-xs font-display font-semibold text-slate-400 mb-1.5 block ml-1 uppercase tracking-wider">Username</label>
              <div className="relative">
                <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  required
                  className="input-field w-full rounded-xl pl-11 pr-4 py-3 text-sm"
                  placeholder="Choose a username"
                  value={formData.login}
                  onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-display font-semibold text-slate-400 mb-1.5 block ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  required
                  type="email"
                  className="input-field w-full rounded-xl pl-11 pr-4 py-3 text-sm"
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-display font-semibold text-slate-400 mb-1.5 block ml-1 uppercase tracking-wider">Password</label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="input-field w-full rounded-xl pl-11 pr-12 py-3 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-display font-semibold text-slate-400 mb-1.5 block ml-1 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <i className="fas fa-shield-halved absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  className="input-field w-full rounded-xl pl-11 pr-4 py-3 text-sm"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl btn-primary text-white font-display font-bold text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Creating Account...
              </span>
            ) : 'Sign Up'}
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-500 font-display">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
