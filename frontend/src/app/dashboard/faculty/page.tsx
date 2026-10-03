'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Calendar, RefreshCw, Bell, Clock, MapPin, Users, AlertCircle } from 'lucide-react';

export default function FacultyDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'FACULTY' && user?.role !== 'staff')) {
      router.push('/login/faculty');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'FACULTY' && user?.role !== 'staff')) {
    return <div>Redirecting...</div>;
  }

  // Mock data for demonstration
  const upcomingDuties = [
    {
      id: 1,
      subject: 'Mathematics - I',
      date: '2026-10-15',
      time: '09:00 - 12:00',
      room: 'Room 101',
      type: 'Mid Term'
    },
    {
      id: 2,
      subject: 'Physics - II',
      date: '2026-10-18',
      time: '14:00 - 17:00',
      room: 'Room 205',
      type: 'Final'
    }
  ];

  const stats = {
    totalDuties: 12,
    upcomingDuties: 2,
    completedDuties: 8,
    pendingSwaps: 1
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
        <p className="text-gray-600">Invigilation duties and examination management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duties</p>
                <p className="text-2xl font-bold">{stats.totalDuties}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingDuties}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedDuties}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Swaps</p>
                <p className="text-2xl font-bold text-red-600">{stats.pendingSwaps}</p>
              </div>
              <RefreshCw className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              My Duties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your assigned invigilation duties and schedules</p>
            <Link href="/dashboard/faculty/duties">
              <Button className="w-full">View All Duties</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Duty Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Calendar view of all your examination duties</p>
            <Link href="/dashboard/faculty/calendar">
              <Button className="w-full">Open Calendar</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-orange-600" />
              Request Duty Swap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Request to swap duties with other faculty members</p>
            <Link href="/dashboard/faculty/swaps">
              <Button className="w-full">Manage Swaps</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Duty updates and important announcements</p>
            <Link href="/dashboard/faculty/notifications">
              <Button className="w-full">View Notifications</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Duties Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Duties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDuties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming duties scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingDuties.map((duty) => (
                <div key={duty.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{duty.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(duty.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{duty.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{duty.room}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {duty.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}