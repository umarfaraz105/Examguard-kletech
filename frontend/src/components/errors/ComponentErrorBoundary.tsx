import React, { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  fallbackMessage?: string;
}

const ComponentErrorBoundary: React.FC<ComponentErrorBoundaryProps> = ({ 
  children, 
  fallbackMessage 
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error instanceof Error ? error : new Error(String(error))}
          errorMessage={fallbackMessage || 'Component failed to load'}
          onRetry={resetErrorBoundary}
          variant="component"
        />
      )}
      onError={(error, errorInfo) => {
        // Log error for debugging
        console.error('ComponentErrorBoundary caught an error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ComponentErrorBoundary;
