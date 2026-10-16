/**
 * Next.js Error Page
 * Global error handler for application errors
 * Must be a client component per Next.js requirements
 */
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Log error to console in development
    if (isDevelopment) {
      console.error('Application error:', error);
    }
    // In production, you might want to send this to an error tracking service
  }, [error, isDevelopment]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4">
      <div className="w-full max-w-md">
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-red-900">Something went wrong</CardTitle>
            <CardDescription className="text-red-700">
              {isDevelopment 
                ? 'An error occurred while rendering this page' 
                : 'We encountered an unexpected error'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDevelopment && error.message && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-red-800 mb-2">Error Details:</p>
                <code className="text-xs text-red-700 break-all block font-mono">
                  {error.message}
                </code>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            {!isDevelopment && (
              <p className="text-sm text-center text-gray-600">
                Please try again or return to the dashboard. If the problem persists, contact support.
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
