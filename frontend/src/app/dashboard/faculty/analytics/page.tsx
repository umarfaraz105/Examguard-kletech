'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen,
  Calendar,
  Users,
} from 'lucide-react';
import {
  DateRangePicker,
  MetricCard,
  RegistrationAreaChart,
  RoomUtilizationChart,
  ExamDistributionPieChart,
} from '@/components/charts';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  generateStudentTrendData,
  generateRoomUtilization,
  formatExamDistribution,
  calculateTrend,
} from '@/lib/analytics';
import { addMonths } from 'date-fns';

interface FacultyStats {
  my_courses?: number;
  scheduled_exams?: number;
  enrolled_students?: number;
}

export default function FacultyAnalyticsPage() {
  const { user, hasRole } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: addMonths(new Date(), -6),
    to: new Date(),
  });

  // Redirect if not faculty
  if (!hasRole(['FACULTY' as const, 'HOD' as const])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need faculty privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // API data hooks - fallback to mock data on error  
  const { data: coursesData, loading: coursesLoading } = useAnalytics('/api/courses');
  const { data: schedulesData, loading: schedulesLoading } = useAnalytics('/api/schedules');
  const { data: studentsData, loading: studentsLoading } = useAnalytics('/api/students');

  // Generate mock data as fallback
  const registrationTrendData = generateStudentTrendData(6);
  const roomUtilizationData = generateRoomUtilization(6);
  const examDistributionData = formatExamDistribution(18, 15, 3, 0);

  // Calculate metrics with trends
  const myCourses = coursesData?.length || 8;
  const scheduledExams = schedulesData?.length || 18;
  const enrolledStudents = studentsData?.length || 245;

  // Mock previous period data for trends
  const trends = {
    courses: calculateTrend(myCourses, 7),
    exams: calculateTrend(scheduledExams, 16),
    students: calculateTrend(enrolledStudents, 238),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your courses, exams, and student performance
          </p>
        </div>
        
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="mt-4 md:mt-0"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="My Courses"
          value={myCourses}
          icon={<BookOpen />}
          trend={trends.courses}
          color="blue"
        />
        <MetricCard
          label="Scheduled Exams" 
          value={scheduledExams}
          icon={<Calendar />}
          trend={trends.exams}
          color="green"
        />
        <MetricCard
          label="Students Enrolled"
          value={enrolledStudents}
          icon={<Users />}
          trend={trends.students}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Registration Trends */}
        <RegistrationAreaChart
          data={registrationTrendData}
          loading={studentsLoading}
          height={320}
        />

        {/* Assigned Room Utilization */}
        <RoomUtilizationChart
          data={roomUtilizationData}
          loading={false}
          height={320}
        />
      </div>

      {/* Exam Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExamDistributionPieChart
          data={examDistributionData}
          loading={schedulesLoading}
          height={320}
        />
        
        {/* Additional chart space for future features */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Coming Soon</h3>
              <p className="text-sm text-gray-600">
                Additional analytics features will be available here
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
