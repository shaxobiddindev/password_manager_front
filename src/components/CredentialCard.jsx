import { useState, useEffect, useRef } from 'react';
import { copyToClipboard } from '../utils/password';
import { useToastStore } from '../store/toastStore';
import { useVaultStore } from '../store/vaultStore';
import { useAuthStore } from '../store/authStore';
import ConfirmModal from './ConfirmModal';

const CATEGORY_COLORS = {
  social: 'text-pink-400 bg-pink-400/10',
  work: 'text-blue-400 bg-blue-400/10',
  finance: 'text-yellow-400 bg-yellow-400/10',
  shopping: 'text-emerald-400 bg-emerald-400/10',
  other: 'text-slate-400 bg-slate-400/10',
};

export default function CredentialCard({ item, onEdit }) {
  const [revealed, setRevealed] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { addToast } = useToastStore();
  const { deleteItem, getItemDetail, recordCopy } = useVaultStore();
  const canEdit = item.isOwner;
  const revealTimer = useRef(null);
  const countdownInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, []);


  const handleCopy = async (label) => {
    try {
      const fullItem = await getItemDetail(item.id);
      await copyToClipboard(fullItem.password);
      await recordCopy(item.id);
      addToast(`${label} copied`, 'copy');
    } catch (e) {
      addToast('Failed to copy password', 'error');
    }
  };

  const handleReveal = async () => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);

    if (!revealed && !revealedPassword) {
      try {
        const fullItem = await getItemDetail(item.id);
        setRevealedPassword(fullItem.password);
      } catch (e) {
        addToast('Failed to fetch password', 'error');
        return;
      }
    }
    
    const nextState = !revealed;
    setRevealed(nextState);

    if (nextState) {
      setTimeLeft(5);
      countdownInterval.current = setInterval(() => {
        setTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
      }, 1000);

      revealTimer.current = setTimeout(() => {
        setRevealed(false);
        setTimeLeft(0);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      }, 5000);
    } else {
      setTimeLeft(0);
    }
  };

  const handleDeleteClick = () => setShowConfirm(true);

  const confirmDelete = async () => {
    try {
      await deleteItem(item.id);
      addToast('Deleted successfully', 'success');
    } catch (e) {
      addToast('Failed to delete', 'error');
    } finally {
      setShowConfirm(false);
    }
  };

  const initials = item.serviceName?.slice(0, 2).toUpperCase() || '??';
  const catColor = CATEGORY_COLORS[item.category?.toLowerCase()] || CATEGORY_COLORS.other;

  return (
    <>
      <div
        className="card-hover relative group rounded-2xl border border-white/8 bg-[#111827] p-5 cursor-pointer select-none"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >

      {/* Quick Copy Overlay */}
      {hovering && (
        <div
          className="absolute inset-0 z-10 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/30 to-blue-800/30 border border-blue-500/20 flex items-center justify-center shrink-0">
            <span className="text-sm font-display font-bold text-blue-300">{initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-white text-sm truncate">{item.serviceName}</h3>
            {item.url && <p className="text-xs text-slate-500 truncate">{item.url}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold ${catColor}`}>
            {item.category || 'other'}
          </span>
          <div className="flex flex-wrap justify-end gap-1">
            {item.shareWithAdmins && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center gap-1">
                <i className="fas fa-user-shield text-[8px]"></i> Admin
              </span>
            )}
            {item.sharedWithUsernames?.length > 0 ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold flex items-center gap-1">
                <i className="fas fa-users text-[8px]"></i> {item.sharedWithUsernames.length} User{item.sharedWithUsernames.length !== 1 ? 's' : ''}
              </span>
            ) : !item.shareWithAdmins ? (
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-500/10 text-slate-500 border border-slate-500/20 font-bold flex items-center gap-1">
                <i className="fas fa-lock text-[8px]"></i> Private
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Reuse Warning */}
      {item.reuseCount > 0 && (
        <div className="mt-2 text-[10px] font-display text-amber-500/80 bg-amber-500/10 px-2 py-1.5 rounded-lg flex items-center gap-1.5 border border-amber-500/20">
          <i className="fas fa-triangle-exclamation"></i>
          This password is used in {item.reuseCount} other {item.reuseCount === 1 ? 'place' : 'places'}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {/* Username */}
        <div className="flex items-center justify-between rounded-lg bg-white/4 border border-white/6 px-3 py-2">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 mb-0.5">Username</p>
            <p className="text-sm font-mono text-slate-300 truncate">{item.username}</p>
          </div>
          <button
            onClick={async () => {
              await copyToClipboard(item.username);
              addToast('Username copied', 'copy');
            }}
            className="ml-2 shrink-0 p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-all"
            title="Copy username"
          >
            <CopyIcon />
          </button>
        </div>

        {/* Password */}
        <div className="flex items-center justify-between rounded-lg bg-white/4 border border-white/6 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-500 mb-0.5">Password</p>
            <p className={`text-sm font-mono truncate transition-all duration-300 ${revealed ? 'text-white' : 'text-slate-600'}`}>
              {revealed ? revealedPassword : '••••••••••••'}
            </p>
            {revealed && timeLeft > 0 && (
              <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-md font-mono border border-blue-500/20 animate-pulse">
                {timeLeft}s
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            <button
              onClick={handleReveal}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-all"
              title={revealed ? 'Hide' : 'Reveal'}
            >
              {revealed ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            <button
              onClick={() => handleCopy('Password')}
              className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-500 hover:text-blue-400 transition-all"
              title="Copy password"
            >
              <CopyIcon />
            </button>
          </div>
        </div>

        {/* Owner Info */}
        <div className="flex items-center justify-between px-1 pt-1">
          <p className="text-[10px] text-slate-600 flex items-center gap-1">
            <i className="fas fa-circle-user text-[8px]"></i>
            Added by <span className={item.isOwner ? 'text-blue-400 font-bold' : 'text-slate-400'}>{item.isOwner ? 'You' : item.ownerName}</span>
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-white/6">
        {canEdit && (
          <button
            onClick={() => onEdit(item)}
            className="flex-1 py-1.5 rounded-lg text-xs font-display font-semibold text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => handleCopy('Password')}
          className="flex-1 py-1.5 rounded-lg text-xs font-display font-semibold text-blue-400 hover:text-white hover:bg-blue-500/20 transition-all"
        >
          <i className="fas fa-bolt mr-1.5"></i> Quick Copy
        </button>
        {canEdit && (
          <button
            onClick={handleDeleteClick}
            className="p-2.5 rounded-xl border border-red-500/10 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shrink-0"
          >
            <i className="fas fa-trash-can text-sm"></i>
          </button>
        )}
      </div>
    </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Delete Credential"
        message={`Are you sure you want to delete "${item.serviceName}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

const CopyIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
