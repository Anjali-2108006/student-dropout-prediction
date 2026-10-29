import React from 'react';
import Card from './Card';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

/**
 * Chart wrapper card providing title, subtitle, trend status, and responsive chart canvas.
 */
export default function ChartCard({
  title,
  subtitle,
  trendBadge = 'Price trend is increasing',
  trendPositive = true,
  children,
  action,
  className = '',
}) {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={className}
      action={
        <div className="flex items-center gap-2">
          {trendBadge && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                trendPositive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {trendBadge}
            </span>
          )}
          {action}
        </div>
      }
    >
      <div className="w-full h-64 sm:h-72 pt-2">
        {children}
      </div>
    </Card>
  );
}
