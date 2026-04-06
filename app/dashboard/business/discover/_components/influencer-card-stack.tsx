"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  m,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  InfluencerCardArtwork,
  InfluencerCardInfoPanel,
  type InfluencerProfile,
} from "./influencer-card";

// How many cards are visible in the stack
const VISIBLE_COUNT = 4;
const OFFSET_X = 8;
const OFFSET_Y = 16;
const SCALE_STEP = 0.05;
const DIM_STEP = 0.12;
const SWIPE_THRESHOLD = 60;

const SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

interface Props {
  profiles: InfluencerProfile[];
  className?: string;
}

const CARD_ASPECT_RATIO = 0.74;
const MAX_CARD_WIDTH = 368;

export function InfluencerCardStack({ profiles, className }: Props) {
  const [cards, setCards] = useState<InfluencerProfile[]>(profiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardViewport, setCardViewport] = useState({
    width: MAX_CARD_WIDTH,
    height: MAX_CARD_WIDTH / CARD_ASPECT_RATIO,
  });
  const total = profiles.length;

  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [-200, 0, 200], [-10, 0, 10]);
  const overlayOpacity = useTransform(
    dragX,
    [-220, -80, 0, 80, 220],
    [0.72, 0.88, 1, 0.88, 0.72],
  );

  const moveToEnd = () => {
    setCards((prev) => [...prev.slice(1), prev[0]]);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const moveToStart = () => {
    setCards((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const updateViewport = () => {
      const { width: availableWidth, height: availableHeight } =
        node.getBoundingClientRect();

      if (availableWidth <= 0 || availableHeight <= 0) return;

      let nextWidth = Math.min(availableWidth, MAX_CARD_WIDTH);
      let nextHeight = nextWidth / CARD_ASPECT_RATIO;

      if (nextHeight > availableHeight) {
        nextHeight = availableHeight;
        nextWidth = nextHeight * CARD_ASPECT_RATIO;
      }

      setCardViewport({
        width: Math.max(nextWidth, 0),
        height: Math.max(nextHeight, 0),
      });
    };

    updateViewport();

    const resizeObserver = new ResizeObserver(() => {
      updateViewport();
    });

    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const { x: offsetX } = info.offset;
    const { x: velX } = info.velocity;

    if (Math.abs(offsetX) > SWIPE_THRESHOLD || Math.abs(velX) > 500) {
      if (offsetX < 0 || velX < -300) {
        setDragDir("left");
        setTimeout(() => {
          moveToEnd();
          setDragDir(null);
        }, 120);
      } else {
        setDragDir("right");
        setTimeout(() => {
          moveToStart();
          setDragDir(null);
        }, 120);
      }
    }
    dragX.set(0);
  };

  if (total === 0) return null;

  const visibleCards = cards.slice(0, VISIBLE_COUNT);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col items-center gap-2 pb-1 pt-1 sm:gap-3 sm:pb-2",
        className,
      )}
    >
      <div
        ref={stageRef}
        className="flex min-h-0 w-full flex-1 items-center justify-center"
      >
        <div
          className="relative shrink-0"
          style={{
            width: cardViewport.width,
            height: cardViewport.height,
          }}
        >
          <ul className="m-0 h-full w-full list-none p-0">
          <AnimatePresence>
            {visibleCards.map((profile, i) => {
              const isFront = i === 0;
              const brightness = Math.max(0.5, 1 - i * DIM_STEP);
              const offsetDirection = i % 2 === 0 ? -1 : 1;

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
                    x: isFront ? 0 : offsetDirection * i * OFFSET_X,
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
                      <m.div style={{ opacity: overlayOpacity }} className="absolute inset-0">
                        <InfluencerCardInfoPanel profile={profile} />
                      </m.div>
                      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
                    </div>
                  ) : (
                    <>
                      <InfluencerCardArtwork profile={profile} className="opacity-[0.92]" />
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

      <div
        className="flex w-full shrink-0 items-center justify-center gap-3 pb-0"
        style={{ maxWidth: cardViewport.width || MAX_CARD_WIDTH }}
      >
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
