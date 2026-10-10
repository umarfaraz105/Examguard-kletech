'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChartDataTableProps {
  data: Record<string, any>[];
  columns?: {
    key: string;
    label: string;
    format?: (value: any) => string;
  }[];
  caption?: string;
  className?: string;
  sortable?: boolean;
}

export default function ChartDataTable({
  data,
  columns,
  caption,
  className = '',
  sortable = false,
}: ChartDataTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Auto-generate columns if not provided
  const tableColumns = columns || (data.length > 0 ? 
    Object.keys(data[0]).map(key => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      format: (value: any) => typeof value === 'number' ? value.toLocaleString() : String(value)
    })) : []
  );

  // Sort data if sortable
  const sortedData = React.useMemo(() => {
    if (!sortable || !sortColumn) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      let comparison = 0;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [data, sortColumn, sortDirection, sortable]);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, columnKey: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSort(columnKey);
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500" role="status" aria-live="polite">
        No data available
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200" role="table">
        {caption && (
          <caption className="text-left text-sm text-gray-600 pb-3 font-medium">
            {caption}
          </caption>
        )}
        
        <thead className="bg-gray-50">
          <tr>
            {tableColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  sortable && 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none'
                )}
                onClick={() => sortable && handleSort(column.key)}
                onKeyDown={(e) => handleKeyDown(e, column.key)}
                tabIndex={sortable ? 0 : undefined}
                role={sortable ? 'button' : 'columnheader'}
                aria-sort={
                  sortColumn === column.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : sortable
                    ? 'none'
                    : undefined
                }
                aria-label={
                  sortable
                    ? `Sort by ${column.label} ${
                        sortColumn === column.key
                          ? sortDirection === 'asc'
                            ? 'descending'
                            : 'ascending'
                          : 'ascending'
                      }`
                    : column.label
                }
              >
                <div className="flex items-center space-x-1">
                  <span>{column.label}</span>
                  {sortable && (
                    <span className="flex flex-col" aria-hidden="true">
                      <span
                        className={cn(
                          'text-xs leading-none',
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-gray-900'
                            : 'text-gray-300'
                        )}
                      >
                        ▲
                      </span>
                      <span
                        className={cn(
                          'text-xs leading-none',
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-gray-900'
                            : 'text-gray-300'
                        )}
                      >
                        ▼
                      </span>
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {tableColumns.map((column) => (
                <td
                  key={column.key}
                  className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.format
                    ? column.format(row[column.key])
                    : String(row[column.key] || '-')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Screen reader summary */}
      <div className="sr-only" aria-live="polite" role="status">
        Table with {sortedData.length} rows and {tableColumns.length} columns.
        {sortColumn && (
          <span>
            {' '}
            Sorted by {tableColumns.find(col => col.key === sortColumn)?.label} in{' '}
            {sortDirection === 'asc' ? 'ascending' : 'descending'} order.
          </span>
        )}
      </div>
    </div>
  );
}

// Helper function to generate insights for charts
export function generateChartInsights(
  data: any[],
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'donut',
  options?: {
    valueField?: string;
    labelField?: string;
    timeField?: string;
  }
): string[] {
  if (!data.length) return [];

  const insights: string[] = [];
  const { valueField = 'value', labelField = 'name', timeField = 'month' } = options || {};

  try {
    if (chartType === 'pie' || chartType === 'donut') {
      const total = data.reduce((sum, item) => sum + (item[valueField] || 0), 0);
      const largest = data.reduce((max, item) => 
        (item[valueField] || 0) > (max[valueField] || 0) ? item : max
      );
      
      if (total > 0) {
        const largestPercent = ((largest[valueField] / total) * 100).toFixed(1);
        insights.push(`${largest[labelField]} represents the largest segment at ${largestPercent}%`);
        insights.push(`Total value across all segments: ${total.toLocaleString()}`);
      }
    } 
    
    else if (chartType === 'bar') {
      const values = data.map(item => item[valueField] || 0).filter(v => typeof v === 'number');
      if (values.length) {
        const max = Math.max(...values);
        const min = Math.min(...values);
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        const maxItem = data.find(item => item[valueField] === max);
        const minItem = data.find(item => item[valueField] === min);
        
        insights.push(`Highest value: ${maxItem?.[labelField]} (${max.toLocaleString()})`);
        insights.push(`Lowest value: ${minItem?.[labelField]} (${min.toLocaleString()})`);
        insights.push(`Average value: ${avg.toFixed(0)}`);
      }
    }
    
    else if (chartType === 'line' || chartType === 'area') {
      if (data.length >= 2) {
        const firstValue = data[0][valueField] || 0;
        const lastValue = data[data.length - 1][valueField] || 0;
        
        if (typeof firstValue === 'number' && typeof lastValue === 'number') {
          const change = lastValue - firstValue;
          const changePercent = firstValue !== 0 ? ((change / firstValue) * 100).toFixed(1) : '0';
          
          insights.push(`Overall trend: ${change >= 0 ? 'increasing' : 'decreasing'} by ${Math.abs(change).toLocaleString()}`);
          if (firstValue !== 0) {
            insights.push(`Percentage change: ${change >= 0 ? '+' : ''}${changePercent}%`);
          }
        }
      }
    }

    // Add data range info
    if (data.length > 0) {
      insights.push(`Data covers ${data.length} data points`);
    }

  } catch (error) {
    console.warn('Error generating chart insights:', error);
  }

  return insights;
}