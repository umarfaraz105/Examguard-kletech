/**
 * Login form component with email/password authentication
 */
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/toast';
import type { UserRole } from '@/lib/types';

interface LoginFormProps {
  expectedRole?: UserRole;
  onSuccess?: () => void;
}

export function LoginForm({ expectedRole, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);

      // Check if user role matches expected role
      if (expectedRole && user.role !== expectedRole) {
        setError(`Invalid credentials for ${expectedRole} role. Please use ${user.role} login.`);
        setLoading(false);
        return;
      }

      toast.success(`Welcome back, ${user.full_name}!`);

      // Redirect to return URL or role-specific dashboard
      const returnUrl = searchParams.get('returnUrl');
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else {
        const roleRoutes: Record<UserRole, string> = {
          admin: '/dashboard/admin',
          hod: '/dashboard/hod',
          exam_cell: '/dashboard/staff',
          faculty: '/dashboard/faculty',
          staff: '/dashboard/staff',
          student: '/dashboard/student',
        };
        router.push(roleRoutes[user.role] || '/dashboard');
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      const errorMessage = err.message || 'Invalid email or password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
        <CardDescription>
          {expectedRole 
            ? `Enter your ${expectedRole} credentials to continue`
            : 'Enter your credentials to continue'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@kle.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-orange-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email || !password}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <a href="/register" className="text-orange-600 hover:underline font-semibold">
              Contact Admin
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
