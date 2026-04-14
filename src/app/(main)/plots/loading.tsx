import { Skeleton } from '@/components/ui/skeleton';

export default function PlotsLoading() {
  return (
    <div className="flex-1 p-3 md:p-6 overflow-auto">
      {/* Header skeleton */}
      <div className="h-14 md:h-16 border-b border-gin bg-white flex items-center px-3 md:px-5 mb-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="ml-3 h-6 w-40" />
      </div>
      {/* Search / filter skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="h-10 w-24" />
      </div>
      {/* Table skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
