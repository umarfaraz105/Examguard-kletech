'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const { login } = useAuth();
  const router = useRouter();

  const MAX_ATTEMPTS = 3;
  const isLocked = attempts >= MAX_ATTEMPTS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError('Account locked due to multiple failed attempts. Contact system administrator.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const user = await login(adminId, password);
      
      // Verify admin role
      if (user.role !== 'ADMIN') {
        setAttempts(prev => prev + 1);
        setError('Access denied. Administrative credentials required.');
        setLoading(false);
        return;
      }
      
      // Reset attempts on successful login
      setAttempts(0);
      
      // Log admin login attempt (for audit)
      console.log(`Admin login successful: ${user.email} at ${new Date().toISOString()}`);
      
      router.push('/dashboard/admin');
    } catch (err: any) {
      setAttempts(prev => prev + 1);
      const remainingAttempts = MAX_ATTEMPTS - (attempts + 1);
      
      if (remainingAttempts > 0) {
        setError(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
      } else {
        setError('Account locked due to multiple failed attempts. Contact system administrator.');
      }
      
      // Log failed attempt (for audit)
      console.warn(`Admin login failed: ${adminId} at ${new Date().toISOString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-text rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-surface font-bold text-2xl">⚙️</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-text mb-2">Admin Panel</h1>
          <p className="text-text-muted">System Administration</p>
          <p className="text-xs text-text-muted mt-1">Authorized Personnel Only</p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-text mb-4">Administrator Login</h2>
            
            {error && (
              <div className={`px-4 py-3 rounded-lg text-sm ${
                isLocked 
                  ? 'bg-red-50 border border-red-200 text-red-800' 
                  : 'bg-primary-light border border-primary text-primary'
              }`}>
                {error}
              </div>
            )}
            
            <Input
              label="Admin ID"
              type="text"
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="Administrator ID"
              required
              disabled={isLocked}
              autoComplete="username"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLocked}
              autoComplete="current-password"
            />
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              disabled={isLocked}
              className="w-full bg-text hover:bg-text/90"
            >
              {isLocked ? 'Account Locked' : 'Admin Sign In'}
            </Button>
            
            <div className="text-center text-xs text-text-muted mt-4 p-3 bg-bg rounded-lg">
              <p>🔐 Secure Administrative Access</p>
              <p>All login attempts are logged and monitored</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}