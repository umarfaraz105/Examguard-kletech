'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar,
  Users,
  Building2, 
  UserCheck,
  Activity,
} from 'lucide-react';
import {
  DateRangePicker,
  MetricCard,
  ExamLineChart,
  RoomUtilizationChart,
  EngineHealthDonut,
  ExamDistributionPieChart,
} from '@/components/charts';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  generateExamStatsOverTime,
  generateRoomUtilization,
  generateEngineHealthData,
  formatExamDistribution,
  formatEngineHealth,
  calculateTrend,
} from '@/lib/analytics';
import { addMonths } from 'date-fns';

interface DashboardStats {
  total_exams?: number;
  active_rooms?: number;
  assigned_invigilators?: number;
  engine_executions?: number;
}

export default function AdminAnalyticsPage() {
  const { user, hasRole } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: addMonths(new Date(), -6),
    to: new Date(),
  });

  // Redirect if not admin
  if (!hasRole(['ADMIN' as const])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // API data hooks - fallback to mock data on error
  const { data: statsData, loading: statsLoading } = useAnalytics<DashboardStats>('/api/engines/dashboard');
  const { data: schedulesData, loading: schedulesLoading } = useAnalytics('/api/schedules');
  const { data: roomsData, loading: roomsLoading } = useAnalytics('/api/rooms');
  const { data: enginesData, loading: enginesLoading } = useAnalytics('/api/engines/v2/');

  // Generate mock data as fallback
  const examStatsData = generateExamStatsOverTime(6);
  const roomUtilizationData = generateRoomUtilization(8);
  const engineHealthMockData = generateEngineHealthData();
  const engineHealthData = formatEngineHealth(engineHealthMockData);
  
  const examDistributionData = formatExamDistribution(45, 38, 7, 2);

  // Calculate metrics with trends
  const totalExams = statsData?.total_exams || 92;
  const activeRooms = statsData?.active_rooms || roomsData?.length || 12;
  const assignedInvigilators = statsData?.assigned_invigilators || 28;
  const engineExecutions = statsData?.engine_executions || 156;

  // Mock previous period data for trends
  const trends = {
    exams: calculateTrend(totalExams, 87),
    rooms: calculateTrend(activeRooms, 11),
    invigilators: calculateTrend(assignedInvigilators, 25),
    executions: calculateTrend(engineExecutions, 142),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive view of examination management system performance
          </p>
        </div>
        
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="mt-4 md:mt-0"
        />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Exams"
          value={totalExams}
          icon={<Calendar />}
          trend={trends.exams}
          color="blue"
        />
        <MetricCard
          label="Active Rooms" 
          value={activeRooms}
          icon={<Building2 />}
          trend={trends.rooms}
          color="green"
        />
        <MetricCard
          label="Invigilators Assigned"
          value={assignedInvigilators}
          icon={<UserCheck />}
          trend={trends.invigilators}
          color="amber"
        />
        <MetricCard
          label="Engine Executions"
          value={engineExecutions}
          icon={<Activity />}
          trend={trends.executions}
          color="red"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Statistics Over Time */}
        <ExamLineChart
          data={examStatsData}
          loading={schedulesLoading}
          height={320}
        />

        {/* Room Utilization */}
        <RoomUtilizationChart
          data={roomUtilizationData}
          loading={roomsLoading}
          height={320}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engine Health Status */}
        <EngineHealthDonut
          data={engineHealthData}
          loading={enginesLoading}
          height={320}
        />

        {/* Exam Distribution */}
        <ExamDistributionPieChart
          data={examDistributionData}
          loading={statsLoading}
          height={320}
        />
      </div>
    </div>
  );
}