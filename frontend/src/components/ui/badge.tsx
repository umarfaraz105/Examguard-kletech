/**
 * Badge Component - For displaying status, labels, or tags
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100',
      secondary: 'bg-gray-100 text-gray-900 border-gray-200 hover:bg-gray-200',
      destructive: 'bg-error-50 text-error-700 border-error-200 hover:bg-error-100',
      outline: 'border border-gray-300 text-gray-700 bg-transparent',
      success: 'bg-success-50 text-success-700 border-success-200 hover:bg-success-100',
      warning: 'bg-warning-50 text-warning-700 border-warning-200 hover:bg-warning-100',
      info: 'bg-info-50 text-info-700 border-info-200 hover:bg-info-100',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variantClasses[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge };
