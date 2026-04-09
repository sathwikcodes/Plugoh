"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  m,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatPackage,
  getInitials,
  timeAgo,
} from "@/lib/format";
import { ShinyButton } from "@/components/ui/shiny-button";
import FlipClock from "@/components/ui/flip-clock";

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

const STATUS_GLOW: Record<string, string> = {
  pre_authorized: "rgba(245,158,11,0.20)",
  requested: "rgba(245,158,11,0.20)",
  pending: "rgba(245,158,11,0.20)",
  payment_pending: "rgba(34,197,94,0.18)",
  in_escrow: "rgba(34,197,94,0.18)",
  accepted: "rgba(34,197,94,0.18)",
  delivery_submitted: "rgba(34,197,94,0.16)",
  completed: "rgba(34,197,94,0.18)",
  disputed: "rgba(239,68,68,0.18)",
  declined: "rgba(239,68,68,0.18)",
  rejected: "rgba(239,68,68,0.18)",
  cancelled: "rgba(239,68,68,0.18)",
  expired: "rgba(239,68,68,0.18)",
  refunded: "rgba(239,68,68,0.18)",
};

const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);

export interface InfluencerCampaignCardData {
  id: string;
  title: string | null;
  brief?: string | null;
  status: string;
  package_type?: string | null;
  price_offered: number | null;
  expires_at?: string | null;
  created_at: string;
  brandName: string;
  businessType?: string | null;
  location?: string | null;
  brandAvatarUrl: string | null;
  avatarFallbackLabel?: string | null;
  detailHref: string;
  chatHref: string;
  onAccept?: () => void;
  onDecline?: () => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

function Avatar({
  imageUrl,
  displayName,
  fallbackLabel,
}: {
  imageUrl: string | null;
  displayName: string;
  fallbackLabel?: string | null;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={displayName}
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-[10px] font-bold text-white/70">
      {getInitials(fallbackLabel || displayName)}
    </div>
  );
}

function CampaignCardFront({
  card,
  overlayOpacity = 1,
}: {
  card: InfluencerCampaignCardData;
  overlayOpacity?: MotionValue<number> | number;
}) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";
  const isOffer = OFFER_STATUSES.has(card.status);
  const actionsDisabled = card.isAccepting || card.isDeclining;
  const meta = [card.businessType, timeAgo(card.created_at)].filter(Boolean);

  return (
    <m.div style={{ opacity: overlayOpacity }} className="h-full w-full">
      <div className="absolute inset-0 bg-[#080a0d]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

      <div className="relative flex h-full flex-col px-5 pb-5 pt-6">
        <div className="flex min-h-0 flex-1 flex-col justify-start pb-1">
          <h2 className="line-clamp-4 text-[26px] font-semibold leading-[1.22] tracking-[-0.04em] text-white">
            {card.title || "Untitled Campaign"}
          </h2>

          <div className="mb-3 mt-3 flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/4 px-3 py-2">
            <Avatar
              imageUrl={card.brandAvatarUrl}
              displayName={card.brandName}
              fallbackLabel={card.avatarFallbackLabel}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {card.brandName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45">
                {meta.map((item, index) => (
                  <span key={`${item}-${index}`} className="whitespace-nowrap">
                    {item}
                  </span>
                ))}
                {card.location ? (
                  <span className="inline-flex min-w-0 items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-white/35" />
                    <span className="truncate">{card.location}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-3 rounded-[16px] border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
              Package booked
            </p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              {formatPackage(card.package_type ?? null)}
            </p>
          </div>

          {card.brief?.trim() && (
            <p className="line-clamp-2 text-[13px] leading-[1.55] text-white/42">
              {card.brief.trim()}
            </p>
          )}
        </div>

        {isOffer && card.expires_at ? (
          <div className="mb-4 shrink-0 rounded-[16px] border border-amber-500/22 bg-amber-500/8 px-4 py-3">
            <p className="mb-2 text-center text-[9px] uppercase tracking-[0.22em] text-amber-300/55">
              Offer expires soon
            </p>
            <FlipClock
              className="w-full justify-center"
              expiresAt={card.expires_at}
            />
          </div>
        ) : null}

        <div className="h-px shrink-0 bg-white/8" />

        <div className="flex shrink-0 items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="flex items-end gap-2 text-[30px] font-bold leading-none tracking-[-0.05em] text-white">
              {formatCurrency(card.price_offered)}
              <span className="pb-1 text-[12px] font-medium tracking-[0.08em] text-white/55">
                Paid
              </span>
            </p>
          </div>

          {isOffer ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onDecline}
                disabled={actionsDisabled}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/12 text-rose-200 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {card.isDeclining ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onAccept}
                disabled={actionsDisabled}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/12 text-emerald-200 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {card.isAccepting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={card.chatHref}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-5 w-5 text-black" />
              </Link>
              <Link
                href={card.detailHref}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowRight className="h-5 w-5 text-black" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}

function CampaignCardBack({ card }: { card: InfluencerCampaignCardData }) {
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
      <div className="absolute inset-x-5 bottom-5 rounded-[20px] border border-white/8 bg-white/4 px-4 py-3 backdrop-blur-[10px]">
        <p className="truncate text-[14px] font-semibold text-white/50">
          {card.title || "Untitled Campaign"}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]" />
    </>
  );
}

export function InfluencerCampaignCardTile({
  card,
  className,
}: {
  card: InfluencerCampaignCardData;
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

export function InfluencerCampaignCardStack({
  campaigns,
  className,
}: {
  campaigns: InfluencerCampaignCardData[];
  className?: string;
}) {
  const [cards, setCards] = useState<InfluencerCampaignCardData[]>(campaigns);
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
    // Reset to the front card whenever the filtered campaign list changes.
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
        className="min-h-0 flex w-full flex-1 items-start justify-center"
      >
        <div
          className="relative shrink-0"
          style={{
            width: cardViewport.width,
            height: cardViewport.height + (VISIBLE_COUNT - 1) * OFFSET_Y,
          }}
        >
          <ul
            className="relative m-0 w-full list-none overflow-visible p-0"
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

      <div className="flex w-full shrink-0 items-center justify-center gap-3 pb-1 pt-3">
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
