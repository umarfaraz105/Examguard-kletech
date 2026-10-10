'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CHART_COLORS } from '@/lib/analytics';
import ChartWrapper from './ChartWrapper';

interface RoomUtilizationData {
  room: string;
  utilization: number;
  capacity: number;
}

interface RoomUtilizationChartProps {
  data: RoomUtilizationData[];
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function RoomUtilizationChart({ 
  data, 
  height = 300,
  loading = false,
  error,
  onRetry,
}: RoomUtilizationChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const room = payload[0].payload;
      const utilizationRate = ((room.utilization / room.capacity) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Capacity: <span className="font-medium">{room.capacity}</span>
          </p>
          <p className="text-sm text-gray-600">
            Utilized: <span className="font-medium">{room.utilization}</span>
          </p>
          <p className="text-sm text-gray-600">
            Rate: <span className="font-medium text-primary">{utilizationRate}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartWrapper
      title="Room Utilization"
      subtitle="Capacity vs actual usage by room"
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="room" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="capacity"
            fill="#e5e7eb"
            name="Capacity"
            radius={[2, 2, 0, 0]}
          />
          <Bar
            dataKey="utilization"
            fill={CHART_COLORS.primary}
            name="Utilized"
            radius={[2, 2, 0, 0]}
          >
            {data.map((entry, index) => {
              const rate = (entry.utilization / entry.capacity) * 100;
              let color: string = CHART_COLORS.success;
              if (rate > 90) color = CHART_COLORS.primary;
              else if (rate > 75) color = CHART_COLORS.warning;
              
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
