/**
 * DataTable Component - Advanced table with search, filter, and pagination
 */

'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useTableData, TableColumn, FilterValue } from '@/lib/hooks/useTableData';
import { TableSkeleton } from '@/components/loading/LoadingSkeletons';
import { useDebounce } from '@/hooks/useDebounce';

export interface DataTableProps<T> {
  data: T[];
  columns: TableColumn[];
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  pageSize?: number;
  enableGlobalSearch?: boolean;
  enableColumnSearch?: boolean;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableExport?: boolean;
  className?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: {
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }[];
}

export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  enableGlobalSearch = true,
  enableColumnSearch = false,
  enableFiltering = true,
  enableSorting = true,
  enablePagination = true,
  enableExport = false,
  className,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  loading = false,
  onRowClick,
  onSelectionChange,
  actions
}: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);

  const {
    data: paginatedData,
    globalSearch,
    columnSearches,
    handleGlobalSearch,
    handleColumnSearch,
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    sortConfig,
    handleSort,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    isEmpty,
    isFiltered,
    totalItems
  } = useTableData({
    data,
    columns,
    initialPageSize: pageSize,
    enableGlobalSearch
  });

  // Update table data when debounced search changes
  React.useEffect(() => {
    handleGlobalSearch(debouncedSearch);
  }, [debouncedSearch, handleGlobalSearch]);

  const handleRowSelect = React.useCallback((index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    
    if (onSelectionChange) {
      const selectedData = Array.from(newSelected).map(i => paginatedData[i]);
      onSelectionChange(selectedData);
    }
  }, [selectedRows, paginatedData, onSelectionChange]);

  const handleSelectAll = React.useCallback((checked: boolean) => {
    if (checked) {
      const allIndices = paginatedData.map((_, i) => i);
      setSelectedRows(new Set(allIndices));
      onSelectionChange?.(paginatedData);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  }, [paginatedData, onSelectionChange]);

  const renderCell = React.useCallback((column: TableColumn, value: any, row: T) => {
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.format) {
      return column.format(value);
    }
    
    if (value == null) {
      return <span className="text-gray-400">—</span>;
    }
    
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }
    
    return String(value);
  }, []);

  const getSortIcon = React.useCallback((columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? (
      <SortAsc className="h-4 w-4" />
    ) : (
      <SortDesc className="h-4 w-4" />
    );
  }, [sortConfig]);

  const renderPagination = React.useCallback(() => {
    if (!enablePagination) return null;

    const { page, totalPages, totalItems } = pagination;
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="hidden sm:inline">Show</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => handlePageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-16" aria-label="Items per page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="hidden sm:inline">per page</span>
        </div>

        <div className="text-sm text-gray-600 text-center sm:text-left" role="status" aria-live="polite">
          <span className="hidden sm:inline">Showing </span>
          {startItem}-{endItem} of {totalItems}
          <span className="sm:hidden"> items</span>
          <span className="hidden sm:inline"> results</span>
        </div>

        <nav className="flex items-center justify-center gap-1 sm:gap-2" role="navigation" aria-label="Table pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
            aria-label="Go to previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>
          
          <div className="flex items-center gap-1" role="group" aria-label="Page numbers">
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 2, page - 1)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className="min-w-[44px] min-h-[44px] sm:min-h-auto"
                  onClick={() => handlePageChange(pageNum)}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={page === pageNum ? "page" : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="min-h-[44px] min-w-[44px] sm:min-h-auto sm:min-w-auto"
            aria-label="Go to next page"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    );
  }, [enablePagination, pagination, pageSize, handlePageChange, handlePageSizeChange]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <TableSkeleton rows={pageSize} columns={columns.length} showHeader={true} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {(title || description || enableGlobalSearch || enableFiltering) && (
        <CardHeader className="space-y-4">
          {(title || description) && (
            <div>
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          )}

          {(enableGlobalSearch || enableFiltering) && (
            <div className="flex items-center gap-4">
              {enableGlobalSearch && (
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {enableFiltering && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {filters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {filters.length}
                    </Badge>
                  )}
                </Button>
              )}

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          )}

          {/* Active filters */}
          {filters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span>
                    {columns.find(col => col.key === filter.column)?.header}: {filter.value}
                  </span>
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeFilter(index)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full" role="table" aria-label={title || 'Data table'}>
            {title && (
              <caption className="sr-only">
                {title}
                {description && `: ${description}`}
                {totalItems > 0 && `. ${totalItems} total items, showing page ${pagination.page} of ${pagination.totalPages}.`}
              </caption>
            )}
            <thead className="bg-gray-50 border-b">
              <tr role="row">
                {onSelectionChange && (
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded"
                      aria-label="Select all rows"
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={cn(
                      'px-4 py-3 text-left text-sm font-medium text-gray-900 whitespace-nowrap',
                      enableSorting && column.sortable !== false && 'cursor-pointer hover:bg-gray-100'
                    )}
                    onClick={() => enableSorting && column.sortable !== false && handleSort(column.key)}
                    onKeyDown={(e) => {
                      if (enableSorting && column.sortable !== false && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    }}
                    tabIndex={enableSorting && column.sortable !== false ? 0 : undefined}
                    style={{ width: column.width ? `${column.width}px` : 'auto' }}
                    aria-sort={
                      sortConfig?.key === column.key
                        ? sortConfig.direction === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : enableSorting && column.sortable !== false
                        ? 'none'
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span>{column.header}</span>
                      {enableSorting && column.sortable !== false && getSortIcon(column.key)}
                    </div>
                    
                    {enableColumnSearch && column.searchable !== false && (
                      <Input
                        placeholder={`Search ${column.header.toLowerCase()}`}
                        value={columnSearches[column.key] || ''}
                        onChange={(e) => handleColumnSearch(column.key, e.target.value)}
                        className="mt-2 h-8 text-xs"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Search ${column.header}`}
                      />
                    )}
                  </th>
                ))}
                
                {actions && actions.length > 0 && (
                  <th scope="col" className="w-12 px-4 py-3 whitespace-nowrap">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {isEmpty ? (
                <tr>
                  <td 
                    colSpan={columns.length + (onSelectionChange ? 1 : 0) + (actions ? 1 : 0)} 
                    className="px-4 py-8 text-center text-gray-500"
                    role="cell"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'hover:bg-gray-50',
                      onRowClick && 'cursor-pointer',
                      selectedRows.has(index) && 'bg-blue-50'
                    )}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : undefined}
                    role="row"
                    aria-selected={selectedRows.has(index) ? 'true' : undefined}
                  >
                    {onSelectionChange && (
                      <td className="px-4 py-3" role="cell">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(index)}
                          onChange={(e) => handleRowSelect(index, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded"
                          aria-label={`Select row ${index + 1}`}
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td key={column.key} className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap" role="cell">
                        {renderCell(column, row[column.key], row)}
                      </td>
                    ))}
                    
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3 whitespace-nowrap" role="cell">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="min-h-[44px] min-w-[44px]"
                              aria-label={`Actions for row ${index + 1}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {actions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className={action.variant === 'destructive' ? 'text-red-600' : ''}
                              >
                                {action.icon}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {renderPagination()}
      </CardContent>
    </Card>
  );
};

export default DataTable;
