"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  m,
  useMotionValue,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from "framer-motion";
import { ArrowRight, BarChart3, Lock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  formatCurrency,
  formatPackage,
  getInitials,
  timeAgo,
} from "@/lib/format";
import FlipClock from "@/components/ui/flip-clock";
import { CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import type { CampaignStatus } from "@/lib/constants";

// ── Constants ─────────────────────────────────────────────────────────────
const VISIBLE_COUNT = 4;
const OFFSET_X = 8;
const OFFSET_Y = 16;
const SCALE_STEP = 0.05;
const DIM_STEP = 0.12;
const SWIPE_THRESHOLD = 60;
const CARD_ASPECT_RATIO = 0.74;
const MAX_CARD_WIDTH = 368;

const SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

// ── Status colour tokens ───────────────────────────────────────────────────
const STATUS_GLOW: Record<string, string> = {
  pre_authorized: "rgba(245,158,11,0.20)",
  requested: "rgba(245,158,11,0.20)",
  pending: "rgba(245,158,11,0.20)",
  payment_pending: "rgba(234,179,8,0.22)",
  in_escrow: "rgba(234,179,8,0.18)",
  accepted: "rgba(34,197,94,0.15)",
  delivery_submitted: "rgba(234,179,8,0.18)",
  completed: "rgba(34,197,94,0.15)",
  disputed: "rgba(239,68,68,0.18)",
  declined: "rgba(239,68,68,0.18)",
  rejected: "rgba(239,68,68,0.18)",
  cancelled: "rgba(239,68,68,0.18)",
  expired: "rgba(239,68,68,0.18)",
  refunded: "rgba(239,68,68,0.18)",
};

const STATUS_ACCENT: Record<string, string> = {
  pre_authorized: "#f59e0b",
  requested: "#f59e0b",
  pending: "#f59e0b",
  payment_pending: "#eab308",
  in_escrow: "#eab308",
  accepted: "#22c55e",
  delivery_submitted: "#eab308",
  completed: "#22c55e",
  disputed: "#ef4444",
  declined: "#ef4444",
  rejected: "#ef4444",
  cancelled: "#ef4444",
  expired: "#ef4444",
  refunded: "#ef4444",
};

// ── Data interface ────────────────────────────────────────────────────────
export interface CampaignCardData {
  id: string;
  title: string | null;
  brief?: string | null;
  status: string;
  package_type: string | null;
  price_offered: number | null;
  expires_at: string | null;
  created_at: string;
  influencerName: string;
  influencerHandle: string | null;
  influencerAvatarUrl: string | null;
  chartUrl?: string | null;
  chartLocked?: boolean | null;
  /** Detail page href. Defaults to /dashboard/business/campaigns/:id */
  href?: string;
}

// ── Front card ────────────────────────────────────────────────────────────
function CampaignCardFront({
  card,
  overlayOpacity = 1,
}: {
  card: CampaignCardData;
  overlayOpacity?: MotionValue<number> | number;
}) {
  const cfg =
    CAMPAIGN_STATUS_CONFIG[card.status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";

  const showTimer =
    ["pre_authorized", "requested", "pending"].includes(card.status) &&
    !!card.expires_at;
  const isChartLocked = card.chartLocked ?? !card.chartUrl;
  const chartHref =
    card.chartUrl ||
    `${card.href ?? `/dashboard/business/campaigns/${card.id}`}#chart`;
  const detailHref = card.href ?? `/dashboard/business/campaigns/${card.id}`;

  return (
    <m.div style={{ opacity: overlayOpacity }} className="h-full w-full">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[#080a0d]" />

      {/* Status glow from top */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />

      {/* Subtle inner border shimmer */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

      {/* Content */}
      <div className="relative flex h-full flex-col px-5 pb-5 pt-6">
        {/* ── Row 1: status badge + package ── */}
        <div className="flex shrink-0 items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.75 text-[10px] font-semibold uppercase tracking-[0.18em] leading-none",
              cfg.badge,
            )}
          >
            {cfg.label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-0.75 text-[10px] font-medium uppercase tracking-[0.16em] leading-none text-white/50">
            {formatPackage(card.package_type)}
          </span>
        </div>

        {/* ── Row 2: campaign title (hero) ── */}
        <div className="min-h-0 flex-1 flex flex-col justify-start pb-1 pt-2">
          <h2 className="line-clamp-4 text-[26px] font-semibold leading-[1.22] tracking-[-0.04em] text-white">
            {card.title || "Untitled Campaign"}
          </h2>

          {/* ── Creator card ── */}
          <div className="mb-3 mt-3 flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/4 px-3 py-2">
            {card.influencerAvatarUrl ? (
              <Image
                src={card.influencerAvatarUrl}
                alt={card.influencerName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-[10px] font-bold text-white/70">
                {getInitials(card.influencerName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {card.influencerName}
              </p>
              <p className="truncate text-[11px] text-white/45">
                {card.influencerHandle ? `@${card.influencerHandle}` : "—"}
                {" · "}
                {timeAgo(card.created_at)}
              </p>
            </div>
          </div>

          {card.brief?.trim() && (
            <p className="line-clamp-2 text-[13px] leading-[1.55] text-white/42">
              {card.brief.trim()}
            </p>
          )}
        </div>

        {/* ── Timer (pre-auth / requested only) ── */}
        {showTimer && (
          <div className="mb-4 shrink-0 rounded-[16px] border border-amber-500/22 bg-amber-500/8 px-4 py-3">
            <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-amber-300/55">
              Offer expires in
            </p>
            <FlipClock className="justify-start" expiresAt={card.expires_at} />
          </div>
        )}

        {/* ── Divider ── */}
        <div className="shrink-0 h-px bg-white/8" />

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center justify-between gap-3 pt-4">
          {/* Left: price + secondary info */}
          <div className="min-w-0">
            <p className="text-[30px] font-bold leading-none tracking-[-0.05em] text-white">
              {formatCurrency(card.price_offered)}
              <span className="ml-2 text-[14px] font-medium tracking-[0.01em] text-white/55">
                spent
              </span>
            </p>
          </div>

          {/* Right: chart + arrow */}
          <div className="flex shrink-0 items-center gap-2">
            {isChartLocked ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/16 bg-white/6 text-white/45 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              >
                <MessageCircle className="h-5 w-5 opacity-70" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white/20 bg-[#11151c]">
                  <Lock className="h-2.5 w-2.5 text-white/75" />
                </span>
              </button>
            ) : (
              <Link
                href={chartHref}
                onClick={(e) => e.stopPropagation()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <BarChart3 className="h-5 w-5 text-black" />
              </Link>
            )}
            <Link
              href={detailHref}
              onClick={(e) => e.stopPropagation()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="h-5 w-5 text-black" />
            </Link>
          </div>
        </div>
      </div>
    </m.div>
  );
}

export function CampaignCardTile({
  card,
  className,
}: {
  card: CampaignCardData;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[34px] border border-white/10",
        className,
      )}
    >
      <CampaignCardFront card={card} />
    </div>
  );
}

// ── Back card (non-front, simplified) ────────────────────────────────────
function CampaignCardBack({ card }: { card: CampaignCardData }) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";

  return (
    <>
      <div className="absolute inset-0 bg-[#080a0d]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />
      {/* Blurred title peek at bottom */}
      <div className="absolute inset-x-5 bottom-5 rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-[10px]">
        <p className="truncate text-[14px] font-semibold text-white/50">
          {card.title || "Untitled Campaign"}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
    </>
  );
}

// ── Main stack component ──────────────────────────────────────────────────
interface Props {
  campaigns: CampaignCardData[];
  className?: string;
}

export function CampaignCardStack({ campaigns, className }: Props) {
  const [cards, setCards] = useState<CampaignCardData[]>(campaigns);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [cardViewport, setCardViewport] = useState({
    width: MAX_CARD_WIDTH,
    height: MAX_CARD_WIDTH / CARD_ASPECT_RATIO,
  });
  const total = campaigns.length;

  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [-200, 0, 200], [-10, 0, 10]);
  const overlayOpacity = useTransform(
    dragX,
    [-220, -80, 0, 80, 220],
    [0.72, 0.88, 1, 0.88, 0.72],
  );

  // Reset to card 1 whenever campaigns list changes (filter/sort)
  useEffect(() => {
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
      let nextWidth = Math.min(w, MAX_CARD_WIDTH);
      let nextHeight = nextWidth / CARD_ASPECT_RATIO;
      if (nextHeight > h) {
        nextHeight = h;
        nextWidth = nextHeight * CARD_ASPECT_RATIO;
      }
      setCardViewport({
        width: Math.max(nextWidth, 0),
        height: Math.max(nextHeight, 0),
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
      {/* Stage */}
      <div
        ref={stageRef}
        className="flex min-h-0 w-full flex-1 items-center justify-center"
      >
        <div
          className="relative shrink-0"
          style={{ width: cardViewport.width, height: cardViewport.height }}
        >
          <ul className="m-0 h-full w-full list-none p-0">
            <AnimatePresence>
              {visibleCards.map((card, i) => {
                const isFront = i === 0;
                const brightness = Math.max(0.5, 1 - i * DIM_STEP);
                const offsetDirection = i % 2 === 0 ? -1 : 1;

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

      {/* Navigation */}
      <div
        className="flex w-full shrink-0 items-center justify-center gap-3"
        style={{ maxWidth: cardViewport.width || MAX_CARD_WIDTH }}
      >
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
