import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import Logo from '../components/Logo';

// Icons defined before use to avoid TDZ (Temporal Dead Zone) error
const GridIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const UsersIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BriefcaseIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const CashIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ShopIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const SettingsIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LockIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const MenuIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const ChevronLeftIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>;
const ChevronRightIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>;
const OtherIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>;

const NAV = [
  { to: '/vault', label: 'All Items', icon: GridIcon },
  { to: '/vault/social', label: 'Social', icon: UsersIcon },
  { to: '/vault/work', label: 'Work', icon: BriefcaseIcon },
  { to: '/vault/finance', label: 'Finance', icon: CashIcon },
  { to: '/vault/shopping', label: 'Shopping', icon: ShopIcon },
  { to: '/vault/other', label: 'Other', icon: OtherIcon },
];

export default function MainLayout({ children, onSearch, onAddNew }) {
  const { user, role, lockVault } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const isSettings = location.pathname === '/settings';

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLock = () => {
    lockVault();
    navigate('/lock');
  };

  return (
    <div className="flex h-screen bg-[#080c14] overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 h-full
          md:relative
          ${sidebarOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0 md:w-16'}
          shrink-0 border-r border-white/6 bg-[#0a0f1e] flex flex-col transition-all duration-300 ease-in-out
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-[65px] border-b border-white/6 shrink-0">
          <Logo size="sm" />
          <span className={`font-display font-bold text-white text-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>Company Vault</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/vault'}
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>{label}</span>
              
              {/* Tooltip when collapsed */}
              {!sidebarOpen && (
                <div className="fixed left-16 ml-2 px-2 py-1.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-xl shadow-blue-500/20 border border-white/10">
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Settings */}
        <div className="p-2 border-t border-white/6 space-y-1">
          <NavLink
            to="/settings"
            onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
            className={({ isActive }) =>
              `relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all ${isActive ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`
            }
          >
            <SettingsIcon className="w-4 h-4 shrink-0" />
            <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>Settings</span>
            {!sidebarOpen && (
              <div className="fixed left-16 ml-2 px-2 py-1.5 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-xl border border-white/10">
                Settings
              </div>
            )}
          </NavLink>
          
          {role === 'ADMIN' && (
            <NavLink
              to="/audit"
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
              className={({ isActive }) =>
                `relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium transition-all ${isActive ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`
              }
            >
              <i className="fas fa-shield-halved w-4 h-4 shrink-0 text-center"></i>
              <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>Audit Log</span>
              {!sidebarOpen && (
                <div className="fixed left-16 ml-2 px-2 py-1.5 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-xl border border-white/10">
                  Audit Log
                </div>
              )}
            </NavLink>
          )}

          <button
            onClick={handleLock}
            className="relative group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-display font-medium text-slate-500 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
          >
            <LockIcon className="w-4 h-4 shrink-0" />
            <span className={`transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'md:opacity-0 md:hidden'}`}>Lock Vault</span>
            {!sidebarOpen && (
              <div className="fixed left-16 ml-2 px-2 py-1.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-xl shadow-amber-500/20 border border-white/10">
                Lock Vault
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between pl-2 pr-4 sm:pr-6 h-[65px] border-b border-white/6 shrink-0 bg-[#080c14]/80 backdrop-blur-md gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-white bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 transition-all shrink-0 border border-white/10 shadow-sm"
            >
              {sidebarOpen ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
            </button>
            {/* Search */}
            {!isSettings && (
              <div className="relative flex-1 max-w-md">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="input-field rounded-xl pl-9 pr-4 py-2 text-sm w-full"
                  placeholder="Search…"
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Role badge */}
            <span className={`hidden sm:inline-flex text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${role === 'ADMIN' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>
              {role}
            </span>
            {/* Add button — admin only */}
            {!isSettings && (
              <button
                onClick={onAddNew}
                className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-4 sm:py-2 rounded-xl btn-primary text-sm font-display font-semibold text-white"
                title="Add New"
              >
                <svg className="w-4 h-4 sm:mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:block">Add New</span>
              </button>
            )}
            {/* User Info (Only on Settings page) & Avatar */}
            <div className="flex items-center gap-3">
              {isSettings && (
                <div className="hidden md:flex flex-col items-end animate-fadeIn">
                  <span className="text-xs font-display font-bold text-white leading-none">{user?.login || 'User'}</span>
                  <span className="text-[10px] text-slate-500 font-mono leading-tight">{user?.email}</span>
                </div>
              )}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/10 shrink-0">
                <span className="text-xs font-display font-bold text-white">
                  {(user?.login || user?.email || 'U').slice(0, 2).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
