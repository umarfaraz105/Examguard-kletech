'use client';

import React from 'react';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export default function DateRangePicker({
  value,
  onChange,
  className = '',
}: DateRangePickerProps) {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate <= value.to) {
      onChange({ ...value, from: newDate });
    }
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (newDate >= value.from) {
      onChange({ ...value, to: newDate });
    }
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex flex-col">
        <label htmlFor="from-date" className="text-sm font-medium text-gray-700 mb-1">
          From
        </label>
        <input
          id="from-date"
          type="date"
          value={formatDateForInput(value.from)}
          onChange={handleFromChange}
          max={formatDateForInput(value.to)}
          className="px-3 py-2 border border-red-200 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
        />
      </div>
      
      <div className="flex flex-col">
        <label htmlFor="to-date" className="text-sm font-medium text-gray-700 mb-1">
          To
        </label>
        <input
          id="to-date"
          type="date"
          value={formatDateForInput(value.to)}
          onChange={handleToChange}
          min={formatDateForInput(value.from)}
          className="px-3 py-2 border border-red-200 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-sm"
        />
      </div>
    </div>
  );
}
