'use client';

import { useRef, useEffect } from 'react';

interface SkipLinkProps {
  targetId: string;
  children: React.ReactNode;
  className?: string;
}

export default function SkipLink({ targetId, children, className = '' }: SkipLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    const target = document.getElementById(targetId);
    if (target) {
      // Set focus to the target element
      target.focus();
      
      // If the target doesn't naturally receive focus, make it focusable temporarily
      if (target.tabIndex < 0) {
        target.tabIndex = -1;
        target.addEventListener('blur', () => {
          target.removeAttribute('tabindex');
        }, { once: true });
      }
      
      // Scroll to the target
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  };

  return (
    <a
      ref={linkRef}
      href={`#${targetId}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`
        fixed top-4 left-4 z-50 px-4 py-2 bg-primary text-surface font-medium rounded-lg
        transform -translate-y-full opacity-0 pointer-events-none
        focus:translate-y-0 focus:opacity-100 focus:pointer-events-auto
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2
        ${className}
      `}
      role="button"
      tabIndex={0}
    >
      {children}
    </a>
  );
}
