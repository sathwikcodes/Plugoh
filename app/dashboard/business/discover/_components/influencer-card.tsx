"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Instagram,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

export function getCreatorTier(followers: number | null): string {
  if (!followers || followers < 10_000) return "Nano";
  if (followers < 100_000) return "Micro";
  if (followers < 500_000) return "Mid";
  return "Macro";
}

export function getStartsAtPrice(profile: InfluencerProfile): number | null {
  const prices = [
    profile.price_per_reel,
    profile.price_per_post,
    profile.price_per_story,
  ].filter((v): v is number => typeof v === "number" && v > 0);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export function getProfileInitials(name: string | null): string {
  const source = name?.trim() || "C";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

interface InfluencerCardProps {
  profile: InfluencerProfile;
  className?: string;
}

export function InfluencerCard({ profile, className }: InfluencerCardProps) {
  const tier = getCreatorTier(profile.follower_count);
  const startsAt = getStartsAtPrice(profile);
  const engagementRate = getEngagementRate(
    profile.avg_likes_per_reel,
    profile.follower_count,
  );
  const hasPhoto = !!profile.ig_profile_picture_url;
  const handle = profile.instagram_handle || profile.ig_username;
  const isVerified = !!handle;

  return (
    <Link
      href={`/dashboard/business/discover/${profile.id}`}
      className={cn("block", className)}
    >
      <div className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-[22px] border border-white/[0.08] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
        {/* ── Background photo / gradient ─────────────────────── */}
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

        {/* ── Top badges ──────────────────────────────────────── */}
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

        {/* ── Feathered transition into glass ─────────────────── */}
        {/* Soft gradient that bleeds from transparent into the panel color */}
        <div
          className="absolute inset-x-0 pointer-events-none"
          style={{
            bottom: "42%",
            height: 64,
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(8,10,16,0.76) 100%)",
          }}
        />

        {/* ── Matte glass panel ───────────────────────────────── */}
        <div
          className="absolute inset-x-0 bottom-0 border-t border-white/[0.07]"
          style={{
            height: "42%",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            backgroundColor: "rgba(8, 10, 16, 0.76)",
          }}
        >
          <div className="flex h-full flex-col justify-between gap-1.5 p-3.5">
            {/* Row 1 — Name + small avatar circle */}
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
              {/* Avatar circle */}
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
            {handle ? (
              <div className="flex items-center gap-1 self-start rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1">
                <Instagram className="h-3 w-3 shrink-0 text-pink-300/50" />
                <span className="text-[11px] text-pink-200/60 truncate max-w-[140px]">
                  @{handle}
                </span>
              </div>
            ) : null}

            {/* Row 3 — Bio */}
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2">
              <p className="line-clamp-2 text-[11px] leading-[1.55] text-white/55">
                {profile.bio ||
                  (profile.city ? `Based in ${profile.city}` : "No bio yet")}
              </p>
            </div>

            {/* Row 4 — Metrics + Price */}
            <div className="grid grid-cols-2 gap-1.5">
              {/* Metrics */}
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
                {engagementRate > 0 && (
                  <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-emerald-300/70">
                    <TrendingUp className="h-2.5 w-2.5" />
                    {engagementRate.toFixed(1)}%
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center justify-between rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-2">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-white/30">
                    {startsAt ? "from" : "pricing"}
                  </span>
                  <p className="text-[13px] font-semibold text-white leading-none">
                    {startsAt ? `₹${compactNumber(startsAt)}` : "—"}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/25" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
