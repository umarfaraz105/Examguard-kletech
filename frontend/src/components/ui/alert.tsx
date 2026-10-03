/**
 * Alert Component - Alert messages and notifications
 */

import * as React from 'react'
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'default' | 'lg'
  dismissible?: boolean
  onDismiss?: () => void
}

const getVariantConfig = (variant: AlertProps['variant']) => {
  const configs = {
    default: {
      classes: 'bg-gray-50 border-gray-200 text-gray-700',
      icon: Info
    },
    success: {
      classes: 'bg-success-50 border-success-200 text-success-700',
      icon: CheckCircle
    },
    warning: {
      classes: 'bg-warning-50 border-warning-200 text-warning-700',
      icon: AlertTriangle
    },
    error: {
      classes: 'bg-error-50 border-error-200 text-error-700',
      icon: XCircle
    },
    info: {
      classes: 'bg-info-50 border-info-200 text-info-700',
      icon: Info
    }
  }
  return configs[variant || 'default']
}

const getSizeClasses = (size: AlertProps['size']) => {
  const sizes = {
    sm: 'p-3 text-sm',
    default: 'p-4',
    lg: 'p-6 text-lg'
  }
  return sizes[size || 'default']
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default',
    dismissible = false,
    onDismiss,
    children,
    ...props 
  }, ref) => {
    const config = getVariantConfig(variant)
    const Icon = config.icon

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border',
          config.classes,
          getSizeClasses(size),
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex items-start gap-3">
          <Icon className={cn(
            'flex-shrink-0 mt-0.5',
            size === 'sm' ? 'h-4 w-4' : 
            size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'
          )} />
          
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {dismissible && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                variant === 'success' ? 'focus:ring-success-500' :
                variant === 'warning' ? 'focus:ring-warning-500' :
                variant === 'error' ? 'focus:ring-error-500' :
                variant === 'info' ? 'focus:ring-info-500' : 'focus:ring-gray-500'
              )}
            >
              <span className="sr-only">Dismiss</span>
              <X className={cn(
                size === 'sm' ? 'h-3 w-3' : 
                size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
              )} />
            </button>
          )}
        </div>
      </div>
    )
  }
)
Alert.displayName = 'Alert'

const AlertTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
)
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }