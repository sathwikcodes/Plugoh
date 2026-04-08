import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessDashboardLoading() {
  return (
    <div className="relative h-dvh overflow-hidden bg-[#0F1115]">
      {/* Gradient placeholder */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#3D1830]/40 via-[#0F1115] to-[#1A0E05]/30" />

      <div className="relative z-10 container flex h-full flex-col py-4 md:py-6">
        {/* Heading */}
        <div className="shrink-0 flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-9 w-56 sm:h-11 sm:w-72" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>

        {/* Content card */}
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <Skeleton className="w-full max-w-3xl h-44 rounded-[28px]" />
        </div>
      </div>
    </div>
  );
}
