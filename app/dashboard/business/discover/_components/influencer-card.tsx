"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";
import {
  VerificationBadge,
  ExperiencePill,
  MetricPill,
  PriceButton,
} from "./influencer-card-stats";

export type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

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

function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

function getDisplayName(profile: InfluencerProfile) {
  return profile.display_name?.trim() || "Creator";
}

function getShortBio(profile: InfluencerProfile) {
  if (profile.bio?.trim()) return profile.bio.trim();
  if (profile.category?.trim()) {
    return `${profile.category.trim()} creator building polished brand stories.`;
  }
  return "Creator crafting polished brand-friendly content with a sharp personal style.";
}

function getFollowerLabel(profile: InfluencerProfile) {
  return compactNumber(profile.follower_count ?? 0);
}

function getPriceLabel(profile: InfluencerProfile) {
  const startsAt = getStartsAtPrice(profile);
  if (!startsAt) return "On request";
  return new Intl.NumberFormat("en-IN").format(startsAt);
}

function getEngagementLabel(profile: InfluencerProfile) {
  const engagementRate = getEngagementRate(
    profile.avg_likes_per_reel,
    profile.follower_count,
  );
  return engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "New";
}

function isProInfluencer(profile: InfluencerProfile) {
  return Array.isArray(profile.previous_brands) && profile.previous_brands.length > 0;
}

function getInstagramHandle(profile: InfluencerProfile) {
  return profile.ig_username?.trim() || profile.instagram_handle?.trim() || "";
}

interface InfluencerCardArtworkProps {
  profile: InfluencerProfile;
  className?: string;
}

export function InfluencerCardArtwork({
  profile,
  className,
}: InfluencerCardArtworkProps) {
  const hasPhoto = !!profile.ig_profile_picture_url;

  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      {hasPhoto ? (
        <Image
          src={profile.ig_profile_picture_url!}
          alt={getDisplayName(profile)}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 33vw, 26vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.035]"
          unoptimized
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: INSTAGRAM_GRADIENT }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_18%,rgba(255,255,255,0.28),transparent_42%),radial-gradient(circle_at_72%_82%,rgba(255,210,160,0.18),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.08),transparent_34%,rgba(9,9,12,0.45)_100%)]" />
          <div className="flex h-full items-center justify-center">
            <span className="heading-mix-accent text-7xl text-white/25 sm:text-8xl">
              {getProfileInitials(profile.display_name)}
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,0.05)_0%,rgba(3,5,8,0.14)_28%,rgba(3,5,8,0.46)_72%,rgba(3,5,8,0.88)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,rgba(9,12,17,0)_0%,rgba(9,12,17,0.10)_10%,rgba(9,12,17,0.28)_32%,rgba(9,12,17,0.84)_100%)]" />
      <div className="absolute inset-x-0 bottom-[30%] h-28 bg-[linear-gradient(180deg,rgba(13,16,21,0)_0%,rgba(13,16,21,0.72)_100%)]" />
      <div className="absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-48px_80px_rgba(0,0,0,0.48)]" />
    </div>
  );
}

interface InfluencerCardInfoPanelProps {
  profile: InfluencerProfile;
  className?: string;
}

export function InfluencerCardInfoPanel({
  profile,
  className,
}: InfluencerCardInfoPanelProps) {
  const instagramHandle = getInstagramHandle(profile);
  const locationLabel = profile.city?.trim() || "";

  return (
    <div
      className={cn(
        "absolute inset-x-3 bottom-3 overflow-hidden rounded-[28px] border border-white/15",
        "bg-[linear-gradient(180deg,rgba(40,44,49,0.22)_0%,rgba(12,14,19,0.92)_100%)]",
        "shadow-[0_26px_60px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.14)]",
        "backdrop-blur-[18px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.02)_26%,rgba(255,255,255,0)_52%)]" />
      <div className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.58),transparent)]" />

      <div className="relative px-4 pb-4 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center">
          <p className="truncate text-[22px] font-semibold tracking-[-0.05em] text-white sm:text-[24px]">
            {getDisplayName(profile)}
          </p>
          <VerificationBadge />
        </div>

        {instagramHandle ? (
          <div className="mt-1 flex min-w-0 items-center gap-2">
            <Image
              src="/instagram_icon.png"
              alt=""
              width={14}
              height={14}
              className="h-3 w-3 shrink-0 object-contain"
            />
            <p className="truncate text-[12px] font-medium tracking-[0.08em] text-[#f7a3c8]/95">
              {instagramHandle}
            </p>
            {locationLabel ? (
              <div className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-white/70">
                <Image
                  src="/map.png"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 shrink-0 object-contain"
                />
                <span className="max-w-23 truncate sm:max-w-33">
                  {locationLabel}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <p className="mt-2 line-clamp-2 max-w-[92%] text-[12px] leading-[1.45] text-white/62 sm:text-[12.5px]">
          {getShortBio(profile)}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex w-fit shrink-0 flex-col justify-center gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3">
            <MetricPill kind="followers" value={getFollowerLabel(profile)} />
            <div className="sm:hidden">
              <ExperiencePill isPro={isProInfluencer(profile)} />
            </div>
            <div className="hidden sm:block">
              <MetricPill
                kind="engagement"
                value={getEngagementLabel(profile)}
              />
            </div>
          </div>
          <PriceButton
            profileId={profile.id}
            label={getPriceLabel(profile)}
            className="min-w-0 flex-[0.88] sm:flex-1"
          />
        </div>
      </div>
    </div>
  );
}

interface InfluencerCardProps {
  profile: InfluencerProfile;
  className?: string;
}

export function InfluencerCard({ profile, className }: InfluencerCardProps) {
  return (
    <div className={cn("group block", className)}>
      <div
        className={cn(
          "relative aspect-[0.68] w-full overflow-hidden rounded-[34px]",
          "border border-white/[0.14] bg-[#080609]",
          "shadow-[0_28px_80px_rgba(0,0,0,0.46)]",
        )}
      >
        <InfluencerCardArtwork profile={profile} />
        <InfluencerCardInfoPanel profile={profile} />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />
      </div>
    </div>
  );
}
