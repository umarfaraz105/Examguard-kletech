'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

export default function HODDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'HOD') {
      router.push('/login/hod');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'HOD') {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">HOD Dashboard</h1>
        <p className="text-text-muted">Department management and course registration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4">📁 CSV Upload</h3>
          <p className="text-text-muted mb-4">Upload department course registration data</p>
          <Button onClick={() => router.push('/dashboard/hod/csv-upload')} size="sm">
            Upload File
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📊 Upload Status</h3>
          <p className="text-text-muted mb-4">Track submission status and validation results</p>
          <Button onClick={() => router.push('/dashboard/hod/csv-upload')} size="sm" variant="secondary">
            View Uploads
          </Button>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📅 Department Timetable</h3>
          <p className="text-text-muted">View examination schedule for your department</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">👨‍🏫 Faculty Duties</h3>
          <p className="text-text-muted">Approve and recommend invigilation assignments</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">🔔 Notifications</h3>
          <p className="text-text-muted">Department-specific alerts and updates</p>
        </Card>
      </div>
    </div>
  );
}
