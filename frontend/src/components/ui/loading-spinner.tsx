/**
 * Loading spinner component with various sizes
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={cn(
          'animate-spin rounded-full border-gray-300 border-t-orange-600',
          sizeClasses[size],
          className
        )}
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

interface LoadingOverlayProps {
  text?: string;
}

export function LoadingOverlay({ text = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  rows?: number;
}

export function LoadingSkeleton({ className, rows = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 animate-pulse rounded bg-gray-200',
            className
          )}
        />
      ))}
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
}

export function LoadingCard({ title = 'Loading...', description }: LoadingCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-4">
        <LoadingSpinner size="md" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
      </div>
    </div>
  );
}
