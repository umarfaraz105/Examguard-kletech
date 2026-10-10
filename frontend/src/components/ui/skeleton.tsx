/**
 * Skeleton Component - Loading placeholders and shimmer effects
 */

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  'aria-label'?: string;
}

function Skeleton({
  className,
  'aria-label': ariaLabel,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      role="presentation"
      aria-label={ariaLabel}
      {...props}
    />
  );
}

export { Skeleton };
