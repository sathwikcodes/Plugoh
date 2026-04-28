"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";

const VISIBLE_COUNT = 3;
const OFFSET_Y = 16;
const CARD_ASPECT_RATIO = 0.74;

export function InfluencerCardSkeleton({
  fill = false,
}: {
  fill?: boolean;
} = {}) {
  return (
    <div
      className={
        fill
          ? "relative h-full w-full rounded-[34px] overflow-hidden bg-card border border-white/8"
          : "relative w-full aspect-[0.68] rounded-[34px] overflow-hidden bg-card border border-white/8"
      }
    >
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

export function MobileDiscoverStackSkeleton() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardViewport, setCardViewport] = useState({ width: 320, height: 432 });

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const updateViewport = () => {
      const { width: w, height: h } = node.getBoundingClientRect();
      if (w <= 0 || h <= 0) return;
      const peekOverhead = (VISIBLE_COUNT - 1) * OFFSET_Y;
      let cardW = w;
      let cardH = cardW / CARD_ASPECT_RATIO;
      if (cardH + peekOverhead > h) {
        cardH = h - peekOverhead;
        cardW = cardH * CARD_ASPECT_RATIO;
      }
      setCardViewport({
        width: Math.max(cardW, 0),
        height: Math.max(cardH, 0),
      });
    };

    updateViewport();
    const ro = new ResizeObserver(updateViewport);
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full flex-col">
      <div
        ref={stageRef}
        className="min-h-0 flex-1 w-full flex justify-center items-start"
      >
        <div
          className="relative shrink-0"
          style={{
            width: cardViewport.width,
            height: cardViewport.height + (VISIBLE_COUNT - 1) * OFFSET_Y,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 overflow-hidden rounded-[34px] border border-white/10 bg-card"
            style={{ height: cardViewport.height }}
          >
            <InfluencerCardSkeleton fill />
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-center gap-3 pt-3 pb-1">
        <ShinyButton
          aria-disabled="true"
          className="pointer-events-none flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/back.png"
            alt="Previous influencer"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain opacity-80"
          />
        </ShinyButton>

        <div className="min-w-19 flex items-center justify-center">
          <Skeleton className="h-5 w-14 rounded bg-white/20" />
        </div>

        <ShinyButton
          aria-disabled="true"
          className="pointer-events-none flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/next.png"
            alt="Next influencer"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain opacity-80"
          />
        </ShinyButton>
      </div>
    </div>
  );
}

export default function DiscoverLoading() {
  return (
    <div className="relative overflow-hidden min-h-dvh">
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

          <div className="flex min-h-0 flex-1 md:hidden">
            <MobileDiscoverStackSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
