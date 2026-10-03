/**
 * Unauthorized access page
 */
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-900">Access Denied</CardTitle>
            <CardDescription className="text-red-700">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Current User:</span> {user.full_name}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Role:</span>{' '}
                  <span className="capitalize">{user.role}</span>
                </p>
              </div>
            )}

            <p className="text-sm text-gray-600 text-center">
              This page is restricted to certain user roles. Please contact your administrator
              if you believe you should have access.
            </p>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
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
