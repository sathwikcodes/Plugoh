"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { m } from "framer-motion";
import { Search } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  fadeUp,
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
} from "@/lib/animations";

function ConversationRowSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 shrink-0 rounded-full bg-white/10" />
      <div className="flex-1 space-y-2 py-1">
        <Skeleton className="h-4 w-2/3 rounded bg-white/10" />
        <Skeleton className="h-3 w-full rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function InboxLoading() {
  const isMobile = useIsMobile();
  const mobileViewportHeight = "100dvh";
  const mobileDockInset = "calc(104px + env(safe-area-inset-bottom, 0px))";

  return (
    <div
      className="relative h-dvh overflow-hidden bg-[#0F1115]"
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

      <div className="relative z-10 container h-full py-4 md:flex md:h-full md:flex-col md:py-6">
        <m.div
          key="inbox-shell"
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex h-full flex-col gap-4 md:gap-5"
        >
          <m.div
            variants={fadeUp}
            className="flex shrink-0 items-center justify-center"
          >
            <div className="min-w-0 text-center">
              <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                <span className="heading-mix-accent text-4xl text-white/90">
                  Messages
                </span>
              </h1>
            </div>
          </m.div>

          <m.section variants={fadeUp} className="shrink-0">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Skeleton className="h-12 w-full rounded-full border border-white/10 bg-white/5" />
            </div>
          </m.section>

          <m.section
            variants={fadeUp}
            className="min-h-0 flex-1 md:flex-none md:h-[calc(100dvh-14rem)]"
            style={
              isMobile
                ? { paddingBottom: mobileDockInset }
                : undefined
            }
          >
            <div className="flex h-full min-h-0 flex-col gap-4 md:flex-row">
              {/* Conversation List Container */}
              <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/14 bg-[linear-gradient(160deg,rgba(21,25,34,0.96)_0%,rgba(21,25,34,0.94)_46%,rgba(27,34,48,0.92)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl md:w-70 md:shrink-0 md:flex-none">
                <div className="min-h-0 flex-1 overflow-hidden space-y-2 py-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ConversationRowSkeleton key={i} />
                  ))}
                </div>
              </div>

              {/* Right pane — chat area (desktop only) */}
              <div className="hidden min-h-0 flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-[#151922]/75 shadow-[0_24px_90px_rgba(0,0,0,0.38)] backdrop-blur-2xl md:flex md:flex-col md:min-w-0">
                {/* Chat empty state footprint */}
                <div className="flex h-full flex-col items-center justify-center p-8 text-center opacity-30">
                  <Skeleton className="mb-4 h-12 w-12 rounded-2xl bg-white/30" />
                  <Skeleton className="h-5 w-48 rounded-full mb-3 bg-white/20" />
                  <Skeleton className="h-4 w-64 rounded-full bg-white/20" />
                </div>
              </div>
            </div>
          </m.section>
        </m.div>
      </div>
    </div>
  );
}
