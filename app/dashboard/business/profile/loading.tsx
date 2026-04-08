"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { m } from "framer-motion";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  fadeUp,
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
} from "@/lib/animations";

export default function BusinessProfileLoading() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
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

      <div className="relative z-10 container max-w-2xl py-6">
        <m.div 
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-4"
        >
          {/* Profile header card */}
        <m.div variants={fadeUp} className="rounded-[34px] border border-white/8 bg-white/5 p-6 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle glow behind the avatar */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/10 blur-[80px]" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-start gap-5">
              <Skeleton className="h-20 w-20 rounded-full shrink-0 bg-white/20" />
              <div className="flex-1 space-y-2 pt-2">
                <Skeleton className="h-7 w-48 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
            </div>
            
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <Skeleton className="h-6 w-16 bg-white/20" />
                  <Skeleton className="h-3 w-20 bg-white/20" />
                </div>
              ))}
            </div>
          </div>
        </m.div>

        {/* Tab bar */}
        <m.div variants={fadeUp} className="flex flex-wrap gap-2 justify-center py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-[100px] rounded-full bg-white/10" />
          ))}
        </m.div>

        {/* Missing Banner Placeholder */}
        <m.div variants={fadeUp}>
           <Skeleton className="h-14 w-full rounded-2xl bg-white/10" />
        </m.div>

        {/* Content cards */}
        <m.div variants={stagger} className="space-y-4 pt-2">
          <m.div variants={fadeUp}>
             <Skeleton className="h-40 w-full rounded-[34px] bg-white/5 border border-white/5" />
          </m.div>
          <m.div variants={fadeUp}>
             <Skeleton className="h-56 w-full rounded-[34px] bg-white/5 border border-white/5" />
          </m.div>
          <m.div variants={fadeUp}>
             <Skeleton className="h-64 w-full rounded-[34px] bg-white/5 border border-white/5" />
          </m.div>
        </m.div>
        </m.div>
      </div>
    </div>
  );
}
