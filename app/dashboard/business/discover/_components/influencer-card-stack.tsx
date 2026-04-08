"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import Image from "next/image";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  InfluencerCardArtwork,
  InfluencerCardInfoPanel,
  type InfluencerProfile,
} from "./influencer-card";
import { useCardStackDrag } from "./use-card-stack-drag";

const VISIBLE_COUNT = 3;
const OFFSET_Y = 16;
const SCALE_STEP = 0.04;
const DIM_STEP = 0.18;
const CARD_ASPECT_RATIO = 0.74;

const SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

interface Props {
  profiles: InfluencerProfile[];
  className?: string;
}

export function InfluencerCardStack({ profiles, className }: Props) {
  const total = profiles.length;
  const {
    currentIndex,
    setCurrentIndex,
    dragDir,
    dragX,
    rotateY,
    overlayOpacity,
    moveToEnd,
    moveToStart,
    handleDragEnd,
  } = useCardStackDrag({ total });

  const stageRef = useRef<HTMLDivElement>(null);
  const [cardViewport, setCardViewport] = useState({
    width: 320,
    height: 432,
  });

  useEffect(() => {
    setCurrentIndex(0);
  }, [profiles, setCurrentIndex]);

  const visibleCards = useMemo(() => {
    if (total === 0) return [];
    const result: InfluencerProfile[] = [];
    for (let i = 0; i < Math.min(VISIBLE_COUNT, total); i++) {
      result.push(profiles[(currentIndex + i) % total]);
    }
    return result;
  }, [profiles, currentIndex, total]);

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

  if (total === 0) return null;

  return (
    <div className={cn("flex flex-col", className)}>
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
          <ul
            className="relative m-0 w-full list-none p-0 overflow-visible"
            style={{ height: cardViewport.height }}
          >
            <AnimatePresence>
              {visibleCards.map((profile, i) => {
                const isFront = i === 0;
                const brightness = Math.max(0.5, 1 - i * DIM_STEP);

                return (
                  <m.li
                    key={profile.id}
                    className={cn(
                      "absolute inset-0 list-none overflow-hidden rounded-[34px]",
                      "border border-white/12 bg-[#080a0d]",
                    )}
                    style={{
                      cursor: isFront ? "grab" : "auto",
                      touchAction: "none",
                      rotateY: isFront ? rotateY : 0,
                      transformPerspective: 900,
                      transformOrigin: "center center",
                      boxShadow: isFront
                        ? "0 30px 80px rgba(0,0,0,0.54)"
                        : "0 18px 42px rgba(0,0,0,0.32)",
                    }}
                    animate={{
                      x: 0,
                      y: i * OFFSET_Y,
                      scale: 1 - i * SCALE_STEP,
                      filter: `brightness(${brightness}) saturate(${1 - i * 0.08})`,
                      zIndex: VISIBLE_COUNT - i,
                      opacity: dragDir && isFront ? 0 : 1 - i * 0.08,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.88,
                      y: 30,
                      transition: { duration: 0.2 },
                    }}
                    transition={SPRING}
                    drag={isFront ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.45}
                    onDrag={(_, info) => {
                      if (isFront) dragX.set(info.offset.x);
                    }}
                    onDragEnd={handleDragEnd}
                    whileDrag={
                      isFront
                        ? {
                            cursor: "grabbing",
                            scale: 1.02,
                            zIndex: VISIBLE_COUNT + 1,
                          }
                        : {}
                    }
                  >
                    {isFront ? (
                      <div className="group block h-full w-full">
                        <InfluencerCardArtwork profile={profile} />
                        <m.div
                          style={{ opacity: overlayOpacity }}
                          className="absolute inset-0"
                        >
                          <InfluencerCardInfoPanel profile={profile} />
                        </m.div>
                        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
                      </div>
                    ) : (
                      <>
                        <InfluencerCardArtwork
                          profile={profile}
                          className="opacity-[0.92]"
                        />
                        <div className="absolute inset-x-6 bottom-6 h-20 rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,20,24,0.22)_0%,rgba(9,10,14,0.74)_100%)] opacity-70 backdrop-blur-[16px]" />
                        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
                      </>
                    )}
                  </m.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      <div className="flex w-full shrink-0 items-center justify-center gap-3 pt-3 pb-1">
        <ShinyButton
          onClick={moveToStart}
          className="flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/[0.05] px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/back.png"
            alt="Previous creator"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
        </ShinyButton>

        <div className="min-w-[76px] text-center">
          <span className="text-sm font-medium tabular-nums text-white/78">
            {currentIndex + 1}
          </span>
          <span className="px-1 text-white/22">/</span>
          <span className="text-sm tabular-nums text-white/48">{total}</span>
        </div>

        <ShinyButton
          onClick={moveToEnd}
          className="flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/[0.05] px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/next.png"
            alt="Next creator"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
        </ShinyButton>
      </div>
    </div>
  );
}
