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
import ChartDataTable, { generateChartInsights } from './ChartDataTable';

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
  // Generate accessibility data
  const dataTableColumns = [
    { key: 'room', label: 'Room', format: (value: string) => value },
    { key: 'capacity', label: 'Capacity', format: (value: number) => value.toLocaleString() },
    { key: 'utilization', label: 'Utilized', format: (value: number) => value.toLocaleString() },
    { 
      key: 'utilizationRate', 
      label: 'Utilization Rate (%)', 
      format: (value: number) => `${value.toFixed(1)}%` 
    }
  ];

  const tableData = data.map(item => ({
    ...item,
    utilizationRate: (item.utilization / item.capacity) * 100
  }));

  const chartInsights = generateChartInsights(tableData, 'bar', {
    valueField: 'utilization',
    labelField: 'room'
  });

  const dataDescription = `Room utilization chart showing capacity versus actual usage across ${data.length} rooms. Each bar represents room capacity with color-coded utilization rates: green for under 75%, yellow for 75-90%, and red for over 90%.`;

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
      chartType="bar"
      dataDescription={dataDescription}
      chartData={tableData}
      dataTableComponent={
        <ChartDataTable
          data={tableData}
          columns={dataTableColumns}
          caption="Room utilization data showing capacity, usage, and utilization rates"
          sortable
        />
      }
      keyInsights={chartInsights}
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          role="img"
          aria-label="Bar chart showing room utilization data"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="room" 
            stroke="#6b7280"
            fontSize={12}
            aria-label="Room names"
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            aria-label="Number of seats"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="capacity"
            fill="#e5e7eb"
            name="Capacity"
            radius={[2, 2, 0, 0]}
            aria-label="Room capacity"
          />
          <Bar
            dataKey="utilization"
            fill={CHART_COLORS.primary}
            name="Utilized"
            radius={[2, 2, 0, 0]}
            aria-label="Current utilization"
          >
            {data.map((entry, index) => {
              const rate = (entry.utilization / entry.capacity) * 100;
              let color: string = CHART_COLORS.success;
              if (rate > 90) color = CHART_COLORS.primary;
              else if (rate > 75) color = CHART_COLORS.warning;
              
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={color}
                  aria-label={`${entry.room}: ${rate.toFixed(1)}% utilized`}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
