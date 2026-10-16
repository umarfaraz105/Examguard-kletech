/**
 * Unauthorized access page with role-aware messaging
 */
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/lib/types';

// Role-specific guidance messages
const getRoleGuidance = (role: UserRole): string => {
  const guidance: Record<UserRole, string> = {
    student: 'As a student, you can view your exam schedules and seating arrangements. Administrative features are restricted.',
    faculty: 'As faculty, you can manage your courses and view exam schedules. Higher-level administrative features require additional permissions.',
    staff: 'As staff, you have access to support functions. Administrative and academic management features are restricted.',
    exam_cell: 'As an exam cell member, you can manage exam logistics. Department-specific or higher-level administrative features may be restricted.',
    hod: 'As a Head of Department, you have department-level access. University-wide administrative features are restricted.',
    admin: 'As an administrator, you have broad access. This restriction may be due to a specific feature limitation or temporary access issue.',
  };
  return guidance[role] || 'This page is restricted based on your current role.';
};

// Role-specific dashboard paths
const getRoleDashboard = (role: UserRole): string => {
  const dashboards: Record<UserRole, string> = {
    admin: '/dashboard',
    hod: '/dashboard',
    exam_cell: '/dashboard',
    faculty: '/dashboard',
    staff: '/dashboard',
    student: '/dashboard',
  };
  return dashboards[role] || '/dashboard';
};

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleContactAdmin = () => {
    // In a real app, this might open a support ticket form or mailto link
    window.location.href = 'mailto:support@examguard.edu?subject=Access Request';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-900">Access Denied</CardTitle>
            <CardDescription className="text-red-700">
              403 - You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm space-y-2">
                  <p className="text-gray-700">
                    <span className="font-semibold">Current User:</span> {user.full_name}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Role:</span>{' '}
                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    {getRoleGuidance(user.role)}
                  </p>
                </div>
              </>
            )}

            {!user && (
              <p className="text-sm text-gray-600 text-center">
                You need to be logged in with appropriate permissions to access this page.
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                onClick={() => router.push(user ? getRoleDashboard(user.role) : '/dashboard')}
                className="w-full bg-primary-500 hover:bg-primary-600"
              >
                <Home className="mr-2 h-4 w-4" />
                {user ? 'Go to My Dashboard' : 'Go to Dashboard'}
              </Button>

              <Button
                onClick={handleContactAdmin}
                variant="outline"
                className="w-full"
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Administrator
              </Button>

              {user && (
                <Button
                  onClick={() => {
                    logout();
                    router.push('/login');
                  }}
                  variant="ghost"
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Sign Out and Login with Different Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
