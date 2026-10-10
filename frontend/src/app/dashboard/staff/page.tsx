'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';

export default function StaffDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'EXAM_CELL') {
      router.push('/login/staff');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'EXAM_CELL') {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Staff Dashboard</h1>
        <p className="text-text-muted">Examination planning and operational management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-xl font-semibold mb-4">📊 Data Extraction</h3>
          <p className="text-text-muted mb-4">
            View student-course matrix and scheduling conflicts
          </p>
          <Button
            size="sm"
            onClick={() => router.push('/dashboard/staff/data-extraction')}
          >
            View Analysis
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
          <h3 className="text-xl font-semibold mb-4">🏛️ Hall Setup</h3>
          <p className="text-text-muted">Prepare examination halls and seating arrangements</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📋 Attendance Sheets</h3>
          <p className="text-text-muted">Generate and print attendance sheets</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">💺 Seating Printouts</h3>
          <p className="text-text-muted">Print seating arrangements and hall tickets</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">👨‍🏫 Duty Reports</h3>
          <p className="text-text-muted">View and manage invigilation duty assignments</p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-4">📊 Operations Overview</h3>
          <p className="text-text-muted">Monitor ongoing examinations and status</p>
        </Card>
      </div>
    </div>
  );
}
