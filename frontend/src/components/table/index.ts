/**
 * Table components barrel export
 */

export { default as DataTable } from './DataTable';
export type { DataTableProps } from './DataTable';

export { default as AdvancedFilter } from './AdvancedFilter';
export type { AdvancedFilterProps } from './AdvancedFilter';

// Re-export table utilities and hooks
export { useTableData } from '@/lib/hooks/useTableData';
export type { 
  TableColumn, 
  FilterValue, 
  SortConfig, 
  PaginationConfig,
  UseTableDataOptions 
} from '@/lib/hooks/useTableData';