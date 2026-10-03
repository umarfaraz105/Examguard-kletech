/**
 * Loading Skeleton Components - Various loading states for different content types
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Basic content skeleton
export const ContentSkeleton: React.FC<{ 
  className?: string;
  lines?: number;
  showAvatar?: boolean;
}> = ({ 
  className, 
  lines = 3, 
  showAvatar = false 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-4',
              i === lines - 1 ? 'w-[60%]' : 'w-full'
            )} 
          />
        ))}
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {showHeader && (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{
  className?: string;
  showHeader?: boolean;
  contentLines?: number;
}> = ({ 
  className,
  showHeader = true,
  contentLines = 3
}) => {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-4',
              i === contentLines - 1 ? 'w-[70%]' : 'w-full'
            )} 
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Dashboard skeleton
export const DashboardSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[300px]" />
        <Skeleton className="h-4 w-[500px]" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-8 w-[80px]" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton contentLines={8} />
        </div>
        <div className="space-y-4">
          <CardSkeleton contentLines={4} />
          <CardSkeleton contentLines={4} />
        </div>
      </div>
    </div>
  );
};

// Form skeleton
export const FormSkeleton: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 6, className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </div>
      </CardContent>
    </Card>
  );
};

// List skeleton
export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ items = 5, showAvatar = true, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full" />
          )}
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-8 w-[80px]" />
        </div>
      ))}
    </div>
  );
};

// Navigation skeleton
export const NavigationSkeleton: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 8, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-[120px]" />
        </div>
      ))}
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton: React.FC<{
  type?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
}> = ({ type = 'bar', className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-[180px]" />
            <Skeleton className="h-4 w-[250px]" />
          </div>
          <Skeleton className="h-8 w-[100px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full flex items-end justify-center space-x-2">
          {type === 'pie' ? (
            <Skeleton className="h-[200px] w-[200px] rounded-full" />
          ) : (
            Array.from({ length: type === 'line' ? 1 : 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  'w-8',
                  type === 'line' ? 'h-full' : `h-${Math.floor(Math.random() * 200) + 50}px`
                )}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Search results skeleton
export const SearchSkeleton: React.FC<{
  results?: number;
  className?: string;
}> = ({ results = 6, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Search bar skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      
      {/* Results skeleton */}
      <div className="space-y-3">
        {Array.from({ length: results }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-[250px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[70%]" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-[60px]" />
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-3 w-[50px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile skeleton
export const ProfileSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
          <Skeleton className="h-10 w-[100px]" />
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Page skeleton wrapper
export const PageSkeleton: React.FC<{
  type: 'dashboard' | 'table' | 'form' | 'list' | 'profile' | 'search';
  className?: string;
}> = ({ type, className }) => {
  const skeletonComponents = {
    dashboard: DashboardSkeleton,
    table: () => <TableSkeleton rows={8} columns={6} />,
    form: FormSkeleton,
    list: ListSkeleton,
    profile: ProfileSkeleton,
    search: SearchSkeleton,
  };

  const SkeletonComponent = skeletonComponents[type];
  return <SkeletonComponent className={className} />;
};