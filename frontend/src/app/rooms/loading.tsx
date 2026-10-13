import { TableSkeleton } from '@/components/loading/LoadingSkeletons';

export default function RoomsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
      <TableSkeleton rows={8} columns={5} showHeader={true} />
    </div>
  );
}
