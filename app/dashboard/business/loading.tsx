"use client";

import { Skeleton } from "@/components/ui/skeleton";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

export default function BusinessDashboardLoading() {
  return (
    <div className="relative h-[calc(100dvh-4rem)] md:h-dvh overflow-hidden bg-background">
      <AnimatedGradientBackground
        Breathing
        gradientColors={GRADIENT_COLORS}
        gradientStops={GRADIENT_STOPS}
        startingGap={125}
        breathingRange={2.2}
        animationSpeed={0.008}
        containerStyle={GRADIENT_STYLE}
      />

      <div className="relative z-10 container flex h-full flex-col py-4 md:py-6">
        <div className="shrink-0 flex flex-col items-center gap-3 text-center pt-8 md:pt-12">
          <Skeleton className="h-10 w-64 sm:h-12 sm:w-80 bg-white/20" />
          <Skeleton className="h-6 w-32 rounded-full bg-white/20" />
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="w-full max-w-4xl space-y-6">
            <Skeleton className="w-full h-56 md:h-64 rounded-[34px] bg-white/5 border border-white/10 backdrop-blur-md" />

            <div className="hidden md:flex justify-center gap-4 pt-4">
              <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-12 w-40 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
