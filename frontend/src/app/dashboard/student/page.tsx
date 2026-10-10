'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Download, BookOpen, Bell, BarChart3, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'STUDENT' && user?.role !== 'student')) {
      router.push('/login/student');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user?.role !== 'STUDENT' && user?.role !== 'student')) {
    return <div>Redirectering...</div>;
  }

  // Mock data for demonstration
  const upcomingExams = [
    {
      id: 1,
      subject: 'Mathematics - I',
      date: '2026-10-15',
      time: '09:00 - 12:00',
      room: 'Room 101',
      seat: 'A-15',
      type: 'Mid Term'
    },
    {
      id: 2,
      subject: 'Physics - II',
      date: '2026-10-18',
      time: '14:00 - 17:00',
      room: 'Room 205',
      seat: 'B-22',
      type: 'Final'
    }
  ];

  const stats = {
    totalCourses: 6,
    upcomingExams: 2,
    completedExams: 4,
    unreadNotifications: 3
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-gray-600">Your examination information and resources</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Registered Courses</p>
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Exams</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcomingExams}</p>
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
                <p className="text-2xl font-bold text-green-600">{stats.completedExams}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-red-600">{stats.unreadNotifications}</p>
              </div>
              <Bell className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              My Timetable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your examination schedule and important dates</p>
            <Link href="/dashboard/student/timetable">
              <Button className="w-full">View Timetable</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              My Seating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Hall, block, and seat assignment details</p>
            <Link href="/dashboard/student/seating">
              <Button className="w-full">View Seating</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Hall Ticket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Download your examination hall ticket</p>
            <Link href="/dashboard/student/hall-ticket">
              <Button className="w-full">Download Ticket</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              Registered Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your registered courses and details</p>
            <Link href="/dashboard/student/courses">
              <Button className="w-full">View Courses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-600" />
              Notifications
              {stats.unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {stats.unreadNotifications}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Important exam-related announcements</p>
            <Link href="/dashboard/student/notifications">
              <Button className="w-full">View Notifications</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              My Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View examination results when available</p>
            <Link href="/dashboard/student/results">
              <Button className="w-full">View Results</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Exams Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Upcoming Examinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingExams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming examinations scheduled</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{exam.subject}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{exam.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{exam.room} - Seat {exam.seat}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {exam.type}
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
