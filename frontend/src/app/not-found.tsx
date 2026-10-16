/**
 * Next.js 404 Not Found Page
 * Custom 404 page for ExamGuard
 */
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-gray-50 px-4">
      <div className="w-full max-w-md">
        <Card className="border-primary-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-primary-600" />
              </div>
            </div>
            <CardTitle className="text-3xl text-primary-900 mb-2">404</CardTitle>
            <CardDescription className="text-base text-gray-700">
              The page you&apos;re looking for doesn&apos;t exist
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-gray-600">
              The page may have been moved or deleted. Please check the URL or navigate back to a known location.
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
              
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full border-primary-300 text-primary-700 hover:bg-primary-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
