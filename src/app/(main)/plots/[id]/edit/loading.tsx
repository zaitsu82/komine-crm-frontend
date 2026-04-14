import { Skeleton } from '@/components/ui/skeleton';

export default function EditPlotLoading() {
  return (
    <>
      {/* PageHeader skeleton */}
      <div className="h-14 md:h-16 border-b border-gin bg-white flex items-center px-3 md:px-5 flex-shrink-0">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="ml-3 h-6 w-32" />
      </div>
      <div className="flex-1 p-3 md:p-6 overflow-auto">
        <div className="mb-4 flex justify-end">
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
