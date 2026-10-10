'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  MetricCard,
  ExamLineChart,
  RegistrationAreaChart,
  ExamDistributionPieChart,
} from '@/components/charts';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  generateExamStatsOverTime,
  generateStudentTrendData,
  formatExamDistribution,
  calculateTrend,
} from '@/lib/analytics';

interface StudentStats {
  registered_courses?: number;
  upcoming_exams?: number;
  completed_exams?: number;
}

export default function StudentAnalyticsPage() {
  const { user, hasRole } = useAuth();

  // Redirect if not student
  if (!hasRole(['STUDENT' as const])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">This page is only available to students.</p>
        </div>
      </div>
    );
  }

  // API data hooks - fallback to mock data on error
  const { data: registrationsData, loading: registrationsLoading } = useAnalytics('/api/course-registrations', 60000);
  const { data: schedulesData, loading: schedulesLoading } = useAnalytics('/api/schedules', 60000);

  // Generate mock data as fallback
  const examTimelineData = generateExamStatsOverTime(6).map(item => ({
    ...item,
    scheduled: Math.floor(item.scheduled * 0.3), // Personal scale
    completed: Math.floor(item.completed * 0.3),
    ongoing: Math.floor(item.ongoing * 0.3),
  }));
  
  const registrationHistoryData = generateStudentTrendData(6).map(item => ({
    ...item,
    registered: Math.floor(item.registered * 0.05), // Personal scale
    completed: Math.floor(item.completed * 0.05),
    pending: Math.floor(item.pending * 0.05),
  }));

  const examStatusData = formatExamDistribution(8, 12, 2, 0);

  // Calculate metrics with trends
  const registeredCourses = registrationsData?.length || 6;
  const upcomingExams = 8;
  const completedExams = 12;

  // Mock previous period data for trends
  const trends = {
    courses: calculateTrend(registeredCourses, 5),
    upcoming: calculateTrend(upcomingExams, 10),
    completed: calculateTrend(completedExams, 9),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your academic progress and exam performance
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          label="Registered Courses"
          value={registeredCourses}
          icon={<BookOpen />}
          trend={trends.courses}
          color="blue"
        />
        <MetricCard
          label="Upcoming Exams" 
          value={upcomingExams}
          icon={<Calendar />}
          trend={trends.upcoming}
          color="amber"
        />
        <MetricCard
          label="Completed Exams"
          value={completedExams}
          icon={<CheckCircle />}
          trend={trends.completed}
          color="green"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Exam Timeline */}
        <ExamLineChart
          data={examTimelineData}
          loading={schedulesLoading}
          height={320}
        />

        {/* Registration History */}
        <RegistrationAreaChart
          data={registrationHistoryData}
          loading={registrationsLoading}
          height={320}
        />
      </div>

      {/* Exam Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExamDistributionPieChart
          data={examStatusData}
          loading={false}
          height={320}
        />
        
        {/* Academic Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Course Completion</span>
                <span>75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Attendance Rate</span>
                <span>92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                <span>Assignment Submission</span>
                <span>88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Overall Performance</span>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-green-600 mr-2">B+</span>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  Excellent
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
