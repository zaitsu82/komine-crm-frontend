import { Skeleton } from '@/components/ui/skeleton';

export default function PlotDetailLoading() {
  return (
    <div className="flex-1 p-3 md:p-6 overflow-auto">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-1.5 mb-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      {/* Header card skeleton */}
      <div className="bg-white border border-gin rounded-elegant-lg shadow-elegant-sm p-4 md:p-5 mb-4 md:mb-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </div>
      {/* Status badges skeleton */}
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>
      {/* Tabs skeleton */}
      <Skeleton className="h-10 w-full mb-6" />
      {/* Content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}
