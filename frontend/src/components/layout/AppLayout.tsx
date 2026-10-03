'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Don't show layout on public pages
  const publicPages = ['/login', '/register', '/forgot-password', '/unauthorized'];
  const isPublicPage = publicPages.some(page => pathname?.startsWith(page));
  
  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

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
      <Navbar 
        onMobileSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        mobileSidebarOpen={mobileSidebarOpen}
      />
      <div className="flex">
        <Sidebar 
          mobileSidebarOpen={mobileSidebarOpen}
          onMobileSidebarClose={() => setMobileSidebarOpen(false)}
        />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
