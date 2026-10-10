'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS, CHART_COLOR_ARRAY } from '@/lib/analytics';
import ChartWrapper from './ChartWrapper';
import ChartDataTable, { generateChartInsights } from './ChartDataTable';

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface ExamDistributionPieChartProps {
  data: PieChartData[];
  height?: number;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export default function ExamDistributionPieChart({ 
  data, 
  height = 300,
  loading = false,
  error,
  onRetry,
}: ExamDistributionPieChartProps) {
  // Calculate percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Generate accessibility data
  const dataTableColumns = [
    { key: 'name', label: 'Category', format: (value: string) => value },
    { key: 'value', label: 'Count', format: (value: number) => value.toLocaleString() },
    { 
      key: 'percentage', 
      label: 'Percentage', 
      format: (value: number) => `${value.toFixed(1)}%` 
    }
  ];

  const tableData = data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  }));

  const chartInsights = generateChartInsights(data, 'pie', {
    valueField: 'value',
    labelField: 'name'
  });

  const dataDescription = `Pie chart showing the distribution of ${total.toLocaleString()} exams across ${data.length} categories. Each segment uses distinct colors and patterns, with percentages labeled for segments over 5% of the total.`;

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for slices < 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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

  return (
    <ChartWrapper
      title="Exam Distribution"
      subtitle={`Total: ${total} exams`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
      chartType="pie"
      dataDescription={dataDescription}
      chartData={tableData}
      dataTableComponent={
        <ChartDataTable
          data={tableData}
          columns={dataTableColumns}
          caption="Exam distribution data showing counts and percentages by category"
          sortable
        />
      }
      keyInsights={chartInsights}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart role="img" aria-label="Pie chart showing exam distribution by category">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={<CustomLabel />}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            role="img"
            aria-label="Pie chart segments"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || CHART_COLOR_ARRAY[index % CHART_COLOR_ARRAY.length]} 
                stroke="#fff"
                strokeWidth={2}
                aria-label={`${entry.name}: ${entry.value} exams (${((entry.value / total) * 100).toFixed(1)}%)`}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
