/**
 * Status Badge component with KLE theme colors
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Clock, AlertTriangle, Info, Minus } from 'lucide-react';

export type BadgeVariant = 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info' 
  | 'gray' 
  | 'primary'
  | 'active'
  | 'inactive'
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'draft';

export interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getVariantClasses = (variant: BadgeVariant) => {
  const variants = {
    success: 'bg-success-50 text-success-700 border-success-200',
    active: 'bg-success-50 text-success-700 border-success-200',
    completed: 'bg-success-50 text-success-700 border-success-200',
    
    error: 'bg-error-50 text-error-700 border-error-200',
    failed: 'bg-error-50 text-error-700 border-error-200',
    cancelled: 'bg-error-50 text-error-700 border-error-200',
    
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    pending: 'bg-warning-50 text-warning-700 border-warning-200',
    draft: 'bg-warning-50 text-warning-700 border-warning-200',
    
    info: 'bg-info-50 text-info-700 border-info-200',
    
    primary: 'bg-primary-50 text-primary-700 border-primary-200',
    
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    inactive: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  
  return variants[variant] || variants.gray;
};

const getIconClasses = (variant: BadgeVariant) => {
  const variants = {
    success: 'text-success-500',
    active: 'text-success-500',
    completed: 'text-success-500',
    
    error: 'text-error-500',
    failed: 'text-error-500',
    cancelled: 'text-error-500',
    
    warning: 'text-warning-500',
    pending: 'text-warning-500',
    draft: 'text-warning-500',
    
    info: 'text-info-500',
    
    primary: 'text-primary-500',
    
    gray: 'text-gray-500',
    inactive: 'text-gray-500',
  };
  
  return variants[variant] || variants.gray;
};

const getIcon = (variant: BadgeVariant) => {
  const iconMap = {
    success: Check,
    active: Check,
    completed: Check,
    
    error: X,
    failed: X,
    cancelled: X,
    
    warning: AlertTriangle,
    pending: Clock,
    draft: AlertTriangle,
    
    info: Info,
    primary: Info,
    
    gray: Minus,
    inactive: Minus,
  };
  
  return iconMap[variant] || iconMap.gray;
};

const getSizeClasses = (size: 'sm' | 'md' | 'lg') => {
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  return sizes[size];
};

export function StatusBadge({ 
  variant, 
  children, 
  showIcon = true, 
  size = 'md', 
  className 
}: StatusBadgeProps) {
  const Icon = getIcon(variant);
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full border',
        getVariantClasses(variant),
        getSizeClasses(size),
        className
      )}
    >
      {showIcon && (
        <Icon 
          className={cn(
            size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4',
            getIconClasses(variant)
          )}
        />
      )}
      {children}
    </span>
  );
}

// Convenience components for common statuses
export function ActiveBadge({ children, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="active" {...props}>{children}</StatusBadge>;
}

export function PendingBadge({ children, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="pending" {...props}>{children}</StatusBadge>;
}

export function CompletedBadge({ children, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="completed" {...props}>{children}</StatusBadge>;
}

export function FailedBadge({ children, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge variant="failed" {...props}>{children}</StatusBadge>;
}

// Role-based badges
export function RoleBadge({ role, ...props }: { role: string } & Omit<StatusBadgeProps, 'variant' | 'children'>) {
  const roleVariants: Record<string, BadgeVariant> = {
    admin: 'primary',
    hod: 'info',
    exam_cell: 'warning',
    faculty: 'success',
    staff: 'info',
    student: 'gray',
  };
  
  const variant = roleVariants[role.toLowerCase()] || 'gray';
  const displayName = role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <StatusBadge variant={variant} showIcon={false} {...props}>
      {displayName}
    </StatusBadge>
  );
}
