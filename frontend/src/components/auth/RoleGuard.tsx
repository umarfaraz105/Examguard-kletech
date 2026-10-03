/**
 * Simple role guard component to conditionally render content based on user role
 */
'use client';

import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { user, hasRole } = useAuth();

  if (!user) return null;

  const hasAccess = allowedRoles.some(role => hasRole(role));

  if (!hasAccess) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if current user has specific role(s)
 */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
  const { hasRole } = useAuth();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.some(role => hasRole(role));
}

/**
 * HOC to wrap components with role-based rendering
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}
