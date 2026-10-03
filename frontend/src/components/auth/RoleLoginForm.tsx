'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface RoleLoginFormProps {
  role: 'STAFF' | 'HOD' | 'FACULTY' | 'STUDENT';
  title: string;
  description: string;
  icon: string;
  placeholderEmail?: string;
  demoCredentials?: {
    email: string;
    password: string;
  };
}

export default function RoleLoginForm({ 
  role, 
  title, 
  description, 
  icon, 
  placeholderEmail,
  demoCredentials 
}: RoleLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Verify user has correct role
      const expectedRole = role === 'STAFF' ? 'EXAM_CELL' : role; // Map STAFF to EXAM_CELL
      if (user.role !== expectedRole) {
        setError(`Access denied. This login is for ${title} only.`);
        setLoading(false);
        return;
      }
      
      // Redirect based on role
      const dashboardMap = {
        'STAFF': '/dashboard/staff',
        'HOD': '/dashboard/hod', 
        'FACULTY': '/dashboard/faculty',
        'STUDENT': '/dashboard/student'
      };
      
      router.push(dashboardMap[role] || '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-surface font-bold text-2xl">KLE</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-primary mb-2">ExamGuard</h1>
          <p className="text-text-muted">KLE Technological University</p>
        </div>
        
        <Card>
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center text-text-muted hover:text-primary transition-colors"
            >
              <span className="mr-2">←</span>
              Back to role selection
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">{icon}</div>
            <h2 className="text-2xl font-semibold text-text">{title} Login</h2>
            <p className="text-text-muted text-sm">{description}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-primary-light border border-primary text-primary px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholderEmail || `${title.toLowerCase()}@kle.edu`}
              required
              autoComplete="email"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Sign In as {title}
            </Button>
            
            {demoCredentials && (
              <div className="text-center text-sm text-text-muted mt-4 p-3 bg-bg rounded-lg">
                <p className="font-medium text-text">Demo Credentials:</p>
                <p className="font-mono text-xs mt-1 text-text">
                  {demoCredentials.email} / {demoCredentials.password}
                </p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}