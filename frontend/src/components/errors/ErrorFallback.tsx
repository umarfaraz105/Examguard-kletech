import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorFallbackProps {
  error: Error;
  errorMessage?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  variant?: 'page' | 'component' | 'route';
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorMessage,
  onRetry,
  onGoHome,
  variant = 'page',
}) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Page variant - full-screen centered layout
  if (variant === 'page') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-error-500" aria-hidden="true" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorMessage || 'Something went wrong'}
            </h1>
            
            <p className="text-gray-600 mb-6 max-w-md">
              {isDevelopment && error.message ? error.message : 'An unexpected error occurred. Please try again.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px]"
                  aria-label="Retry"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Try Again
                </button>
              )}
              
              {onGoHome && (
                <button
                  onClick={onGoHome}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px]"
                  aria-label="Go home"
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  Go Home
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Route variant - page-sized with back navigation
  if (variant === 'route') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-error-100 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-error-500" aria-hidden="true" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {errorMessage || 'Page Error'}
            </h2>
            
            <p className="text-gray-600 mb-4">
              {isDevelopment && error.message ? error.message : 'This page encountered an error. Please try navigating back.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px]"
                  aria-label="Retry"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Retry
                </button>
              )}
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 min-h-[44px]"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Component variant - compact inline fallback
  return (
    <div className={cn(
      "bg-error-50 border border-error-200 rounded-lg p-4",
      "flex items-center gap-3"
    )}>
      <div className="flex-shrink-0">
        <AlertTriangle className="w-5 h-5 text-error-500" aria-hidden="true" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">
          {errorMessage || 'Component error'}
        </p>
        {isDevelopment && error.message && (
          <p className="text-xs text-gray-600 mt-1 truncate" title={error.message}>
            {error.message}
          </p>
        )}
      </div>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-error-700 bg-white border border-error-300 rounded-lg hover:bg-error-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error-500 focus-visible:ring-offset-2 min-h-[44px]"
          aria-label="Retry"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorFallback;
