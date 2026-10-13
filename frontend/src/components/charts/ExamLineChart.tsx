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
import ChartDataTable, { generateChartInsights } from './ChartDataTable';

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

const ExamLineChart = React.memo(({ 
  data, 
  height = 300,
  loading = false,
  error,
  onRetry,
}: ExamLineChartProps) => {
  // Sample data if too large (performance optimization)
  const sampledData = React.useMemo(() => {
    if (data.length <= 500) return data;
    
    // Simple sampling: take every Nth point
    const step = Math.ceil(data.length / 500);
    return data.filter((_, index) => index % step === 0);
  }, [data]);

  // Generate accessibility data
  const dataTableColumns = React.useMemo(() => [
    { key: 'month', label: 'Month', format: (value: string) => value },
    { key: 'scheduled', label: 'Scheduled', format: (value: number) => value.toLocaleString() },
    { key: 'completed', label: 'Completed', format: (value: number) => value.toLocaleString() },
    { key: 'ongoing', label: 'Ongoing', format: (value: number) => value.toLocaleString() }
  ], []);

  const chartInsights = React.useMemo(() => 
    generateChartInsights(data, 'line', {
      valueField: 'scheduled',
      labelField: 'month',
      timeField: 'month'
    }),
    [data]
  );

  const dataDescription = React.useMemo(() => 
    `Line chart showing exam statistics over ${data.length} time periods. Tracks scheduled exams (blue line), completed exams (green line), and ongoing exams (light blue line). Lines use both color and different patterns to distinguish data series.${data.length > 500 ? ` Chart displays a sample of ~${sampledData.length} points for performance.` : ''}`,
    [data.length, sampledData.length]
  );

  return (
    <ChartWrapper
      title="Exam Statistics Over Time"
      subtitle="Tracking scheduled, completed, and ongoing exams"
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
      chartType="line"
      dataDescription={dataDescription}
      chartData={data}
      dataTableComponent={
        <ChartDataTable
          data={data}
          columns={dataTableColumns}
          caption="Exam statistics over time showing scheduled, completed, and ongoing exams by month"
          sortable
        />
      }
      keyInsights={chartInsights}
    >
      <ResponsiveContainer width="100%" height={height}>
        <LineChart 
          data={sampledData} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          role="img"
          aria-label="Line chart showing exam statistics trends over time"
        >
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
            aria-label="Number of exams"
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
            strokeWidth={3}
            strokeDasharray="none"
            dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: CHART_COLORS.primary }}
            name="Scheduled"
            aria-label="Scheduled exams trend line"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={CHART_COLORS.success}
            strokeWidth={3}
            strokeDasharray="5,5"
            dot={{ fill: CHART_COLORS.success, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: CHART_COLORS.success }}
            name="Completed"
            aria-label="Completed exams trend line"
          />
          <Line
            type="monotone"
            dataKey="ongoing"
            stroke={CHART_COLORS.info}
            strokeWidth={3}
            strokeDasharray="10,3"
            dot={{ fill: CHART_COLORS.info, strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, stroke: CHART_COLORS.info }}
            name="Ongoing"
            aria-label="Ongoing exams trend line"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
});

ExamLineChart.displayName = 'ExamLineChart';

export default ExamLineChart;
