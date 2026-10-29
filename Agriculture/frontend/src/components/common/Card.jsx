import React from 'react';

/**
 * Clean container card with subtle border, shadow, and optional header/footer.
 */
export default function Card({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = 'p-5 sm:p-6',
  footer,
  footerClassName = 'px-6 py-4 bg-gray-50/70 border-t border-gray-100 rounded-b-2xl',
  badge,
  ...props
}) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || action || badge) && (
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2.5">
              {title && <h3 className="text-base sm:text-lg font-semibold text-gray-900">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>
        {children}
      </div>

      {footer && (
        <div className={footerClassName}>
          {footer}
        </div>
      )}
    </div>
  );
}
