"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

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
  const isMobile = useIsMobile();
  const mobileViewportHeight = "100dvh";
  const mobileBottomInset = "calc(96px + env(safe-area-inset-bottom, 0px))";

  return (
    <>
      <div
        className="relative h-dvh overflow-hidden"
        style={
          isMobile
            ? {
                height: mobileViewportHeight,
                minHeight: mobileViewportHeight,
              }
            : undefined
        }
      >
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

        <div
          className="relative z-10 container h-full py-4 md:flex md:h-full md:flex-col md:py-6"
          style={isMobile ? { paddingBottom: mobileBottomInset } : undefined}
        >
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
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 z-10" />
                  <Skeleton className="h-12 w-full rounded-full border border-white/10 bg-white/5 pl-11 flex items-center" />
                </div>
                <Skeleton className="relative flex h-12 w-12 shrink-0 rounded-full border border-white/25 bg-white/12 sm:w-25" />
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
    </>
  );
}
