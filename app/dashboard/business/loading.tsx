import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationTag } from "@/components/ui/location-tag";

export default function BusinessDashboardLoading() {
  return (
    <div className="relative h-[calc(100dvh-4rem)] md:h-dvh overflow-hidden">
      <div className="relative z-10 container flex h-full flex-col py-4 md:py-6">
        <div className="shrink-0 text-center">
          <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">
            Hey, <span className="heading-mix-accent">there</span>
          </h1>
          <div className="mt-4 flex items-center justify-center">
            <LocationTag />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
          <Skeleton className="h-56 w-full max-w-3xl rounded-[28px] border border-white/12 bg-white/5 shadow-[0_20px_56px_rgba(0,0,0,0.35)] backdrop-blur-xl md:h-64" />

          <div className="flex w-full justify-center">
            <Link
              href="/dashboard/business/discover"
              className="flex w-[80vw] max-w-xs items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-[0_4px_24px_rgba(229,185,74,0.28)] transition-all hover:brightness-105 active:scale-95"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
