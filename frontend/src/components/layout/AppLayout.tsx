'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  
  // Don't show layout on public pages
  const publicPages = ['/login', '/register', '/forgot-password', '/unauthorized'];
  const isPublicPage = publicPages.some(page => pathname?.startsWith(page));
  
  if (!isAuthenticated || isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
