import React from 'react';

/**
 * StatusBadge represents semantic operational states for lots, offers, payments, and grievances.
 */
export default function StatusBadge({
  status,
  variant,
  size = 'md',
  className = '',
}) {
  // Determine variant automatically if not explicitly given
  const getAutoVariant = (text = '') => {
    const s = text.toLowerCase();
    if (s.includes('verified') || s.includes('completed') || s.includes('delivered') || s.includes('available') || s.includes('resolved') || s.includes('paid')) {
      return 'success';
    }
    if (s.includes('pending') || s.includes('transit') || s.includes('negotiation') || s.includes('review') || s.includes('auction')) {
      return 'warning';
    }
    if (s.includes('high') || s.includes('rejected') || s.includes('expired') || s.includes('failed') || s.includes('dispute')) {
      return 'danger';
    }
    if (s.includes('best') || s.includes('recommended')) {
      return 'emerald';
    }
    return 'neutral';
  };

  const selectedVariant = variant || getAutoVariant(status);

  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    info: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    emerald: 'bg-emerald-600 text-white border-emerald-600 font-semibold',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200 ring-gray-500/10',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-medium',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full border shadow-2xs font-medium ${sizeStyles[size] || sizeStyles.md} ${variantStyles[selectedVariant] || variantStyles.neutral} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      <span>{status}</span>
    </span>
  );
}
