/**
 * Advanced Loading State Components
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Loading spinner with customizable size and text
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  showProgress?: boolean;
  progress?: number;
}> = ({ 
  size = 'md', 
  text, 
  className,
  showProgress = false,
  progress = 0
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size])} />
      {text && (
        <p className={cn('text-muted-foreground', textSizes[size])}>
          {text}
        </p>
      )}
      {showProgress && (
        <div className="w-48 space-y-2">
          <Progress value={progress} />
          <p className="text-xs text-center text-muted-foreground">
            {progress}% complete
          </p>
        </div>
      )}
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  blur?: boolean;
}> = ({ isLoading, text = 'Loading...', children, blur = true }) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className={cn('transition-all duration-200', blur && 'blur-sm opacity-50')}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card>
          <CardContent className="p-6">
            <LoadingSpinner size="lg" text={text} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Progressive loading states
export const ProgressiveLoader: React.FC<{
  stages: { name: string; duration?: number }[];
  onComplete?: () => void;
  className?: string;
}> = ({ stages, onComplete, className }) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStage >= stages.length) {
      onComplete?.();
      return;
    }

    const stage = stages[currentStage];
    const duration = stage.duration || 1000;
    const interval = 50; // Update every 50ms
    const increment = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentStage(current => current + 1);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStage, stages, onComplete]);

  if (currentStage >= stages.length) {
    return (
      <div className={cn('flex items-center space-x-2 text-green-600', className)}>
        <CheckCircle className="h-5 w-5" />
        <span>Complete!</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center space-x-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="font-medium">{stages[currentStage].name}</span>
      </div>
      
      <div className="space-y-2">
        <Progress value={progress} />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStage + 1} of {stages.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center space-x-2">
            {index < currentStage ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : index === currentStage ? (
              <Clock className="h-3 w-3 text-blue-500" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span className={cn(
              index <= currentStage ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {stage.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Retry loading state
export const RetryLoader: React.FC<{
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
  retryText?: string;
  className?: string;
}> = ({ 
  isLoading, 
  error, 
  onRetry, 
  retryText = 'Try Again',
  className 
}) => {
  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('flex items-center space-x-3 text-red-600', className)}>
        <AlertCircle className="h-5 w-5" />
        <span className="flex-1">{error}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="flex items-center space-x-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{retryText}</span>
        </Button>
      </div>
    );
  }

  return null;
};

// Pulse loading animation
export const PulseLoader: React.FC<{
  className?: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className, count = 3, size = 'md' }) => {
  const sizes = {
    sm: 'h-2 w-2',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-primary rounded-full animate-pulse',
            sizes[size]
          )}
          style={{
            animationDelay: `${i * 200}ms`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

// Shimmer effect loader
export const ShimmerLoader: React.FC<{
  className?: string;
  lines?: number;
  avatar?: boolean;
}> = ({ className, lines = 3, avatar = false }) => {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      {avatar && (
        <div className="flex items-center space-x-4">
          <div className="rounded-full bg-gray-300 h-10 w-10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
};

// Delayed loading message
export const DelayedLoader: React.FC<{
  delay?: number;
  children: React.ReactNode;
}> = ({ delay = 500, children }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return show ? <>{children}</> : null;
};

// Loading button
export const LoadingButton: React.FC<{
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}> = ({ 
  loading = false, 
  children, 
  loadingText, 
  className,
  onClick,
  disabled,
  variant = 'default'
}) => {
  return (
    <Button
      variant={variant}
      className={className}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? (loadingText || 'Loading...') : children}
    </Button>
  );
};

// Content placeholder
export const ContentPlaceholder: React.FC<{
  type: 'empty' | 'loading' | 'error';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ type, title, description, action, className }) => {
  const getIcon = () => {
    switch (type) {
      case 'loading':
        return <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12', className)}>
      {getIcon()}
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};