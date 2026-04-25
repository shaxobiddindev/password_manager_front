import React from 'react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", confirmColor = "red" }) {
  if (!isOpen) return null;

  const getButtonColorClass = () => {
    switch (confirmColor) {
      case 'red':
        return 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20';
      case 'amber':
        return 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20';
      case 'blue':
      default:
        return 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20';
    }
  };

  const getIconColorClass = () => {
    switch (confirmColor) {
      case 'red':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'amber':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'blue':
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative animate-popIn w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl overflow-hidden p-6 text-center">
        
        {/* Icon */}
        <div className={`mx-auto w-12 h-12 rounded-full border flex items-center justify-center mb-4 ${getIconColorClass()}`}>
          <i className="fas fa-exclamation-triangle text-xl"></i>
        </div>

        {/* Title & Message */}
        <h3 className="font-display font-bold text-white text-lg mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-display font-medium text-white hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-display font-bold transition-all ${getButtonColorClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
