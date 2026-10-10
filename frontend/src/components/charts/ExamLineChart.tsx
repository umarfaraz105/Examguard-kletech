'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/analytics';
import ChartWrapper from './ChartWrapper';

interface ExamLineChartData {
  month: string;
  scheduled: number;
  completed: number;
  ongoing: number;
}

interface ExamLineChartProps {
  data: ExamLineChartData[];
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function ExamLineChart({ 
  data, 
  height = 300,
  loading = false,
  error,
  onRetry,
}: ExamLineChartProps) {
  return (
    <ChartWrapper
      title="Exam Statistics Over Time"
      subtitle="Tracking scheduled, completed, and ongoing exams"
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="scheduled"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: CHART_COLORS.primary }}
            name="Scheduled"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={CHART_COLORS.success}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: CHART_COLORS.success }}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="ongoing"
            stroke={CHART_COLORS.info}
            strokeWidth={2}
            dot={{ fill: CHART_COLORS.info, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: CHART_COLORS.info }}
            name="Ongoing"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
