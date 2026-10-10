'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/analytics';
import ChartWrapper from './ChartWrapper';

interface RegistrationAreaData {
  month: string;
  registered: number;
  completed: number;
  pending: number;
}

interface RegistrationAreaChartProps {
  data: RegistrationAreaData[];
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function RegistrationAreaChart({ 
  data, 
  height = 300,
  loading = false,
  error,
  onRetry,
}: RegistrationAreaChartProps) {
  return (
    <ChartWrapper
      title="Registration Trends"
      subtitle="Student registration and completion status over time"
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.info} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.info} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
          <Area
            type="monotone"
            dataKey="pending"
            stackId="1"
            stroke={CHART_COLORS.warning}
            fillOpacity={1}
            fill="url(#colorPending)"
            name="Pending"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="1"
            stroke={CHART_COLORS.success}
            fillOpacity={1}
            fill="url(#colorCompleted)"
            name="Completed"
          />
          <Area
            type="monotone"
            dataKey="registered"
            stackId="2"
            stroke={CHART_COLORS.info}
            fillOpacity={1}
            fill="url(#colorRegistered)"
            name="Total Registered"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
