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
import { CampaignCardFront } from "./campaign-card-front";
import { CampaignCardBack } from "./campaign-card-back";
import type { CampaignCardData } from "./campaign-card-front";

export type { CampaignCardData } from "./campaign-card-front";
export { CampaignCardTile } from "./campaign-card-tile";

const VISIBLE_COUNT = 3;
const OFFSET_Y = 16;
const SCALE_STEP = 0.04;
const DIM_STEP = 0.18;
const SWIPE_THRESHOLD = 60;
const CARD_ASPECT_RATIO = 0.74;

const SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

interface Props {
  campaigns: CampaignCardData[];
  className?: string;
}

export function CampaignCardStack({ campaigns, className }: Props) {
  const [cards, setCards] = useState<CampaignCardData[]>(campaigns);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardViewport, setCardViewport] = useState({ width: 320, height: 432 });
  const total = campaigns.length;

  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [-200, 0, 200], [-10, 0, 10]);
  const overlayOpacity = useTransform(
    dragX,
    [-220, -80, 0, 80, 220],
    [0.72, 0.88, 1, 0.88, 0.72],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCards(campaigns);
    setCurrentIndex(0);
  }, [campaigns]);

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
      return;
    }

    dragX.set(0);
  };

  if (total === 0) return null;

  const visibleCards = cards.slice(0, VISIBLE_COUNT);

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
              {visibleCards.map((card, i) => {
                const isFront = i === 0;
                const brightness = Math.max(0.5, 1 - i * DIM_STEP);

                return (
                  <m.li
                    key={card.id}
                    className="absolute inset-0 list-none overflow-hidden rounded-[34px] border border-white/10"
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
                      <CampaignCardFront
                        card={card}
                        overlayOpacity={overlayOpacity}
                      />
                    ) : (
                      <CampaignCardBack card={card} />
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
          className="flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/back.png"
            alt="Previous"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
        </ShinyButton>

        <div className="min-w-19 text-center">
          <span className="text-sm font-medium tabular-nums text-white/78">
            {currentIndex + 1}
          </span>
          <span className="px-1 text-white/22">/</span>
          <span className="text-sm tabular-nums text-white/48">{total}</span>
        </div>

        <ShinyButton
          onClick={moveToEnd}
          className="flex h-13 w-13 items-center justify-center rounded-[22px] border-white/14 bg-white/5 px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <Image
            src="/next.png"
            alt="Next"
            width={22}
            height={22}
            className="h-5.5 w-5.5 shrink-0 object-contain"
          />
        </ShinyButton>
      </div>
    </div>
  );
}
