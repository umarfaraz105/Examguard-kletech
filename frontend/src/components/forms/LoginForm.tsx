/**
 * Enhanced Login Form with comprehensive validation
 */
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FieldRow } from './Form';
import { TextField, PasswordField, CheckboxField } from './FormField';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { toast } from '@/lib/toast';
import type { UserRole } from '@/lib/types';

interface LoginFormProps {
  expectedRole?: UserRole;
  onSuccess?: () => void;
  className?: string;
}

export function LoginForm({ expectedRole, onSuccess, className }: LoginFormProps) {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const user = await login(data.email, data.password);

      // Check if user role matches expected role
      if (expectedRole && user.role !== expectedRole) {
        throw new Error(`Invalid credentials for ${expectedRole} role. Please use ${user.role} login.`);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form<LoginFormData>
      schema={loginSchema}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitError={submitError}
      submitText="Sign In"
      title="Sign In"
      description={
        expectedRole 
          ? `Enter your ${expectedRole} credentials to continue`
          : 'Enter your credentials to continue'
      }
      showCard={true}
      className={className}
      defaultValues={{
        email: '',
        password: '',
        rememberMe: false,
      }}
    >
      <FieldRow columns={1}>
        <TextField
          register={form => form.register('email')}
          label="Email Address"
          type="email"
          placeholder="your.email@kle.edu.in"
          autoComplete="email"
          required
        />
        
        <PasswordField
          register={form => form.register('password')}
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
        
        <div className="flex items-center justify-between">
          <CheckboxField
            checked={form => form.watch('rememberMe')}
            onCheckedChange={(checked) => form.setValue('rememberMe', checked)}
          >
            Remember me
          </CheckboxField>
          
          <a 
            href="/forgot-password" 
            className="text-sm text-primary-600 hover:text-primary-500 hover:underline"
          >
            Forgot password?
          </a>
        </div>
      </FieldRow>
      
      <div className="text-center text-sm text-gray-600">
        <p>
          Don't have an account?{' '}
          <a href="/register" className="text-primary-600 hover:underline font-semibold">
            Contact Admin
          </a>
        </p>
      </div>
    </Form>
  );
}