"use client";

import { useState } from "react";
import Link from "next/link";
import {
  m,
  useMotionValue,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Instagram,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  getCreatorTier,
  getProfileInitials,
  getStartsAtPrice,
} from "./influencer-card";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

function getEngagementRate(likes: number | null, followers: number | null) {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

// How many cards are visible in the stack
const VISIBLE_COUNT = 4;
const OFFSET_X = 8;
const OFFSET_Y = 14;
const SCALE_STEP = 0.045;
const DIM_STEP = 0.12;
const SWIPE_THRESHOLD = 60;

const SPRING = {
  type: "spring" as const,
  stiffness: 240,
  damping: 26,
};

interface Props {
  profiles: InfluencerProfile[];
}

export function InfluencerCardStack({ profiles }: Props) {
  const [cards, setCards] = useState<InfluencerProfile[]>(profiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDir, setDragDir] = useState<"left" | "right" | null>(null);
  const total = profiles.length;

  const dragX = useMotionValue(0);
  const rotateY = useTransform(dragX, [-200, 0, 200], [-12, 0, 12]);
  const opacity = useTransform(
    dragX,
    [-200, -80, 0, 80, 200],
    [0, 0.6, 1, 0.6, 0],
  );

  const moveToEnd = () => {
    setCards((prev) => [...prev.slice(1), prev[0]]);
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const moveToStart = () => {
    setCards((prev) => [prev[prev.length - 1], ...prev.slice(0, -1)]);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

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
    <div className="flex flex-col items-center gap-4 px-1 pb-2 pt-1">
      {/* Stack container */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "3 / 4.28", maxWidth: 376 }}
      >
        <ul className="relative h-full w-full list-none m-0 p-0">
          <AnimatePresence>
            {visibleCards.map((profile, i) => {
              const isFront = i === 0;
              const brightness = Math.max(0.42, 1 - i * DIM_STEP);
              const tier = getCreatorTier(profile.follower_count);
              const startsAt = getStartsAtPrice(profile);
              const engRate = getEngagementRate(
                profile.avg_likes_per_reel,
                profile.follower_count,
              );
              const isVerified = !!(
                profile.instagram_handle || profile.ig_username
              );
              const hasPhoto = !!profile.ig_profile_picture_url;
              const offsetDirection = i % 2 === 0 ? -1 : 1;

              return (
                <m.li
                  key={profile.id}
                  className="absolute inset-0 overflow-hidden rounded-[24px] border border-white/10 list-none"
                  style={{
                    cursor: isFront ? "grab" : "auto",
                    touchAction: "none",
                    rotateY: isFront ? rotateY : 0,
                    transformPerspective: 900,
                    transformOrigin: "center center",
                    boxShadow: isFront
                      ? "0 34px 72px rgba(0,0,0,0.74)"
                      : "0 16px 36px rgba(0,0,0,0.4)",
                  }}
                  animate={{
                    x: isFront ? 0 : offsetDirection * i * OFFSET_X,
                    y: i * OFFSET_Y,
                    scale: 1 - i * SCALE_STEP,
                    filter: `brightness(${brightness})`,
                    zIndex: VISIBLE_COUNT - i,
                    opacity: dragDir && isFront ? 0 : 1 - i * 0.08,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.88,
                    y: 26,
                    transition: { duration: 0.2 },
                  }}
                  transition={SPRING}
                  drag={isFront ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.5}
                  onDrag={(_, info) => {
                    if (isFront) dragX.set(info.offset.x);
                  }}
                  onDragEnd={handleDragEnd}
                  whileDrag={
                    isFront
                      ? {
                          cursor: "grabbing",
                          scale: 1.025,
                          zIndex: VISIBLE_COUNT + 1,
                        }
                      : {}
                  }
                >
                  {/* Background */}
                  {hasPhoto ? (
                    <img
                      src={profile.ig_profile_picture_url!}
                      alt={profile.display_name || "Creator"}
                      className="absolute inset-0 h-full w-full object-cover object-[center_15%] pointer-events-none select-none"
                      draggable={false}
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: INSTAGRAM_GRADIENT }}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.10),transparent_58%)]" />
                      <div className="flex h-full items-end justify-center pb-[44%]">
                        <span className="text-7xl font-black text-white/20 select-none leading-none">
                          {getProfileInitials(profile.display_name)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Top badges — only on front card */}
                  {isFront && (
                    <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2 pointer-events-none">
                      {profile.category ? (
                        <span className="rounded-full border border-white/[0.12] bg-black/35 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.10em] text-white/80 backdrop-blur-sm">
                          {profile.category}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.10em] backdrop-blur-sm",
                          tier === "Macro"
                            ? "border-amber-400/25 bg-amber-400/12 text-amber-200/90"
                            : tier === "Mid"
                              ? "border-violet-400/25 bg-violet-400/12 text-violet-200/90"
                              : tier === "Micro"
                                ? "border-sky-400/25 bg-sky-400/12 text-sky-200/90"
                                : "border-white/12 bg-white/8 text-white/60",
                        )}
                      >
                        {tier}
                      </span>
                    </div>
                  )}

                  {/* Feathered transition fade */}
                  {isFront && (
                    <div
                      className="absolute inset-x-0 pointer-events-none"
                      style={{
                        bottom: "42%",
                        height: 64,
                        background:
                          "linear-gradient(to bottom, transparent 0%, rgba(8,10,16,0.76) 100%)",
                      }}
                    />
                  )}

                  {/* Matte glass panel — front card only */}
                  {isFront && (
                    <m.div
                      className="absolute inset-x-0 bottom-0 border-t border-white/[0.07]"
                      style={{
                        height: "42%",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        backgroundColor: "rgba(8, 10, 16, 0.76)",
                        opacity,
                      }}
                    >
                      <div className="flex h-full flex-col justify-between gap-1.5 p-3.5">
                        {/* Row 1 — Name + avatar circle */}
                        <div className="flex items-center gap-2">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-1.5">
                            <span className="truncate text-[13px] font-semibold leading-tight text-white">
                              {profile.display_name || "Creator"}
                            </span>
                            {isVerified && (
                              <BadgeCheck
                                className="h-3.5 w-3.5 shrink-0 text-sky-300/80"
                                strokeWidth={2.5}
                              />
                            )}
                          </div>
                          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.06]">
                            {hasPhoto ? (
                              <img
                                src={profile.ig_profile_picture_url!}
                                alt=""
                                className="h-full w-full object-cover pointer-events-none"
                                draggable={false}
                              />
                            ) : (
                              <div
                                className="flex h-full items-center justify-center"
                                style={{ background: INSTAGRAM_GRADIENT }}
                              >
                                <span className="text-[10px] font-bold text-white/80">
                                  {getProfileInitials(profile.display_name)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Row 2 — Instagram handle */}
                        {profile.instagram_handle || profile.ig_username ? (
                          <div className="flex items-center gap-1 self-start rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1">
                            <Instagram className="h-3 w-3 shrink-0 text-pink-300/50" />
                            <span className="text-[11px] text-pink-200/60 truncate max-w-[160px]">
                              @{profile.instagram_handle || profile.ig_username}
                            </span>
                          </div>
                        ) : null}

                        {/* Row 3 — Bio */}
                        <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2">
                          <p className="line-clamp-2 text-[11px] leading-[1.55] text-white/55">
                            {profile.bio ||
                              (profile.city
                                ? `Based in ${profile.city}`
                                : "No bio yet")}
                          </p>
                        </div>

                        {/* Row 4 — Metrics + Price */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Users className="h-2.5 w-2.5 text-white/30" />
                              <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                                Followers
                              </span>
                            </div>
                            <p className="text-[13px] font-semibold text-white leading-none">
                              {compactNumber(profile.follower_count ?? 0)}
                            </p>
                            {engRate > 0 && (
                              <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-emerald-300/70">
                                <TrendingUp className="h-2.5 w-2.5" />
                                {engRate.toFixed(1)}%
                              </p>
                            )}
                          </div>
                          <div className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2">
                            <div>
                              <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                                {startsAt ? "from" : "pricing"}
                              </span>
                              <p className="text-[13px] font-semibold text-white leading-none">
                                {startsAt ? `₹${compactNumber(startsAt)}` : "—"}
                              </p>
                            </div>
                            <Link
                              href={`/dashboard/business/discover/${profile.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ArrowRight className="h-3.5 w-3.5 text-white/30 hover:text-white/60 transition-colors" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </m.div>
                  )}
                </m.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>

      {/* Navigation controls */}
      <div
        className="mt-4 flex w-full items-center justify-center gap-3 pb-0"
        style={{ maxWidth: 376 }}
      >
        <ShinyButton
          onClick={moveToStart}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border-white/14 bg-white/[0.05] px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <ChevronLeft className="h-5.5 w-5.5 shrink-0" />
        </ShinyButton>

        <div className="min-w-[76px] text-center">
          <span className="text-sm font-medium text-white/78 tabular-nums">
            {currentIndex + 1}
          </span>
          <span className="px-1 text-white/22">/</span>
          <span className="text-sm text-white/48 tabular-nums">{total}</span>
        </div>

        <ShinyButton
          onClick={moveToEnd}
          className="flex h-13 w-13 items-center justify-center rounded-2xl border-white/14 bg-white/[0.05] px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
        >
          <ChevronRight className="h-5.5 w-5.5 shrink-0" />
        </ShinyButton>
      </div>
    </div>
  );
}
