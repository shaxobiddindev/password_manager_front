export default function Logo({ size = 'md', className = '', style = {}, variant = 'blue' }) {
  const sizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-16 h-16 rounded-2xl',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const baseClass = sizes[size];
  const gradientClass = variant === 'emerald' 
    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 glow-emerald' 
    : 'bg-gradient-to-br from-blue-500 to-indigo-700 glow-blue';

  return (
    <div 
      className={`${baseClass} ${gradientClass} flex items-center justify-center shrink-0 ${className}`}
      style={style}
    >
      <i className={`fas fa-shield-halved text-white ${iconSizes[size]}`}></i>
    </div>
  );
}
