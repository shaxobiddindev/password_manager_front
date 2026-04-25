import { useState, useEffect, useCallback, useRef } from 'react';
import { useVaultStore } from '../store/vaultStore';
import { useAuthStore } from '../store/authStore';
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

export default function CredentialFormModal({ isOpen, item, onClose }) {
  if (!isOpen) return null;
  const isEdit = !!item;
  const { addItem, updateItem, checkReuse } = useVaultStore();
  const { addToast } = useToastStore();
  const [showGen, setShowGen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [reuseInfo, setReuseInfo] = useState(null);   // { reused, count, items }
  const [reuseExpanded, setReuseExpanded] = useState(false);
  const [userInput, setUserInput] = useState('');
  const debounceRef = useRef(null);

  const [form, setForm] = useState({
    serviceName: '',
    url: '',
    username: '',
    password: '',
    category: 'other',
    sharedWith: [],
    shareWithAdmins: false,
  });

  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errors, setErrors] = useState({});
  const { fetchItemLogs } = useVaultStore();

  useEffect(() => {
    if (item) {
      setForm({
        serviceName: item.serviceName || '',
        url: item.url || '',
        username: item.username || '',
        password: item.password || '',
        category: item.category || 'other',
        sharedWith: item.sharedWithUsernames || [],
        shareWithAdmins: item.shareWithAdmins || false,
      });
      loadLogs(item.id);
    } else {
      setLogs([]);
      setForm({
        serviceName: '',
        url: '',
        username: '',
        password: '',
        category: 'other',
        sharedWith: [],
        shareWithAdmins: false,
      });
    }
    setUserInput('');
    setErrors({});
  }, [item]);

  const loadLogs = async (id) => {
    setLoadingLogs(true);
    try {
      const data = await fetchItemLogs(id);
      setLogs(data.slice(0, 5)); // Show last 5 logs
    } catch (e) {
      console.error('Failed to fetch logs', e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchDebounceRef = useRef(null);
  const { checkUser, searchUsers } = useAuthStore();

  const handleUserInput = (val) => {
    setUserInput(val);
    clearTimeout(searchDebounceRef.current);
    
    if (val.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await searchUsers(val);
        // Filter out users already in sharedWith or current user
        const { user } = useAuthStore.getState();
        const filtered = data.filter(u => 
          !form.sharedWith.includes(u.username) && 
          !form.sharedWith.includes(u.email) &&
          u.username !== user.login &&
          u.email !== user.email
        );
        setSuggestions(filtered);
      } catch (e) {
        console.error('Search failed', e);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const addUser = async (selectedUser = null) => {
    const query = selectedUser ? (selectedUser.username || selectedUser.email) : userInput.trim();
    if (!query) return;
    
    if (form.sharedWith.includes(query)) {
      addToast('User already in list', 'info');
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      let result;
      if (selectedUser) {
        result = { found: true, ...selectedUser };
      } else {
        result = await checkUser(query);
      }

      if (result.found) {
        const identifier = result.username || result.email;
        if (form.sharedWith.includes(identifier)) {
           addToast('User already in list', 'info');
        } else {
           set('sharedWith', [...form.sharedWith, identifier]);
           addToast(`Added: ${identifier}`, 'success');
        }
        setUserInput('');
        setSuggestions([]);
      } else {
        addToast('User not found in system', 'error');
      }
    } catch (e) {
      addToast('Error verifying user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeUser = (user) => {
    set('sharedWith', form.sharedWith.filter(u => u !== user));
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    set('password', val);
    setErrors(p => ({...p, password: false}));
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runReuseCheck(val), 500);
  };

  const runReuseCheck = useCallback(async (password) => {
    if (password.length < 4) { setReuseInfo(null); return; }
    try {
      const result = await checkReuse(password, isEdit ? item?.id : null);
      setReuseInfo(result);
      setReuseExpanded(false);
    } catch (_) {}
  }, [checkReuse, isEdit, item]);

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.serviceName) newErrors.serviceName = true;
    if (!form.username) newErrors.username = true;
    if (!form.password) newErrors.password = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast('Please fill all required fields', 'error');
      return;
    }
    
    setErrors({});
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
            <input 
              className={`input-field w-full rounded-xl px-4 py-2.5 text-sm transition-all ${errors.serviceName ? '!border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}`} 
              placeholder="e.g. Google, Facebook" 
              value={form.serviceName} 
              onChange={(e) => { set('serviceName', e.target.value); setErrors(p => ({...p, serviceName: false})); }} 
            />
            {errors.serviceName && <p className="text-[10px] text-red-500 mt-1 ml-1 animate-fadeIn">Service name is required</p>}
          </div>

          {/* URL */}
          <div>
            <label className="text-xs text-slate-400 font-display mb-1.5 block">URL</label>
            <input className="input-field w-full rounded-xl px-4 py-2.5 text-sm" placeholder="https://github.com" value={form.url} onChange={(e) => set('url', e.target.value)} />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs text-slate-400 font-display mb-1.5 block">Username / Email *</label>
            <input 
              className={`input-field w-full rounded-xl px-4 py-2.5 text-sm transition-all ${errors.username ? '!border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}`} 
              placeholder="johndoe@email.com" 
              value={form.username} 
              onChange={(e) => { set('username', e.target.value); setErrors(p => ({...p, username: false})); }} 
            />
            {errors.username && <p className="text-[10px] text-red-500 mt-1 ml-1 animate-fadeIn">Username is required</p>}
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
                className={`input-field w-full rounded-xl px-4 py-2.5 text-sm pr-10 font-mono transition-all ${errors.password ? '!border-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : ''}`}
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
            {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1 animate-fadeIn">Password is required</p>}
            <StrengthIndicator password={form.password} />
            
            {reuseInfo?.reused && (
              <div className="mt-2 rounded-xl border border-amber-500/25 bg-amber-500/8 overflow-hidden">
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
                  <i className={`fas fa-chevron-${reuseExpanded ? 'up' : 'down'} text-amber-500 text-[10px]`}></i>
                </button>
                {reuseExpanded && (
                  <div className="px-3 pb-3 space-y-1.5 border-t border-amber-500/15">
                    {reuseInfo.items.map((i) => (
                      <div key={i.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <span className="w-6 h-6 rounded-md bg-amber-500/15 flex items-center justify-center shrink-0">
                          <i className={`fas ${CATEGORY_ICONS[i.category] || 'fa-key'} text-amber-400 text-[10px]`}></i>
                        </span>
                        <p className="text-xs font-display font-semibold text-amber-200 truncate">{i.serviceName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

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

          {/* ─── Granular Sharing ─────────────────────────────────── */}
          <div className="pt-4 border-t border-white/6 space-y-4">
            <h3 className="text-xs font-display font-bold text-white flex items-center gap-2">
              <i className="fas fa-share-nodes text-blue-400"></i> Sharing & Permissions
            </h3>

            {/* Share with Admin Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/4 border border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <i className="fas fa-user-shield text-red-400 text-xs"></i>
                </div>
                <div>
                  <p className="text-xs font-display font-bold text-white">Share with Admins</p>
                  <p className="text-[10px] text-slate-500">Allow all administrators to access this</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => set('shareWithAdmins', !form.shareWithAdmins)}
                className={`w-10 h-5 rounded-full relative transition-all ${form.shareWithAdmins ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.shareWithAdmins ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            {/* Share with Specific Users */}
            <div className="relative">
              <label className="text-[10px] text-slate-500 font-display mb-1.5 block uppercase tracking-wider">Share with users (Login or Email)</label>
              <div className="relative mb-2">
                <input
                  className="input-field w-full rounded-xl px-4 py-2.5 text-sm"
                  placeholder="Type to search users..."
                  value={userInput}
                  onChange={(e) => handleUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 border-2 border-blue-500/50 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Suggestions Dropdown */}
              {(suggestions.length > 0 || (userInput.trim().length >= 2 && !searching && suggestions.length === 0)) && (
                <div className="absolute z-20 left-0 right-0 top-[calc(100%-8px)] mt-1 rounded-xl border border-white/10 bg-[#1a2333] shadow-2xl overflow-hidden animate-popIn">
                  {suggestions.length > 0 ? (
                    suggestions.map((u, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addUser(u)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-500/10 border-b border-white/5 last:border-0 transition-all group text-left"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-display font-bold text-white group-hover:text-blue-300 transition-colors">{u.username}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                        </div>
                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:border-blue-500 transition-all">
                          <i className="fas fa-plus text-[10px] text-blue-400 group-hover:text-white"></i>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center">
                      <i className="fas fa-user-slash text-slate-600 mb-2 block"></i>
                      <p className="text-[11px] text-slate-500 font-display">No users found matching "{userInput}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Shared Users List */}
              <div className="flex flex-wrap gap-2">
                {form.sharedWith.map(user => (
                  <div key={user} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10 group">
                    <span className="text-[10px] text-slate-300 font-mono">{user}</span>
                    <button
                      type="button"
                      onClick={() => removeUser(user)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <i className="fas fa-times text-[10px]"></i>
                    </button>
                  </div>
                ))}
                {form.sharedWith.length === 0 && (
                  <p className="text-[10px] text-slate-600 italic py-1">No specific users added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Activity Section */}
          {item && (
            <div className="pt-4 border-t border-white/6">
              <label className="text-xs text-slate-400 font-display flex items-center gap-2 mb-3">
                <i className="fas fa-history text-[10px]"></i> Recent Activity
              </label>
              <div className="space-y-2">
                {logs.length > 0 ? (
                  logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300"><span className="text-slate-500">{log.username}</span> {log.action.toLowerCase()}ed</span>
                      <span className="text-slate-600">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))
                ) : <p className="text-[10px] text-slate-600 italic">No activity yet.</p>}
              </div>
            </div>
          )}
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
