'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Route to role-specific dashboard
      const roleRoutes: Record<string, string> = {
        'admin': '/dashboard/admin',
        'ADMIN': '/dashboard/admin',
        'hod': '/dashboard/hod',
        'HOD': '/dashboard/hod',
        'staff': '/dashboard/staff',
        'STAFF': '/dashboard/staff',
        'EXAM_CELL': '/dashboard/staff',
        'faculty': '/dashboard/faculty',
        'FACULTY': '/dashboard/faculty',
        'student': '/dashboard/student',
        'STUDENT': '/dashboard/student',
      };

      const targetRoute = roleRoutes[user?.role || ''] || '/dashboard/admin';
      router.replace(targetRoute);
    }
  }, [isAuthenticated, authLoading, user, router]);


  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}