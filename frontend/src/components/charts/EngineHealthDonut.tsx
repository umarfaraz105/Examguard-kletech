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
import ChartDataTable, { generateChartInsights } from './ChartDataTable';

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

const EngineHealthDonut = React.memo(({ 
  data, 
  centerLabel,
  height = 300,
  loading = false,
  error,
  onRetry,
}: EngineHealthDonutProps) => {
  const total = React.useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
  const successRate = React.useMemo(() => data.find(d => d.name === 'Success')?.value || 0, [data]);
  const healthPercentage = React.useMemo(() =>
    total > 0 ? ((successRate / total) * 100).toFixed(1) : '0',
    [total, successRate]
  );

  // Generate accessibility data
  const dataTableColumns = React.useMemo(() => [
    { key: 'name', label: 'Status', format: (value: string) => value },
    { key: 'value', label: 'Count', format: (value: number) => value.toLocaleString() },
    { 
      key: 'percentage', 
      label: 'Percentage', 
      format: (value: number) => `${value.toFixed(1)}%` 
    }
  ], []);

  const tableData = React.useMemo(() => data.map(item => ({
    ...item,
    percentage: total > 0 ? (item.value / total) * 100 : 0
  })), [data, total]);

  const chartInsights = React.useMemo(() =>
    generateChartInsights(data, 'donut', {
      valueField: 'value',
      labelField: 'name'
    }),
    [data]
  );

  const dataDescription = React.useMemo(() =>
    `Donut chart displaying engine health status with ${total.toLocaleString()} total executions. The center shows the overall success rate of ${healthPercentage}%. Different colored segments use distinct patterns to represent success and failure rates.`,
    [total, healthPercentage]
  );

  const CustomTooltip = React.useCallback(({ active, payload }: any) => {
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
  }, [total]);

  const CenterLabel = React.useCallback(({ viewBox }: any) => {
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
  }, [centerLabel, healthPercentage]);

  return (
    <ChartWrapper
      title="Engine Health Status"
      subtitle={`Total executions: ${total}`}
      loading={loading}
      error={error}
      onRetry={onRetry}
      exportable
      chartType="donut"
      dataDescription={dataDescription}
      chartData={tableData}
      dataTableComponent={
        <ChartDataTable
          data={tableData}
          columns={dataTableColumns}
          caption="Engine health status showing success and failure counts with percentages"
          sortable
        />
      }
      keyInsights={chartInsights}
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart role="img" aria-label="Donut chart showing engine health status">
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
            role="img"
            aria-label="Engine status segments"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="#fff"
                strokeWidth={3}
                strokeDasharray={entry.name === 'Success' ? 'none' : '5,2'}
                aria-label={`${entry.name}: ${entry.value} executions (${((entry.value / total) * 100).toFixed(1)}%)`}
              />
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
});

EngineHealthDonut.displayName = 'EngineHealthDonut';

export default EngineHealthDonut;
