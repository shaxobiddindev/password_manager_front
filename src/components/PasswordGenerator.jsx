import { useState } from 'react';
import { generatePassword } from '../utils/password';
import StrengthIndicator from './StrengthIndicator';

export default function PasswordGenerator({ onUse }) {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, digits: true, symbols: true });
  const [generated, setGenerated] = useState('');

  const generate = () => setGenerated(generatePassword(length, opts));

  const toggle = (key) => setOpts((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-display text-slate-300 font-semibold">Password Generator</span>
        <span className="text-xs font-mono text-blue-400">{length} chars</span>
      </div>

      <input
        type="range" min={8} max={64} value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="w-full accent-blue-500 cursor-pointer"
      />

      <div className="flex gap-2 flex-wrap">
        {[['upper', 'A–Z'], ['digits', '0–9'], ['symbols', '#@!']].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => toggle(k)}
            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all ${opts[k] ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-slate-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={generate}
        className="w-full py-2 rounded-xl btn-primary text-sm font-display font-semibold text-white"
      >
        <i className="fas fa-bolt mr-2"></i> Generate
      </button>

      {generated && (
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-black/30 border border-white/10 px-3 py-2 gap-2">
            <span className="font-mono text-xs text-emerald-300 truncate flex-1">{generated}</span>
            <button
              type="button"
              onClick={() => onUse(generated)}
              className="text-xs text-blue-400 hover:text-blue-300 font-display font-semibold shrink-0"
            >
              Use
            </button>
          </div>
          <StrengthIndicator password={generated} />
        </div>
      )}
    </div>
  );
}
