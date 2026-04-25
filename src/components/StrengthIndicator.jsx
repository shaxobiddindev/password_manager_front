import { getPasswordStrength } from '../utils/password';

export default function StrengthIndicator({ password }) {
  const { label, color, pct } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs font-mono" style={{ color }}>{label}</p>
    </div>
  );
}
