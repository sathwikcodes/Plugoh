"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export function InfluencerCardSkeleton() {
  return (
    <div className="relative aspect-[0.68] rounded-[34px] overflow-hidden bg-card border border-white/8">
      <Skeleton className="absolute inset-0 rounded-none" />
      <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2 bg-linear-to-t from-black/80 via-black/40 to-transparent">
        <div className="flex items-end gap-2">
          <Skeleton className="h-10 w-10 rounded-full shrink-0 bg-white/20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-3 w-24 bg-white/20" />
          </div>
          <Skeleton className="h-7 w-16 mb-1 rounded-[10px] bg-white/20" />
        </div>
      </div>
    </div>
  );
}

export default function DiscoverLoading() {
  return (
    <div className="relative overflow-hidden min-h-dvh bg-background">
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

      <div className="relative z-10 container h-full py-4 md:h-auto md:py-6">
        <div className="flex h-full flex-col gap-3 md:h-auto md:gap-6">
          <div className="shrink-0 flex items-center justify-center gap-3 md:justify-start">
            <div className="min-w-0 flex flex-col justify-center text-center md:text-left">
              <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                Discover{" "}
                <span className="heading-mix-accent text-4xl text-white/90">
                  Influencers
                </span>
              </h1>
            </div>
          </div>

          <div className="shrink-0 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground/50">
                  <Search className="h-4 w-4 left-4 absolute text-white/35" />
                </div>
                <Skeleton className="h-12 w-full rounded-full bg-white/5 border border-white/10" />
              </div>
              <Skeleton className="relative flex h-12 w-12 shrink-0 rounded-full border border-primary/20 bg-primary/[0.07] sm:w-25" />
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6">
            {[0, 1, 2].map((_, i) => (
              <InfluencerCardSkeleton key={i} />
            ))}
          </div>

          <div className="flex min-h-0 flex-1 md:hidden pb-25 items-center justify-center">
            <div className="w-full max-w-[min(85vw,21rem)]">
              <InfluencerCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
