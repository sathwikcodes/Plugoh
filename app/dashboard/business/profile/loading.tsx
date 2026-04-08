import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessProfileLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-[#0F1115]">
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-[#1A2A2A]/40 via-[#0F1115] to-[#0F1115]" />

      <div className="relative z-10 container max-w-2xl py-6 space-y-4">
        {/* Profile header card */}
        <div className="rounded-[20px] border border-white/8 bg-card p-5 space-y-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5 text-center">
                <Skeleton className="h-5 w-12 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 justify-center py-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Content cards */}
        <div className="space-y-3">
          <Skeleton className="h-32 w-full rounded-[20px]" />
          <Skeleton className="h-48 w-full rounded-[20px]" />
        </div>
      </div>
    </div>
  );
}
