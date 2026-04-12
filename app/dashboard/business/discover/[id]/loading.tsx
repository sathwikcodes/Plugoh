"use client";

import { Skeleton } from "@/components/ui/skeleton";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export default function InfluencerDetailLoading() {
  return (
    <div className="relative min-h-dvh overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden md:absolute">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={125}
          breathingRange={2.2}
          animationSpeed={0.008}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10 container max-w-6xl space-y-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
          <Skeleton className="h-9 w-56 rounded-full bg-white/10" />
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-card/60 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-md">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
            <Skeleton className="h-28 w-28 shrink-0 rounded-3xl bg-white/10 sm:h-32 sm:w-32" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-48 rounded-full bg-white/10" />
              <Skeleton className="h-4 w-32 rounded-full bg-white/10" />
              <div className="flex gap-3 pt-2">
                <Skeleton className="h-9 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-9 w-24 rounded-full bg-white/10" />
                <Skeleton className="h-9 w-24 rounded-full bg-white/10" />
              </div>
            </div>
            <Skeleton className="h-12 w-36 rounded-full bg-white/15" />
          </div>

          <section className="px-6 py-8 sm:px-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40 rounded bg-white/10" />
                <Skeleton className="h-4 w-64 rounded bg-white/10" />
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-white/10" />
                <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-white/10" />
                <Skeleton className="aspect-[3/4] w-full rounded-2xl bg-white/10" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Skeleton className="h-16 rounded-2xl bg-white/10" />
                <Skeleton className="h-16 rounded-2xl bg-white/10" />
                <Skeleton className="h-16 rounded-2xl bg-white/10" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
