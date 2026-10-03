import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'warning' | 'info'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
  loading?: boolean
}

const getVariantClasses = (variant: ButtonProps['variant']) => {
  const variants = {
    default: 'bg-primary-500 text-white hover:bg-primary-600 shadow',
    destructive: 'bg-error-500 text-white hover:bg-error-600 shadow-sm',
    outline: 'border border-gray-300 bg-background hover:bg-accent hover:text-accent-foreground shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    link: 'text-primary-500 underline-offset-4 hover:underline',
    success: 'bg-success-500 text-white hover:bg-success-600 shadow-sm',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 shadow-sm',
    info: 'bg-info-500 text-white hover:bg-info-600 shadow-sm',
  }
  return variants[variant || 'default']
}

const getSizeClasses = (size: ButtonProps['size']) => {
  const sizes = {
    default: 'h-10 px-4 py-2 text-sm',
    sm: 'h-9 rounded-md px-3 text-xs',
    lg: 'h-11 rounded-lg px-8',
    xl: 'h-12 rounded-lg px-10 text-base',
    icon: 'h-10 w-10',
  }
  return sizes[size || 'default']
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    asChild = false, 
    loading = false, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    return (
      <Comp
        className={cn(
          baseClasses,
          getVariantClasses(variant),
          getSizeClasses(size),
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button }
