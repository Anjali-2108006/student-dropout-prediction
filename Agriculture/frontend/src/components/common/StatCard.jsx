import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Metric card for dashboards displaying key figures, trends, and agriculture-themed icons.
 */
export default function StatCard({
  title,
  value,
  subtitle,
  change,
  changeType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon: IconComponent,
  iconName,
  color = 'emerald', // 'emerald' | 'blue' | 'amber' | 'purple'
  className = '',
}) {
  // Resolve icon either passed directly or by string name from lucide
  const Icon = IconComponent || (iconName && LucideIcons[iconName]) || LucideIcons.Activity;

  const colorVariants = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100/80',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100/80',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100/80',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-100',
      iconBg: 'bg-purple-100/80',
    },
  };

  const scheme = colorVariants[color] || colorVariants.emerald;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${scheme.iconBg} ${scheme.text} flex-shrink-0 shadow-xs`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(subtitle || change) && (
        <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
          {subtitle && <span>{subtitle}</span>}
          {change && (
            <span
              className={`font-semibold inline-flex items-center gap-0.5 ${
                changeType === 'positive'
                  ? 'text-emerald-600'
                  : changeType === 'negative'
                  ? 'text-rose-600'
                  : 'text-gray-600'
              }`}
            >
              {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '•'} {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
