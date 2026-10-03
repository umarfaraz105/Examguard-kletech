/**
 * Protected route wrapper for role-based access control
 */
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';
import { LoadingOverlay } from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Not authenticated - redirect to login
    if (requireAuth && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
      return;
    }

    // Check role-based access
    if (isAuthenticated && allowedRoles && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.includes(user!.role);
      
      if (!hasAccess) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [loading, isAuthenticated, user, allowedRoles, requireAuth, router, pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingOverlay text="Verifying authentication..." />;
  }

  // Not authenticated
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Role not allowed
  if (isAuthenticated && allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.includes(user!.role);
    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protecting pages
 * 
 * @example
 * export default withAuth(AdminPage, { allowedRoles: ['admin'] });
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { allowedRoles?: UserRole[]; requireAuth?: boolean }
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
