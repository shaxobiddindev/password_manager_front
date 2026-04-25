import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import Logo from '../components/Logo';

export default function LockPage() {
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { unlockVault, user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const inputRef = useRef();

  const handleUnlock = async () => {
    if (!password) return;
    setLoading(true);
    try {
      await unlockVault(password);
      addToast('Vault unlocked', 'success');
      navigate('/vault');
    } catch (e) {
      setShake(true);
      setPassword('');
      setTimeout(() => { setShake(false); inputRef.current?.focus(); }, 600);
      addToast('Wrong master password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4 relative overflow-hidden">
      <div className="noise" />

      {/* Orbs */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-60 h-60 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="animate-fadeIn relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <Logo size="lg" className="mb-5" variant="emerald" />
            <span className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping -z-10" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Vault Locked</h1>
          <p className="text-sm text-slate-500 mt-1">
            {user ? `Signed in as ${user.username}` : 'Enter master password to unlock'}
          </p>
        </div>

        <div className={`rounded-2xl border border-white/8 bg-[#0d1424]/80 backdrop-blur-xl p-8 space-y-5 ${shake ? 'animate-shake' : ''}`}>
          <div>
            <label className="text-xs text-slate-400 font-display mb-2 block">Master Password</label>
            <div className="relative">
              <input
                ref={inputRef}
                className="input-field w-full rounded-xl px-4 py-3 text-sm pr-11"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                autoFocus
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
            onClick={handleUnlock}
            disabled={loading || !password}
            className="w-full py-3 rounded-xl font-display font-semibold text-white text-sm disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Unlocking…
              </span>
            ) : <><i className="fas fa-unlock-alt mr-2"></i> Unlock Vault</>}
          </button>

          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors font-display"
          >
            Sign in with different account
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Auto-locks after 5 minutes of inactivity
        </div>
      </div>
    </div>
  );
}
