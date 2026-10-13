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
import ChartDataTable, { generateChartInsights } from './ChartDataTable';

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

const RegistrationAreaChart = React.memo(({ 
  data, 
  height = 300,
  loading = false,
  error,
  onRetry,
}: RegistrationAreaChartProps) => {
  // Sample data if too large (performance optimization)
  const sampledData = React.useMemo(() => {
    if (data.length <= 500) return data;
    
    const step = Math.ceil(data.length / 500);
    return data.filter((_, index) => index % step === 0);
  }, [data]);

  // Generate accessibility data
  const dataTableColumns = React.useMemo(() => [
    { key: 'month', label: 'Month', format: (value: string) => value },
    { key: 'registered', label: 'Total Registered', format: (value: number) => value.toLocaleString() },
    { key: 'completed', label: 'Completed', format: (value: number) => value.toLocaleString() },
    { key: 'pending', label: 'Pending', format: (value: number) => value.toLocaleString() }
  ], []);

  const chartInsights = React.useMemo(() =>
    generateChartInsights(data, 'area', {
      valueField: 'registered',
      labelField: 'month',
      timeField: 'month'
    }),
    [data]
  );

  const dataDescription = React.useMemo(() =>
    `Stacked area chart showing registration trends over ${data.length} time periods. Blue area represents total registrations, green shows completed registrations, and yellow indicates pending registrations. Areas are stacked and use different fill patterns to distinguish categories.${data.length > 500 ? ` Chart displays a sample of ~${sampledData.length} points for performance.` : ''}`,
    [data.length, sampledData.length]
  );

  return (
    <ChartWrapper
      title="Registration Trends"
      subtitle="Student registration and completion status over time"
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
      chartType="area"
      dataDescription={dataDescription}
      chartData={data}
      dataTableComponent={
        <ChartDataTable
          data={data}
          columns={dataTableColumns}
          caption="Registration trends showing registered, completed, and pending counts by month"
          sortable
        />
      }
      keyInsights={chartInsights}
    >
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart 
          data={sampledData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          role="img"
          aria-label="Stacked area chart showing registration trends over time"
        >
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
            <pattern id="pendingPattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill={CHART_COLORS.warning} fillOpacity="0.1"/>
              <path d="M-1,1 L1,-1 M0,4 L4,0 M3,5 L5,3" stroke={CHART_COLORS.warning} strokeWidth="1" strokeOpacity="0.3"/>
            </pattern>
            <pattern id="completedPattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill={CHART_COLORS.success} fillOpacity="0.1"/>
              <circle cx="2" cy="2" r="1" fill={CHART_COLORS.success} fillOpacity="0.3"/>
            </pattern>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            fontSize={12}
            aria-label="Time period (months)"
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            aria-label="Number of students"
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
            strokeWidth={2}
            strokeDasharray="5,3"
            fillOpacity={1}
            fill="url(#pendingPattern)"
            name="Pending"
            aria-label="Pending registrations area"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="1"
            stroke={CHART_COLORS.success}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#completedPattern)"
            name="Completed"
            aria-label="Completed registrations area"
          />
          <Area
            type="monotone"
            dataKey="registered"
            stackId="2"
            stroke={CHART_COLORS.info}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRegistered)"
            name="Total Registered"
            aria-label="Total registered area"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
});

RegistrationAreaChart.displayName = 'RegistrationAreaChart';

export default RegistrationAreaChart;
