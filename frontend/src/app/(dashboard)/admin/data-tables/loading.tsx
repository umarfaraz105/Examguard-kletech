import { TableSkeleton } from '@/components/loading/LoadingSkeletons';

export default function DataTablesLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <TableSkeleton rows={10} columns={6} showHeader={true} />
    </div>
  );
}
