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
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import { formatPackage, getInitials } from "@/lib/format";
import FlipClock from "@/components/ui/flip-clock";
import { ThreeDPill, type PillPreset } from "@/components/ui/3d-pill";
import { ThreeDButton } from "@/components/ui/3d-button";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";

// ── Constants ─────────────────────────────────────────────────────────────
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

// ── Status colour tokens ───────────────────────────────────────────────────
const STATUS_GLOW: Record<string, string> = {
  pre_authorized: "rgba(245,158,11,0.22)",
  requested: "rgba(245,158,11,0.22)",
  pending: "rgba(245,158,11,0.22)",
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

const STATUS_PILL_COLOR: Record<string, PillPreset> = {
  pre_authorized: "amber",
  requested: "amber",
  pending: "amber",
  payment_pending: "amber",
  in_escrow: "amber",
  delivery_submitted: "amber",
  accepted: "emerald",
  completed: "emerald",
  disputed: "rose",
  declined: "rose",
  rejected: "rose",
  cancelled: "rose",
  expired: "rose",
  refunded: "rose",
};

const PAYMENT_PROGRESS: Record<string, { label: string; color: PillPreset }> = {
  pre_authorized:     { label: "Awaiting",  color: "slate"   },
  requested:          { label: "Awaiting",  color: "slate"   },
  pending:            { label: "Awaiting",  color: "slate"   },
  payment_pending:    { label: "Pay Now",   color: "amber"   },
  in_escrow:          { label: "On Hold",   color: "amber"   },
  accepted:           { label: "On Hold",   color: "amber"   },
  delivery_submitted: { label: "On Hold",   color: "amber"   },
  completed:          { label: "Paid",      color: "emerald" },
  disputed:           { label: "Disputed",  color: "rose"    },
  declined:           { label: "Cancelled", color: "rose"    },
  rejected:           { label: "Cancelled", color: "rose"    },
  cancelled:          { label: "Cancelled", color: "rose"    },
  expired:            { label: "Expired",   color: "rose"    },
  refunded:           { label: "Refunded",  color: "rose"    },
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
  influencerCategory?: string | null;
  chartUrl?: string | null;
  chartLocked?: boolean | null;
  /** Detail page href. Defaults to /dashboard/business/campaigns/:id */
  href?: string;
}

// ── Sub-components ────────────────────────────────────────────────────────
const PINK_COLOR = {
  base: "#f4a7c3",
  light: "#fce4ec",
  mid: "#e991b6",
  dark: "#b5617f",
  ink: "#2d1220",
  glow: "rgba(244,167,195,0.28)",
};

function InfluencerPill({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const icon = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={name}
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/30 text-[7px] font-bold">
      {getInitials(name)}
    </span>
  );

  return (
    <ThreeDPill
      label={name}
      color={PINK_COLOR}
      icon={icon}
      className="[&_.pill-text]:max-w-[110px] [&_.pill-text]:truncate"
    />
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = CAMPAIGN_STATUS_CONFIG[status as CampaignStatus];
  if (!cfg) return null;
  return (
    <ThreeDPill
      label={cfg.shortLabel}
      color={STATUS_PILL_COLOR[status] ?? "slate"}
    />
  );
}

// ── Front card ────────────────────────────────────────────────────────────
function CampaignCardFront({
  card,
  overlayOpacity = 1,
}: {
  card: CampaignCardData;
  overlayOpacity?: MotionValue<number> | number;
}) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";
  const showTimer =
    ["pre_authorized", "requested", "pending"].includes(card.status) &&
    !!card.expires_at;
  const detailHref = card.href ?? `/dashboard/business/campaigns/${card.id}`;

  const pkgName = card.package_type ? formatPackage(card.package_type) : "content";
  let deliveryLabel = `Deliver ${pkgName} ASAP`;
  if (card.brief) {
    const timelineMatch = card.brief.match(/Timeline:\s*(.*)/);
    if (timelineMatch) {
      const t = timelineMatch[1].trim();
      if (t !== "Instant") {
        const dateMatch = t.match(/\((.*)\)/);
        if (dateMatch) {
          const rawDate = dateMatch[1];
          const [year, month, day] = rawDate.split("-").map(Number);
          if (year && month && day) {
            const localDate = new Date(year, month - 1, day);
            const formattedDate = localDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            deliveryLabel = `${pkgName} by ${formattedDate}`;
          } else {
            deliveryLabel = `${pkgName} by ${rawDate}`;
          }
        } else {
          deliveryLabel = `${pkgName} (${t})`;
        }
      }
    }
  }

  return (
    <m.div
      style={{ opacity: overlayOpacity }}
      className="absolute inset-0 flex flex-col overflow-hidden @container"
    >
      {/* ── Image section ────────────────────────────────────────────── */}
      <div className="relative w-full flex-none" style={{ paddingBottom: showTimer ? "28%" : "50%" }}>
        <div className="absolute inset-0 overflow-hidden">
          {card.influencerAvatarUrl ? (
            <Image
              src={card.influencerAvatarUrl}
              alt={card.influencerName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse 120% 120% at 50% -10%, ${glow} 0%, #111116 60%, #080609 100%)`,
              }}
            >
              <span
                className="select-none"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(48px, 14cqw, 90px)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "rgba(255,255,255,0.13)",
                  textShadow: "0 2px 24px rgba(0,0,0,0.35)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              >
                {getInitials(card.influencerName)}
              </span>
            </div>
          )}
          {/* Bottom gradient fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#080609] via-[#080609]/70 to-transparent" />
          {/* Backdrop blur strip */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 backdrop-blur-md"
            style={{ maskImage: "linear-gradient(to top, black 40%, transparent 100%)" }}
          />
        </div>

        {/* Pills overlaid on image */}
        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <InfluencerPill
            name={card.influencerName}
            avatarUrl={card.influencerAvatarUrl}
          />
          <StatusPill status={card.status} />
        </div>
      </div>

      {/* ── Content section ──────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#080609] px-3 pb-3 pt-2.5 @[340px]:px-4 @[340px]:pb-4 @[340px]:pt-3">
        {/* Title */}
        <h2
          className="line-clamp-2 shrink-0 font-semibold leading-[1.15] tracking-[-0.04em] text-white"
          style={{ fontSize: "clamp(15px, 5cqw, 22px)" }}
        >
          {card.title || "Untitled Campaign"}
        </h2>

        {/* Payout box */}
        <div className="mt-2.5 shrink-0 flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3 @[340px]:mt-3 @[340px]:px-4 @[340px]:py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Image
              src="/coin.png"
              alt=""
              width={32}
              height={32}
              className="shrink-0 object-contain"
              style={{
                width: "clamp(18px, 5.5cqw, 32px)",
                height: "clamp(18px, 5.5cqw, 32px)",
              }}
            />
            <span
              className="font-bold leading-none tracking-[-0.05em] text-amber-400"
              style={{ fontSize: "clamp(17px, 5.5cqw, 28px)" }}
            >
              {card.price_offered
                ? card.price_offered.toLocaleString("en-IN")
                : "—"}
            </span>
          </div>
          {PAYMENT_PROGRESS[card.status] ? (
            <ThreeDPill
              label={PAYMENT_PROGRESS[card.status].label}
              color={PAYMENT_PROGRESS[card.status].color}
              className="shrink-0"
            />
          ) : null}
        </div>

        {/* Info pills — category + package type */}
        {(card.influencerCategory || card.package_type) ? (
          <div className="mt-2.5 shrink-0 flex gap-2 @[340px]:mt-3">
            {card.influencerCategory ? (
              <ThreeDPill
                label={card.influencerCategory}
                color={{
                  base: "#6b6457",
                  light: "#9c9183",
                  mid: "#504840",
                  dark: "#28241e",
                  ink: "#f0ece4",
                  glow: "rgba(107,100,87,0.18)",
                }}
                className="flex-1 min-w-0 justify-center [&_.pill-text]:truncate [&_.pill-label]:max-w-full"
              />
            ) : null}
            {card.package_type ? (
              <ThreeDPill
                label={formatPackage(card.package_type)}
                color={{
                  base: "#566070",
                  light: "#8090a0",
                  mid: "#404c5c",
                  dark: "#202830",
                  ink: "#e4eaf0",
                  glow: "rgba(86,96,112,0.18)",
                }}
                className="flex-1 min-w-0 justify-center [&_.pill-text]:truncate [&_.pill-label]:max-w-full"
              />
            ) : null}
          </div>
        ) : null}

        {/* Delivery pill */}
        <div className="mt-2.5 shrink-0 flex @[340px]:mt-3">
          <ThreeDPill
            label={deliveryLabel}
            color="slate"
            className="flex-1 min-w-0 justify-center [&_.pill-text]:truncate [&_.pill-label]:max-w-full"
          />
        </div>

        {/* Booking window timer (pending/requested only) */}
        {showTimer && (
          <div className="mt-2.5 shrink-0 rounded-[14px] border border-amber-500/22 bg-amber-500/8 px-3 py-2.5 @[340px]:mt-3">
            <p className="mb-1.5 text-center text-[9px] uppercase tracking-[0.22em] text-amber-300/55">
              Booking window closes
            </p>
            <FlipClock className="justify-center" expiresAt={card.expires_at} />
          </div>
        )}

        {/* Push CTA to bottom — capped so dead space stays minimal */}
        <div className="min-h-0 max-h-6 flex-1" />

        {/* Two-button CTA */}
        <div className="mt-3 flex items-center gap-2">
          {/* View — flex-1 wrapper so width:100% on the button resolves to remaining space */}
          <div className="min-w-0 flex-1">
            <ThreeDButton
              asChild
              label="View"
              hideIcon
              className="three-d-button--sm"
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            >
              <Link href={detailHref} />
            </ThreeDButton>
          </div>
          {/* Chat — fixed-width wrapper so the button becomes a square */}
          <div className="w-11 shrink-0">
            <ThreeDButton
              asChild
              label=""
              hideIcon
              customIcon={<Inbox className="h-4 w-4" />}
              className="three-d-button--sm three-d-button--emerald [&_.char-icon]:mr-0"
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            >
              <Link href={`/dashboard/business/inbox?chat=${card.id}`} />
            </ThreeDButton>
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

// ── Back card ─────────────────────────────────────────────────────────────
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

      {/* Navigation */}
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
