import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { useToastStore } from '../store/toastStore';
import StrengthIndicator from './StrengthIndicator';
import PasswordGenerator from './PasswordGenerator';

const CATEGORIES = ['social', 'work', 'finance', 'shopping', 'other'];

const CATEGORY_ICONS = {
  social: 'fa-users',
  work: 'fa-briefcase',
  finance: 'fa-wallet',
  shopping: 'fa-bag-shopping',
  other: 'fa-ellipsis',
};

export default function CredentialFormModal({ item, onClose }) {
  const isEdit = !!item;
  const { addItem, updateItem, checkReuse } = useVaultStore();
  const { addToast } = useToastStore();
  const [showGen, setShowGen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [reuseInfo, setReuseInfo] = useState(null);   // { reused, count, items }
  const [reuseExpanded, setReuseExpanded] = useState(false);
  const debounceRef = useRef(null);

  const [form, setForm] = useState({
    serviceName: '',
    url: '',
    username: '',
    password: '',
    category: 'other',
  });

  useEffect(() => {
    if (item) {
      setForm({
        serviceName: item.serviceName || '',
        url: item.url || '',
        username: item.username || '',
        password: item.password || '',
        category: item.category || 'other',
      });
    }
  }, [item]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Real-time reuse check with debounce (500ms)
  const runReuseCheck = useCallback(async (password) => {
    if (password.length < 4) { setReuseInfo(null); return; }
    try {
      const result = await checkReuse(password, isEdit ? item?.id : null);
      setReuseInfo(result);
      setReuseExpanded(false);
    } catch (_) {}
  }, [checkReuse, isEdit, item]);

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    set('password', val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runReuseCheck(val), 500);
  };

  const handleSubmit = async () => {
    if (!form.serviceName || !form.username || !form.password) {
      addToast('Please fill required fields', 'error');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await updateItem(item.id, form);
        addToast('Credential updated ✓', 'success');
      } else {
        await addItem(form);
        addToast('Credential added', 'success');
      }
      onClose();
    } catch (e) {
      addToast(e.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-popIn relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h2 className="font-display font-bold text-white">{isEdit ? 'Edit Credential' : 'New Credential'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-slate-500 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Service Name */}
          <div>
            <label className="text-xs text-slate-400 font-display mb-1.5 block">Service Name *</label>
            <input className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="e.g. GitHub" value={form.serviceName} onChange={(e) => set('serviceName', e.target.value)} />
          </div>

          {/* URL */}
          <div>
            <label className="text-xs text-slate-400 font-display mb-1.5 block">URL</label>
            <input className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="https://github.com" value={form.url} onChange={(e) => set('url', e.target.value)} />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs text-slate-400 font-display mb-1.5 block">Username *</label>
            <input className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="johndoe@email.com" value={form.username} onChange={(e) => set('username', e.target.value)} />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-slate-400 font-display">Password *</label>
              <button
                type="button"
                onClick={() => setShowGen((v) => !v)}
                className="text-xs text-blue-400 hover:text-blue-300 font-display transition-colors"
              >
                {showGen ? 'Hide Generator' : '⚡ Generate'}
              </button>
            </div>
            <div className="relative">
              <input
                className="input-field w-full rounded-xl px-4 py-2.5 text-sm pr-10 font-mono"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={form.password}
                onChange={handlePasswordChange}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-white transition-all"
              >
                <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
              </button>
            </div>
            <StrengthIndicator password={form.password} />

            {/* ─── Reuse Warning ─────────────────────────────────── */}
            {reuseInfo?.reused && (
              <div className="mt-2 rounded-xl border border-amber-500/25 bg-amber-500/8 overflow-hidden">
                {/* Summary row */}
                <button
                  type="button"
                  onClick={() => setReuseExpanded((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-amber-500/5 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <i className="fas fa-triangle-exclamation text-amber-400 text-xs"></i>
                    <span className="text-xs text-amber-300 font-display font-medium">
                      Used in {reuseInfo.count} other {reuseInfo.count === 1 ? 'place' : 'places'}
                    </span>
                  </div>
                  <i className={`fas fa-chevron-${reuseExpanded ? 'up' : 'down'} text-amber-500 text-[10px] transition-transform`}></i>
                </button>

                {/* Expanded list */}
                {reuseExpanded && (
                  <div className="px-3 pb-3 space-y-1.5 border-t border-amber-500/15">
                    <p className="text-[10px] text-amber-600 font-mono pt-2 mb-2">
                      SECURITY NOTE: Only service metadata is shown. Passwords are never exposed.
                    </p>
                    {reuseInfo.items.map((i) => (
                      <div
                        key={i.id}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10"
                      >
                        <span className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
                          <i className={`fas ${CATEGORY_ICONS[i.category] || 'fa-key'} text-amber-400 text-[10px]`}></i>
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-display font-semibold text-amber-200 truncate">{i.serviceName}</p>
                          <p className="text-[10px] text-amber-600 font-mono capitalize">{i.category}</p>
                        </div>
                      </div>
                    ))}
                    <div className="pt-1 flex items-center gap-1.5">
                      <i className="fas fa-lightbulb text-amber-500 text-[10px]"></i>
                      <p className="text-[10px] text-amber-600 font-display">
                        Consider using a unique password for each service.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generator */}
          {showGen && <PasswordGenerator onUse={(pwd) => { set('password', pwd); setShowGen(false); runReuseCheck(pwd); }} />}

          {/* Category */}
          <div>
            <label className="text-xs text-slate-400 font-display mb-1.5 block">Category</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('category', c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono capitalize border transition-all ${form.category === c ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-white/4 border-white/10 text-slate-500 hover:text-slate-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold text-white btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Credential'}
          </button>
        </div>
      </div>
    </div>
  );
}
