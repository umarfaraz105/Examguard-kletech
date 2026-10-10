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
  loadingText?: string;
}> = ({ 
  className, 
  lines = 3, 
  showAvatar = false,
  loadingText = "Loading content"
}) => {
  return (
    <div 
      className={cn('space-y-3', className)}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton 
            className="h-12 w-12 rounded-full" 
            aria-label="Loading profile picture"
          />
          <div className="space-y-2">
            <Skeleton 
              className="h-4 w-[250px]" 
              aria-label="Loading name"
            />
            <Skeleton 
              className="h-4 w-[200px]" 
              aria-label="Loading description"
            />
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
            aria-label={`Loading text line ${i + 1}`}
          />
        ))}
      </div>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </div>
  );
};

// Table skeleton
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
  loadingText?: string;
}> = ({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  className,
  loadingText = "Loading table data"
}) => {
  return (
    <div 
      className={cn('space-y-3', className)}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {showHeader && (
        <div 
          className="grid gap-4" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          aria-label="Loading table headers"
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-6 w-full" 
              aria-label={`Loading column ${i + 1} header`}
            />
          ))}
        </div>
      )}
      <div className="space-y-3" aria-label="Loading table rows">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
            aria-label={`Loading row ${rowIndex + 1}`}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className="h-4 w-full" 
                aria-label={`Loading cell ${rowIndex + 1}-${colIndex + 1}`}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </div>
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{
  className?: string;
  showHeader?: boolean;
  contentLines?: number;
  loadingText?: string;
}> = ({ 
  className,
  showHeader = true,
  contentLines = 3,
  loadingText = "Loading card content"
}) => {
  return (
    <Card 
      className={className}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {showHeader && (
        <CardHeader>
          <Skeleton 
            className="h-6 w-[200px]" 
            aria-label="Loading card title"
          />
          <Skeleton 
            className="h-4 w-[300px]" 
            aria-label="Loading card description"
          />
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
            aria-label={`Loading content line ${i + 1}`}
          />
        ))}
      </CardContent>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </Card>
  );
};

// Dashboard skeleton
export const DashboardSkeleton: React.FC<{
  className?: string;
  loadingText?: string;
}> = ({ 
  className,
  loadingText = "Loading dashboard"
}) => {
  return (
    <div 
      className={cn('space-y-6', className)}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton 
          className="h-8 w-[300px]" 
          aria-label="Loading dashboard title"
        />
        <Skeleton 
          className="h-4 w-[500px]" 
          aria-label="Loading dashboard description"
        />
      </div>

      {/* Stats cards skeleton */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        aria-label="Loading statistics cards"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} role="status" aria-label={`Loading statistic ${i + 1}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-2">
                  <Skeleton 
                    className="h-4 w-[100px]" 
                    aria-label="Loading stat label"
                  />
                  <Skeleton 
                    className="h-8 w-[80px]" 
                    aria-label="Loading stat value"
                  />
                </div>
                <Skeleton 
                  className="h-8 w-8 rounded" 
                  aria-label="Loading stat icon"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CardSkeleton 
            contentLines={8} 
            loadingText="Loading main dashboard content"
          />
        </div>
        <div className="space-y-4">
          <CardSkeleton 
            contentLines={4} 
            loadingText="Loading sidebar widget 1"
          />
          <CardSkeleton 
            contentLines={4} 
            loadingText="Loading sidebar widget 2"
          />
        </div>
      </div>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </div>
  );
};

// Form skeleton
export const FormSkeleton: React.FC<{
  fields?: number;
  className?: string;
  loadingText?: string;
}> = ({ 
  fields = 6, 
  className,
  loadingText = "Loading form"
}) => {
  return (
    <Card 
      className={className}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      <CardHeader>
        <Skeleton 
          className="h-6 w-[200px]" 
          aria-label="Loading form title"
        />
        <Skeleton 
          className="h-4 w-[300px]" 
          aria-label="Loading form description"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton 
                className="h-4 w-[100px]" 
                aria-label={`Loading field ${i + 1} label`}
              />
              <Skeleton 
                className="h-10 w-full" 
                aria-label={`Loading field ${i + 1} input`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-2">
          <Skeleton 
            className="h-10 w-[100px]" 
            aria-label="Loading cancel button"
          />
          <Skeleton 
            className="h-10 w-[100px]" 
            aria-label="Loading submit button"
          />
        </div>
      </CardContent>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </Card>
  );
};

// List skeleton
export const ListSkeleton: React.FC<{
  items?: number;
  showAvatar?: boolean;
  className?: string;
  loadingText?: string;
}> = ({ 
  items = 5, 
  showAvatar = true, 
  className,
  loadingText = "Loading list items"
}) => {
  return (
    <div 
      className={cn('space-y-3', className)}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center space-x-4 p-4 border rounded-lg"
          aria-label={`Loading item ${i + 1}`}
        >
          {showAvatar && (
            <Skeleton 
              className="h-10 w-10 rounded-full" 
              aria-label="Loading avatar"
            />
          )}
          <div className="space-y-2 flex-1">
            <Skeleton 
              className="h-4 w-[200px]" 
              aria-label="Loading item title"
            />
            <Skeleton 
              className="h-3 w-[150px]" 
              aria-label="Loading item description"
            />
          </div>
          <Skeleton 
            className="h-8 w-[80px]" 
            aria-label="Loading item action"
          />
        </div>
      ))}
      <span className="sr-only">{loadingText}. Please wait.</span>
    </div>
  );
};

// Navigation skeleton
export const NavigationSkeleton: React.FC<{
  items?: number;
  className?: string;
  loadingText?: string;
}> = ({ 
  items = 8, 
  className,
  loadingText = "Loading navigation"
}) => {
  return (
    <div 
      className={cn('space-y-2', className)}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center space-x-3 p-2"
          aria-label={`Loading navigation item ${i + 1}`}
        >
          <Skeleton 
            className="h-5 w-5" 
            aria-label="Loading navigation icon"
          />
          <Skeleton 
            className="h-4 w-[120px]" 
            aria-label="Loading navigation label"
          />
        </div>
      ))}
      <span className="sr-only">{loadingText}. Please wait.</span>
    </div>
  );
};

// Chart skeleton
export const ChartSkeleton: React.FC<{
  type?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
  loadingText?: string;
}> = ({ 
  type = 'bar', 
  className,
  loadingText = "Loading chart data"
}) => {
  return (
    <Card 
      className={className}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton 
              className="h-6 w-[180px]" 
              aria-label="Loading chart title"
            />
            <Skeleton 
              className="h-4 w-[250px]" 
              aria-label="Loading chart description"
            />
          </div>
          <Skeleton 
            className="h-8 w-[100px]" 
            aria-label="Loading chart controls"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="h-[300px] w-full flex items-end justify-center space-x-2"
          aria-label={`Loading ${type} chart visualization`}
        >
          {type === 'pie' ? (
            <Skeleton 
              className="h-[200px] w-[200px] rounded-full" 
              aria-label="Loading pie chart"
            />
          ) : (
            Array.from({ length: type === 'line' ? 1 : 8 }).map((_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  'w-8',
                  type === 'line' ? 'h-full' : `h-${Math.floor(Math.random() * 200) + 50}px`
                )}
                aria-label={`Loading chart data point ${i + 1}`}
              />
            ))
          )}
        </div>
      </CardContent>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </Card>
  );
};

// Search results skeleton
export const SearchSkeleton: React.FC<{
  results?: number;
  className?: string;
  loadingText?: string;
}> = ({ 
  results = 6, 
  className,
  loadingText = "Loading search results"
}) => {
  return (
    <div 
      className={cn('space-y-4', className)}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      {/* Search bar skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton 
          className="h-10 flex-1" 
          aria-label="Loading search input"
        />
        <Skeleton 
          className="h-10 w-[100px]" 
          aria-label="Loading search button"
        />
      </div>
      
      {/* Results skeleton */}
      <div className="space-y-3" aria-label="Loading search results">
        {Array.from({ length: results }).map((_, i) => (
          <div 
            key={i} 
            className="p-4 border rounded-lg space-y-2"
            aria-label={`Loading search result ${i + 1}`}
          >
            <div className="flex items-center justify-between">
              <Skeleton 
                className="h-5 w-[250px]" 
                aria-label="Loading result title"
              />
              <Skeleton 
                className="h-4 w-[80px]" 
                aria-label="Loading result date"
              />
            </div>
            <Skeleton 
              className="h-4 w-full" 
              aria-label="Loading result description"
            />
            <Skeleton 
              className="h-4 w-[70%]" 
              aria-label="Loading result content"
            />
            <div className="flex items-center space-x-2">
              <Skeleton 
                className="h-3 w-[60px]" 
                aria-label="Loading result category"
              />
              <Skeleton 
                className="h-3 w-[80px]" 
                aria-label="Loading result author"
              />
              <Skeleton 
                className="h-3 w-[50px]" 
                aria-label="Loading result rating"
              />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </div>
  );
};

// Profile skeleton
export const ProfileSkeleton: React.FC<{
  className?: string;
  loadingText?: string;
}> = ({ 
  className,
  loadingText = "Loading profile information"
}) => {
  return (
    <Card 
      className={className}
      role="status"
      aria-busy="true"
      aria-label={loadingText}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <Skeleton 
            className="h-20 w-20 rounded-full" 
            aria-label="Loading profile picture"
          />
          <div className="space-y-2 flex-1">
            <Skeleton 
              className="h-6 w-[200px]" 
              aria-label="Loading profile name"
            />
            <Skeleton 
              className="h-4 w-[150px]" 
              aria-label="Loading profile title"
            />
            <Skeleton 
              className="h-4 w-[180px]" 
              aria-label="Loading profile email"
            />
          </div>
          <Skeleton 
            className="h-10 w-[100px]" 
            aria-label="Loading profile action"
          />
        </div>
        
        <div className="mt-6 space-y-4" aria-label="Loading profile details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton 
                  className="h-4 w-[100px]" 
                  aria-label={`Loading profile field ${i + 1} label`}
                />
                <Skeleton 
                  className="h-4 w-[150px]" 
                  aria-label={`Loading profile field ${i + 1} value`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <span className="sr-only">{loadingText}. Please wait.</span>
    </Card>
  );
};

// Page skeleton wrapper
export const PageSkeleton: React.FC<{
  type: 'dashboard' | 'table' | 'form' | 'list' | 'profile' | 'search';
  className?: string;
  loadingText?: string;
}> = ({ 
  type, 
  className,
  loadingText
}) => {
  const defaultLoadingText = {
    dashboard: "Loading dashboard",
    table: "Loading table data", 
    form: "Loading form",
    list: "Loading list items",
    profile: "Loading profile information",
    search: "Loading search results"
  };

  const finalLoadingText = loadingText || defaultLoadingText[type];

  const skeletonComponents = {
    dashboard: () => <DashboardSkeleton loadingText={finalLoadingText} />,
    table: () => <TableSkeleton rows={8} columns={6} loadingText={finalLoadingText} />,
    form: () => <FormSkeleton loadingText={finalLoadingText} />,
    list: () => <ListSkeleton loadingText={finalLoadingText} />,
    profile: () => <ProfileSkeleton loadingText={finalLoadingText} />,
    search: () => <SearchSkeleton loadingText={finalLoadingText} />,
  };

  const SkeletonComponent = skeletonComponents[type];
  return <SkeletonComponent className={className} />;
};
