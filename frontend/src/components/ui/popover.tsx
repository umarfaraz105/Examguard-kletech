'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

// Root component
const Popover = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

// Trigger component
const PopoverTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    children: React.ReactNode;
  }
>(({ className, children, asChild = false, ...props }, ref) => {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error('PopoverTrigger must be used within a Popover');
  }

  const { isOpen, setIsOpen } = context;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpen(!isOpen);
    props.onClick?.(e);
  };

  if (asChild) {
    return React.cloneElement(children as React.ReactElement, {
      onClick: handleClick,
      'aria-expanded': isOpen,
      'aria-haspopup': 'dialog',
      ref
    });
  }

  return (
    <button
      ref={ref}
      className={cn('inline-flex items-center justify-center', className)}
      onClick={handleClick}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

// Content component
const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
    alignOffset?: number;
  }
>(({ 
  className, 
  children, 
  side = 'bottom', 
  align = 'center',
  sideOffset = 4,
  alignOffset = 0,
  ...props 
}, ref) => {
  const context = React.useContext(PopoverContext);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error('PopoverContent must be used within a Popover');
  }

  const { isOpen, setIsOpen } = context;

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, setIsOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  const getPositionClasses = () => {
    const positions = {
      top: {
        start: 'bottom-full left-0 mb-1',
        center: 'bottom-full left-1/2 transform -translate-x-1/2 mb-1',
        end: 'bottom-full right-0 mb-1'
      },
      bottom: {
        start: 'top-full left-0 mt-1',
        center: 'top-full left-1/2 transform -translate-x-1/2 mt-1',
        end: 'top-full right-0 mt-1'
      },
      left: {
        start: 'right-full top-0 mr-1',
        center: 'right-full top-1/2 transform -translate-y-1/2 mr-1',
        end: 'right-full bottom-0 mr-1'
      },
      right: {
        start: 'left-full top-0 ml-1',
        center: 'left-full top-1/2 transform -translate-y-1/2 ml-1',
        end: 'left-full bottom-0 ml-1'
      }
    };

    return positions[side][align];
  };

  return (
    <div
      ref={contentRef}
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        getPositionClasses(),
        className
      )}
      style={{
        marginTop: side === 'bottom' ? `${sideOffset}px` : undefined,
        marginBottom: side === 'top' ? `${sideOffset}px` : undefined,
        marginLeft: side === 'right' ? `${sideOffset}px` : undefined,
        marginRight: side === 'left' ? `${sideOffset}px` : undefined,
        left: align === 'center' ? `${alignOffset}px` : undefined,
        top: align === 'center' ? `${alignOffset}px` : undefined,
      }}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverContent.displayName = 'PopoverContent';

export { Popover, PopoverTrigger, PopoverContent };
