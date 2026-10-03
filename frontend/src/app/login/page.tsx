'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function LoginContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">KLE</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ExamGuard</h1>
          <p className="text-gray-600">KLE Technological University</p>
          <p className="text-sm text-gray-500 mt-1">Intelligent Examination Management System</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 KLE Technological University. All rights reserved.</p>
          <p className="mt-1">
            <a href="/privacy" className="hover:text-orange-600">Privacy Policy</a>
            {' · '}
            <a href="/terms" className="hover:text-orange-600">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingSpinner size="lg" />}>
      <LoginContent />
    </Suspense>
  );
}
