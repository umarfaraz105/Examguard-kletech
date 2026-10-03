/**
 * Error display components for showing API errors and failures
 */
import React from 'react';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: Error | string | null;
  title?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorDisplay({ 
  error, 
  title = 'Error', 
  retry, 
  className 
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="flex-1">{errorMessage}</span>
        {retry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retry}
            className="flex-shrink-0"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

interface ErrorCardProps {
  title?: string;
  description?: string;
  error?: Error | string;
  retry?: () => void;
}

export function ErrorCard({ 
  title = 'Something went wrong', 
  description, 
  error,
  retry 
}: ErrorCardProps) {
  const errorMessage = error 
    ? typeof error === 'string' ? error : error.message
    : description;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6">
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-red-100 p-2">
          <XCircle className="h-6 w-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">{title}</h3>
          {errorMessage && (
            <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          )}
          {retry && (
            <Button
              variant="outline"
              size="sm"
              onClick={retry}
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface InlineErrorProps {
  error: Error | string | null;
  className?: string;
}

export function InlineError({ error, className }: InlineErrorProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <div className={`flex items-center gap-2 text-sm text-red-600 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <span>{errorMessage}</span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-center text-sm text-gray-600">{description}</p>}
      {action && (
        <Button onClick={action.onClick} className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
