import { Skeleton } from "@/components/ui/skeleton";

function CampaignCardSkeleton() {
  return (
    <div className="rounded-[20px] border border-white/8 bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export default function CampaignsLoading() {
  return (
    <div className="relative min-h-dvh bg-[#0F1115]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0D2137]/50 via-[#0F1115] to-[#0F1115]" />

      <div className="relative z-10 flex h-dvh flex-col">
        {/* Search + sort row */}
        <div className="shrink-0 px-4 pt-4 pb-3 flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Mobile: tall card stack */}
        <div className="flex-1 px-4 md:hidden">
          <Skeleton className="w-full h-[420px] rounded-[24px]" />
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-2 gap-3 px-6 pb-6 flex-1 content-start">
          {Array.from({ length: 6 }).map((_, i) => (
            <CampaignCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
