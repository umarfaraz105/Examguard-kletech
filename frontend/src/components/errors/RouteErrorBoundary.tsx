import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

const RouteErrorBoundary: React.FC<RouteErrorBoundaryProps> = ({ children }) => {
  const handleReset = () => {
    // Reset error boundary state
    window.location.reload();
  };

  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error instanceof Error ? error : new Error(String(error))}
          errorMessage="Route Error"
          onRetry={resetErrorBoundary}
          variant="route"
        />
      )}
      onReset={handleReset}
      onError={(error, errorInfo) => {
        // Log error for debugging
        console.error('RouteErrorBoundary caught an error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default RouteErrorBoundary;
