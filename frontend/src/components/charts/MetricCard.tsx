'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendData {
  value: number;
  positive: boolean;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: TrendData;
  color?: 'red' | 'green' | 'blue' | 'amber';
}

const colorClasses = {
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    text: 'text-red-900',
    border: 'border-red-200',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    text: 'text-green-900',
    border: 'border-green-200',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    text: 'text-blue-900',
    border: 'border-blue-200',
  },
  amber: {
    bg: 'bg-amber-50',
    icon: 'text-amber-600',
    text: 'text-amber-900',
    border: 'border-amber-200',
  },
};

export default function MetricCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
}: MetricCardProps) {
  const styles = colorClasses[color];

  return (
    <div className={`${styles.bg} ${styles.border} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${styles.text} mt-1`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className={`${styles.icon} flex-shrink-0`}>
            {React.cloneElement(icon as React.ReactElement, { 
              className: 'w-8 h-8' 
            })}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center mt-3">
          {trend.positive ? (
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
          )}
          <span 
            className={`text-sm font-medium ${
              trend.positive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.value}%
          </span>
          <span className="text-sm text-gray-500 ml-1">
            {trend.positive ? 'increase' : 'decrease'}
          </span>
        </div>
      )}
    </div>
  );
}
