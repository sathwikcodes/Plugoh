import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

function CampaignCardSkeleton() {
  return (
    <div className="relative rounded-[34px] border border-white/8 bg-card overflow-hidden aspect-[0.74] w-full">
      <Skeleton className="absolute inset-0 rounded-none bg-white/4" />
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <Skeleton className="h-8 w-28 rounded-full bg-white/20" />
          <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-[18px] shrink-0 bg-white/20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4 rounded bg-white/20" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20 rounded bg-white/20" />
                <Skeleton className="h-4 w-16 rounded bg-white/20" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 rounded bg-white/20" />
              <Skeleton className="h-5 w-16 rounded bg-white/20" />
            </div>
            <div className="space-y-1 text-right items-end flex flex-col">
              <Skeleton className="h-3 w-16 rounded bg-white/20" />
              <Skeleton className="h-5 w-20 rounded bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CampaignsLoading() {
  return (
    <div className="relative h-dvh overflow-hidden">
      <div className="relative z-10 container h-full py-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:flex md:h-full md:flex-col md:py-6 md:pb-6">
        <div className="flex h-full flex-col gap-4 md:h-auto md:gap-5">
          <div className="shrink-0 flex items-center justify-center gap-3 md:justify-start">
            <div className="min-w-0 flex flex-col justify-center text-center md:text-left">
              <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                Manage{" "}
                <span className="heading-mix-accent text-4xl text-white/90">
                  Campaigns
                </span>
              </h1>
            </div>
          </div>

          <div className="shrink-0 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  readOnly
                  placeholder="Search"
                  className="h-12 rounded-full border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/35"
                />
              </div>
              <button
                type="button"
                className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full border border-primary/20 bg-primary/[0.07] text-sm font-medium text-white shadow-[0_12px_32px_rgba(15,17,21,0.35)] backdrop-blur-md transition-all duration-200 sm:w-auto sm:gap-2 sm:px-5"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Sort</span>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 md:hidden">
            <div className="h-full w-full relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full relative p-[10px]">
                  <CampaignCardSkeleton />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:grid min-h-0 flex-1 grid-cols-2 gap-5 overflow-y-auto overscroll-contain pr-1 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CampaignCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
