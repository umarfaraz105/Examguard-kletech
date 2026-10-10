'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '@/lib/analytics';
import ChartWrapper from './ChartWrapper';

interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface EngineHealthDonutProps {
  data: DonutChartData[];
  centerLabel?: string;
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function EngineHealthDonut({ 
  data, 
  centerLabel,
  height = 300,
  loading = false,
  error,
  onRetry,
}: EngineHealthDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const successRate = data.find(d => d.name === 'Success')?.value || 0;
  const healthPercentage = total > 0 ? ((successRate / total) * 100).toFixed(1) : '0';

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium text-primary">{percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CenterLabel = ({ viewBox }: any) => {
    const { cx, cy } = viewBox;
    return (
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
        <tspan 
          x={cx} 
          y={cy - 10} 
          className="text-2xl font-bold" 
          fill={CHART_COLORS.primary}
        >
          {centerLabel || `${healthPercentage}%`}
        </tspan>
        <tspan 
          x={cx} 
          y={cy + 15} 
          className="text-sm" 
          fill="#6b7280"
        >
          {centerLabel ? 'Total' : 'Success Rate'}
        </tspan>
      </text>
    );
  };

  return (
    <ChartWrapper
      title="Engine Health Status"
      subtitle={`Total executions: ${total}`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Pie
            data={[{ value: 1 }]}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={40}
            fill="transparent"
            dataKey="value"
            labelLine={false}
            label={<CenterLabel />}
          />
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
