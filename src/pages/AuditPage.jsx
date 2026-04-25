import { useState, useEffect } from 'react';
import { useVaultStore } from '../store/vaultStore';
import MainLayout from '../layouts/MainLayout';
import Logo from '../components/Logo';

const ACTION_COLORS = {
  VIEW: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  COPY: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  CREATE: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  UPDATE: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  DELETE: 'text-red-400 bg-red-500/10 border-red-500/20',
  LOGIN: 'text-slate-400 bg-white/5 border-white/10',
  REGISTER: 'text-white bg-blue-600/20 border-blue-500/30',
};

const ACTION_ICONS = {
  VIEW: 'fa-eye',
  COPY: 'fa-copy',
  CREATE: 'fa-plus',
  UPDATE: 'fa-pen',
  DELETE: 'fa-trash',
  LOGIN: 'fa-sign-in-alt',
  REGISTER: 'fa-user-plus',
};

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchAllLogs } = useVaultStore();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAllLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 shadow-lg shadow-purple-500/10">
                <i className="fas fa-shield-halved text-purple-400"></i>
              </div>
              Audit Activity
            </h1>
            <p className="text-sm text-slate-500 mt-1">Monitor all system actions and security events</p>
          </div>
          <button 
            onClick={loadLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-display animate-pulse">Loading audit trail...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="group p-4 rounded-2xl bg-[#0d1424]/80 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-105 ${ACTION_COLORS[log.action] || ACTION_COLORS.LOGIN}`}>
                    <i className={`fas ${ACTION_ICONS[log.action] || 'fa-info-circle'} text-sm`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white font-display">{log.username}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold uppercase tracking-widest ${ACTION_COLORS[log.action] || ACTION_COLORS.LOGIN}`}>
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{log.details}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-slate-400 mb-0.5">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                  <div className="text-[10px] text-slate-600 font-medium">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-20 bg-white/2 rounded-3xl border border-dashed border-white/10">
                <i className="fas fa-ghost text-4xl text-slate-700 mb-4 block"></i>
                <p className="text-slate-500 font-display">No activity recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
