/**
 * Error display components for showing API errors and failures
 */
import React from 'react';
import { AlertCircle, RefreshCw, XCircle, WifiOff, Shield, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type ErrorVariant = 'default' | 'network' | 'permission' | 'auth';

interface ErrorDisplayProps {
  error: Error | string | null;
  title?: string;
  retry?: () => void;
  className?: string;
  variant?: ErrorVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorDisplay({ 
  error, 
  title, 
  retry, 
  className,
  variant = 'default',
  action
}: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error.message;

  // Variant-specific configuration
  const variantConfig = {
    default: {
      icon: AlertCircle,
      title: title || 'Error',
      className: '',
    },
    network: {
      icon: WifiOff,
      title: title || 'Connection Error',
      className: 'border-orange-200 bg-orange-50',
    },
    permission: {
      icon: Shield,
      title: title || 'Permission Denied',
      className: 'border-yellow-200 bg-yellow-50',
    },
    auth: {
      icon: Lock,
      title: title || 'Authentication Required',
      className: 'border-red-200 bg-red-50',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;
  const displayTitle = config.title;
  const variantClassName = config.className;

  // Map error display variant to Alert variant
  const alertVariant = variant === 'default' ? 'error' : 
                       variant === 'network' ? 'warning' :
                       variant === 'permission' ? 'warning' :
                       variant === 'auth' ? 'error' : 'default';

  return (
    <Alert 
      variant={alertVariant} 
      className={`${variantClassName} ${className || ''}`}
    >
      <Icon className="h-4 w-4" />
      <AlertTitle>{displayTitle}</AlertTitle>
      <AlertDescription className="flex items-center justify-between gap-4">
        <span className="flex-1">{errorMessage}</span>
        <div className="flex gap-2 flex-shrink-0">
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
          {action && (
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="flex-shrink-0"
            >
              {action.label}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

interface ErrorCardProps {
  title?: string;
  description?: string;
  error?: Error | string;
  retry?: () => void;
  variant?: ErrorVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorCard({ 
  title, 
  description, 
  error,
  retry,
  variant = 'default',
  action
}: ErrorCardProps) {
  const errorMessage = error 
    ? typeof error === 'string' ? error : error.message
    : description;

  // Variant-specific configuration
  const variantConfig = {
    default: {
      icon: XCircle,
      title: title || 'Something went wrong',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
    },
    network: {
      icon: WifiOff,
      title: title || 'Network Connection Lost',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      textColor: 'text-orange-700',
    },
    permission: {
      icon: Shield,
      title: title || 'Access Restricted',
      borderColor: 'border-yellow-200',
      bgColor: 'bg-yellow-50',
      iconBgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      textColor: 'text-yellow-700',
    },
    auth: {
      icon: Lock,
      title: title || 'Authentication Required',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} p-6`}>
      <div className="flex items-start gap-4">
        <div className={`rounded-full ${config.iconBgColor} p-2`}>
          <Icon className={`h-6 w-6 ${config.iconColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${config.titleColor}`}>{config.title}</h3>
          {errorMessage && (
            <p className={`mt-1 text-sm ${config.textColor}`}>{errorMessage}</p>
          )}
          <div className="flex gap-2 mt-4">
            {retry && (
              <Button
                variant="outline"
                size="sm"
                onClick={retry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
          </div>
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
