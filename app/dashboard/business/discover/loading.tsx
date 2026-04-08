import { Skeleton } from "@/components/ui/skeleton";

function InfluencerCardSkeleton() {
  return (
    <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden bg-card border border-white/8">
      {/* Card image area */}
      <Skeleton className="absolute inset-0 rounded-none" />
      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-end gap-2">
          <Skeleton className="h-8 w-8 rounded-full shrink-0 bg-white/20" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28 bg-white/20" />
            <Skeleton className="h-3 w-20 bg-white/20" />
          </div>
          <Skeleton className="h-7 w-16 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}

export default function DiscoverLoading() {
  return (
    <div className="relative min-h-dvh bg-[#0F1115]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#1A2A3D]/40 via-[#0F1115] to-[#0F1115]" />

      <div className="relative z-10 container py-4 space-y-4">
        {/* Search + filter row */}
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>

        {/* Influencer grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <InfluencerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
