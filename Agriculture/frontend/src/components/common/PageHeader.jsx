import React from 'react';

/**
 * Standardized PageHeader for dashboards and content views.
 */
export default function PageHeader({
  title,
  subtitle,
  action,
  tag,
  className = 'mb-6 sm:mb-8',
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        {tag && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-1">
            {tag}
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm sm:text-base text-gray-500 font-normal">{subtitle}</p>}
      </div>

      {action && (
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {action}
        </div>
      )}
    </div>
  );
}
