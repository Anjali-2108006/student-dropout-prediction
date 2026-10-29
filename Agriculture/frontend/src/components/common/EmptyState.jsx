import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * EmptyState view when no items, lots, or transactions are found.
 */
export default function EmptyState({
  title = 'No items found',
  description = 'There are no records to display at this time.',
  icon: IconComponent,
  iconName = 'PackageOpen',
  action,
  className = '',
}) {
  const Icon = IconComponent || LucideIcons[iconName] || LucideIcons.PackageOpen;

  return (
    <div className={`p-8 sm:p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
