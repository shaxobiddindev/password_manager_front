import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useVaultStore } from '../store/vaultStore';
import api from '../api/axios';

export default function SettingsPage() {
  const { user, role, changePassword, autoLockTime, setAutoLockTime, saveSettings } = useAuthStore();
  const { addToast } = useToastStore();
  const { exportVault } = useVaultStore();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [showPws, setShowPws] = useState({ current: false, next: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePw = async () => {
    if (pwForm.next !== pwForm.confirm) { addToast('Passwords do not match', 'error'); return; }
    if (!pwForm.current || !pwForm.next) { addToast('Please fill all fields', 'error'); return; }
    setLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      addToast('Master password updated', 'success');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportVault();
      addToast('Vault exported', 'success');
    } catch (e) {
      addToast('Export failed', 'error');
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveSettings();
      addToast('Settings saved to cloud ✓', 'success');
    } catch (e) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-2xl animate-fadeIn">
        <h2 className="font-display font-bold text-white text-xl mb-6">Settings</h2>

        <div className="space-y-6">
          {/* Change master password */}
          <section className="rounded-2xl border border-white/8 bg-[#111827] p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </span>
              Change Master Password
            </h3>
            <div className="space-y-3">
              {[['current', 'Current Password'], ['next', 'New Password'], ['confirm', 'Confirm New Password']].map(([k, label]) => (
                <div key={k}>
                  <label className="text-xs text-slate-400 font-display mb-1.5 block">{label}</label>
                  <div className="relative">
                    <input
                      className="input-field w-full rounded-xl px-4 py-2.5 text-sm pr-11"
                      type={showPws[k] ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={pwForm[k]}
                      onChange={(e) => setPwForm((p) => ({ ...p, [k]: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPws(p => ({ ...p, [k]: !p[k] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-500 hover:text-white transition-all"
                    >
                      <i className={`fas ${showPws[k] ? 'fa-eye-slash' : 'fa-eye'} text-[10px]`}></i>
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleChangePw}
                disabled={loading}
                className="mt-2 px-6 py-2.5 rounded-xl btn-primary font-display font-semibold text-white text-sm disabled:opacity-50"
              >
                {loading ? 'Updating' : 'Update Password'}
              </button>
            </div>
          </section>

          {/* Auto-lock */}
          <section className="rounded-2xl border border-white/8 bg-[#111827] p-6">
            <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              Auto-Lock Timer
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400 font-display">Lock after</span>
                <span className="font-mono text-blue-400 text-sm">{autoLockTime} min</span>
              </div>
              <input
                type="range" min={1} max={60} value={autoLockTime}
                onChange={(e) => setAutoLockTime(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-600 font-mono">
                <span>1 min</span><span>60 min</span>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="mt-4 w-full py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 font-display font-semibold text-sm hover:bg-blue-500/20 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Timer Setting'}
              </button>
            </div>
          </section>

          {/* Export */}
          <section className="rounded-2xl border border-white/8 bg-[#111827] p-6">
            <h3 className="font-display font-semibold text-white mb-2 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              Export Data
            </h3>
            <p className="text-xs text-slate-500 mb-4">Download all your credentials as a JSON file.</p>
            <button
              onClick={handleExport}
              className="px-6 py-2.5 rounded-xl font-display font-semibold text-emerald-400 text-sm border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all"
            >
              Export Vault
            </button>
          </section>

          {/* Account Info */}
          <section className="rounded-2xl border border-white/8 bg-[#111827] p-6">
            <h3 className="font-display font-semibold text-white mb-4">Account Profile</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20 border border-white/10">
                {(user?.login || user?.email || 'U').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-display font-bold text-white text-lg leading-tight">{user?.login || 'User'}</p>
                <p className="text-sm text-slate-500 font-mono mb-1">{user?.email}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${role === 'ADMIN' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>
                  {role}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
