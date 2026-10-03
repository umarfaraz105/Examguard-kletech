/**
 * AdvancedFilter Component - Complex filtering interface for data tables
 */

'use client';

import React, { useState } from 'react';
import { Plus, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableColumn, FilterValue } from '@/lib/hooks/useTableData';

export interface AdvancedFilterProps {
  columns: TableColumn[];
  filters: FilterValue[];
  onFiltersChange: (filters: FilterValue[]) => void;
  onClose?: () => void;
}

const OPERATORS = {
  text: [
    { label: 'Contains', value: 'contains' },
    { label: 'Equals', value: 'equals' },
    { label: 'Starts with', value: 'startsWith' },
    { label: 'Ends with', value: 'endsWith' },
  ],
  number: [
    { label: 'Equals', value: 'equals' },
    { label: 'Greater than', value: 'gt' },
    { label: 'Less than', value: 'lt' },
    { label: 'Greater than or equal', value: 'gte' },
    { label: 'Less than or equal', value: 'lte' },
    { label: 'Between', value: 'between' },
  ],
  select: [
    { label: 'Equals', value: 'equals' },
    { label: 'In list', value: 'in' },
  ],
  date: [
    { label: 'Equals', value: 'equals' },
    { label: 'After', value: 'gt' },
    { label: 'Before', value: 'lt' },
    { label: 'Between', value: 'between' },
  ],
  boolean: [
    { label: 'Equals', value: 'equals' },
  ],
};

export const AdvancedFilter: React.FC<AdvancedFilterProps> = ({
  columns,
  filters,
  onFiltersChange,
  onClose
}) => {
  const [newFilter, setNewFilter] = useState<Partial<FilterValue>>({});

  const filterableColumns = columns.filter(col => col.filterable !== false);

  const addFilter = () => {
    if (newFilter.column && newFilter.operator && newFilter.value !== undefined) {
      onFiltersChange([...filters, newFilter as FilterValue]);
      setNewFilter({});
    }
  };

  const updateFilter = (index: number, updates: Partial<FilterValue>) => {
    const updatedFilters = filters.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    );
    onFiltersChange(updatedFilters);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const getOperators = (columnType: string) => {
    return OPERATORS[columnType as keyof typeof OPERATORS] || OPERATORS.text;
  };

  const renderFilterValue = (filter: FilterValue, index: number) => {
    const column = columns.find(col => col.key === filter.column);
    if (!column) return null;

    const updateValue = (value: any, isValue2 = false) => {
      updateFilter(index, isValue2 ? { value2: value } : { value });
    };

    switch (column.filterType || 'text') {
      case 'select':
        return (
          <Select
            value={filter.value}
            onValueChange={updateValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {column.filterOptions?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={filter.value || ''}
              onChange={(e) => updateValue(e.target.value)}
              placeholder="Value"
            />
            {filter.operator === 'between' && (
              <Input
                type="number"
                value={filter.value2 || ''}
                onChange={(e) => updateValue(e.target.value, true)}
                placeholder="To"
              />
            )}
          </div>
        );
      
      case 'date':
        return (
          <div className="flex gap-2">
            <Input
              type="date"
              value={filter.value || ''}
              onChange={(e) => updateValue(e.target.value)}
            />
            {filter.operator === 'between' && (
              <Input
                type="date"
                value={filter.value2 || ''}
                onChange={(e) => updateValue(e.target.value, true)}
              />
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <Select
            value={filter.value?.toString()}
            onValueChange={(value) => updateValue(value === 'true')}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={filter.value || ''}
            onChange={(e) => updateValue(e.target.value)}
            placeholder="Enter value"
          />
        );
    }
  };

  const renderNewFilterValue = () => {
    const column = columns.find(col => col.key === newFilter.column);
    if (!column || !newFilter.operator) return null;

    const updateNewValue = (value: any, isValue2 = false) => {
      setNewFilter(prev => ({ ...prev, [isValue2 ? 'value2' : 'value']: value }));
    };

    switch (column.filterType || 'text') {
      case 'select':
        return (
          <Select
            value={newFilter.value}
            onValueChange={updateNewValue}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              {column.filterOptions?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={newFilter.value || ''}
              onChange={(e) => updateNewValue(e.target.value)}
              placeholder="Value"
            />
            {newFilter.operator === 'between' && (
              <Input
                type="number"
                value={newFilter.value2 || ''}
                onChange={(e) => updateNewValue(e.target.value, true)}
                placeholder="To"
              />
            )}
          </div>
        );
      
      case 'date':
        return (
          <div className="flex gap-2">
            <Input
              type="date"
              value={newFilter.value || ''}
              onChange={(e) => updateNewValue(e.target.value)}
            />
            {newFilter.operator === 'between' && (
              <Input
                type="date"
                value={newFilter.value2 || ''}
                onChange={(e) => updateNewValue(e.target.value, true)}
              />
            )}
          </div>
        );
      
      case 'boolean':
        return (
          <Select
            value={newFilter.value?.toString()}
            onValueChange={(value) => updateNewValue(value === 'true')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select value" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            value={newFilter.value || ''}
            onChange={(e) => updateNewValue(e.target.value)}
            placeholder="Enter value"
          />
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </CardTitle>
        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <>
              <Badge variant="secondary">{filters.length} active</Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Filters */}
        {filters.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Active Filters</Label>
            <div className="space-y-3">
              {filters.map((filter, index) => {
                const column = columns.find(col => col.key === filter.column);
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Column</Label>
                        <p className="font-medium">{column?.header}</p>
                      </div>
                      <div>
                        <Label className="text-xs">Operator</Label>
                        <Select
                          value={filter.operator}
                          onValueChange={(value: any) => updateFilter(index, { operator: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getOperators(column?.filterType || 'text').map(op => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Value</Label>
                        {renderFilterValue(filter, index)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFilter(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Add New Filter</Label>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <Label className="text-xs">Column</Label>
              <Select
                value={newFilter.column}
                onValueChange={(value) => setNewFilter({ column: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {filterableColumns.map(column => (
                    <SelectItem key={column.key} value={column.key}>
                      {column.header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newFilter.column && (
              <div>
                <Label className="text-xs">Operator</Label>
                <Select
                  value={newFilter.operator}
                  onValueChange={(value: any) => setNewFilter(prev => ({ ...prev, operator: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperators(
                      columns.find(col => col.key === newFilter.column)?.filterType || 'text'
                    ).map(op => (
                      <SelectItem key={op.value} value={op.value}>
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {newFilter.column && newFilter.operator && (
              <div>
                <Label className="text-xs">Value</Label>
                {renderNewFilterValue()}
              </div>
            )}

            <Button
              onClick={addFilter}
              disabled={!newFilter.column || !newFilter.operator || newFilter.value === undefined}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedFilter;