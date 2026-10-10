'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { HelpButton } from '@/components/help/HelpSystem';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/admin-login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
          <HelpButton 
            content="Take a tour of the admin dashboard"
            tourId="dashboard-tour"
            className="text-gray-400 hover:text-primary-500"
          />
        </div>
        <p className="text-text-muted">System administration and management</p>
      </div>

      <div className="dashboard-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4">📊 Data Analytics</h3>
          <p className="text-text-muted mb-4">
            View student-course matrix and scheduling conflicts
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/staff/data-extraction')}
          >
            View Analytics
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">⚙️ Rules Engine</h3>
          <p className="text-text-muted mb-4">
            Configure scheduling and examination rules
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/staff/rules')}
          >
            Manage Rules
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📁 CSV Management</h3>
          <p className="text-text-muted mb-4">
            Review and approve HOD course uploads
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/admin/csv-management')}
          >
            Review Uploads
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">🏢 Department Management</h3>
          <p className="text-text-muted mb-4">
            Create and manage departments, assign HODs
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/admin/departments')}
          >
            Manage Departments
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">👥 User Management</h3>
          <p className="text-text-muted mb-4">
            Manage user accounts and roles
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/admin/users')}
          >
            Manage Users
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">🚀 Engine Control</h3>
          <p className="text-text-muted mb-4">
            Execute scheduling engines and view results
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/admin/engine-control')}
          >
            Run Engines
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📊 System Analytics</h3>
          <p className="text-text-muted mb-4">
            View system performance and usage statistics
          </p>
          <Button
            size="sm"
            variant="secondary"
          >
            View Analytics
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📋 Plan Management</h3>
          <p className="text-text-muted mb-4">
            Create and approve examination plans
          </p>
          <Button
            size="sm"
            variant="secondary"
          >
            Manage Plans
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">🔧 Configuration</h3>
          <p className="text-text-muted mb-4">
            System settings and advanced configuration
          </p>
          <Button
            size="sm"
            variant="secondary"
          >
            Settings
          </Button>
        </Card>
      </div>
    </div>
  );
}
