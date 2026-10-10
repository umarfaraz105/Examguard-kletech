'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import SkipLink from '@/components/ui/SkipLink';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarAnnouncement, setSidebarAnnouncement] = useState('');
  
  // Don't show layout on public pages
  const publicPages = ['/login', '/register', '/forgot-password', '/unauthorized'];
  const isPublicPage = publicPages.some(page => pathname?.startsWith(page));
  
  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Handle mobile sidebar announcements for screen readers
  useEffect(() => {
    if (mobileSidebarOpen) {
      setSidebarAnnouncement('Mobile navigation menu opened');
    } else {
      setSidebarAnnouncement('Mobile navigation menu closed');
    }
  }, [mobileSidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);
  
  if (!isAuthenticated || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <SkipLink targetId="main-content">
        Skip to main content
      </SkipLink>
      
      {/* ARIA live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {sidebarAnnouncement}
      </div>

      <header role="banner">
        <Navbar 
          onMobileSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          mobileSidebarOpen={mobileSidebarOpen}
        />
      </header>
      
      <div className="flex">
        <Sidebar 
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileSidebarClose={() => setMobileSidebarOpen(false)}
        />
        <main 
          id="main-content"
          role="main"
          className="flex-1 min-h-[calc(100vh-4rem)]"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
