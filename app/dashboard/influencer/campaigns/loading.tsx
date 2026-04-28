"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ShinyButton } from "@/components/ui/shiny-button";

const VISIBLE_COUNT = 3;
const OFFSET_Y = 16;
const CARD_ASPECT_RATIO = 0.74;

function CampaignCardSkeleton() {
  return (
    <div className="relative w-full overflow-hidden rounded-[34px] border border-white/8 bg-card aspect-[0.74]">
      <Skeleton className="absolute inset-0 rounded-none bg-white/4" />
      <div className="absolute inset-0 flex flex-col justify-between bg-linear-to-t from-black/80 via-black/40 to-black/20 p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-8 w-28 rounded-full bg-white/20" />
          <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-[18px] bg-white/20" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-3/4 rounded bg-white/20" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20 rounded bg-white/20" />
                <Skeleton className="h-4 w-16 rounded bg-white/20" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-24 rounded bg-white/20" />
              <Skeleton className="h-5 w-16 rounded bg-white/20" />
            </div>
            <div className="flex flex-col items-end space-y-1 text-right">
              <Skeleton className="h-3 w-16 rounded bg-white/20" />
              <Skeleton className="h-5 w-20 rounded bg-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileCampaignStackSkeleton() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardViewport, setCardViewport] = useState({ width: 320, height: 432 });

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const updateViewport = () => {
      const { width: w, height: h } = node.getBoundingClientRect();
      if (w <= 0 || h <= 0) return;
      const peekOverhead = (VISIBLE_COUNT - 1) * OFFSET_Y;
      const availableHeight = Math.max(h - 2, 0);
      let cardW = w;
      let cardH = cardW / CARD_ASPECT_RATIO;
      if (cardH + peekOverhead > availableHeight) {
        cardH = availableHeight - peekOverhead;
        cardW = cardH * CARD_ASPECT_RATIO;
      }
      setCardViewport({
        width: Math.max(Math.min(cardW, w), 0),
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
        className="flex min-h-0 flex-1 w-full justify-center items-start"
      >
        <div
          className="relative shrink-0"
          style={{
            width: cardViewport.width,
            height: cardViewport.height + (VISIBLE_COUNT - 1) * OFFSET_Y,
            maxWidth: "100%",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 overflow-hidden rounded-[34px] border border-white/10 bg-card"
            style={{ height: cardViewport.height }}
          >
            <CampaignCardSkeleton />
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-center gap-3 px-1 pb-1 pt-3">
        <ShinyButton
          aria-disabled="true"
          className="pointer-events-none flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/back.png"
            alt="Previous"
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
            alt="Next"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain opacity-80"
          />
        </ShinyButton>
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
                My{" "}
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
            <MobileCampaignStackSkeleton />
          </div>

          <div className="hidden min-h-0 flex-1 grid-cols-2 gap-5 overflow-y-auto overscroll-contain pr-1 md:grid xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <CampaignCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
