export function generatePassword(length = 16, opts = { upper: true, digits: true, symbols: true }) {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  let chars = lower;
  if (opts.upper) chars += upper;
  if (opts.digits) chars += digits;
  if (opts.symbols) chars += symbols;

  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: 'None', color: '#4b5d78' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#ef4444', pct: 25 };
  if (score <= 4) return { score, label: 'Fair', color: '#f59e0b', pct: 55 };
  if (score <= 5) return { score, label: 'Strong', color: '#10b981', pct: 80 };
  return { score, label: 'Very Strong', color: '#06d6a0', pct: 100 };
}

export async function copyToClipboard(text) {
  await navigator.clipboard.writeText(text);
}
