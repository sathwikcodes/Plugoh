"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";

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
  const formatted = new Intl.NumberFormat("en-IN").format(startsAt);
  return `₹${formatted}`;
}

function getEngagementLabel(profile: InfluencerProfile) {
  const engagementRate = getEngagementRate(
    profile.avg_likes_per_reel,
    profile.follower_count,
  );
  return engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "New";
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
      className={cn("absolute inset-0 overflow-hidden rounded-[inherit]", className)}
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
        <div className="absolute inset-0" style={{ background: INSTAGRAM_GRADIENT }}>
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

function VerificationBadge() {
  return (
    <div className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center">
      <Image
        src="/verified.png"
        alt="Verified"
        width={22}
        height={22}
        className="h-[22px] w-[22px] object-contain drop-shadow-[0_6px_14px_rgba(255,255,255,0.28)]"
      />
    </div>
  );
}

interface MetricPillProps {
  kind: "followers" | "engagement";
  value: string;
}

function MetricPill({ kind, value }: MetricPillProps) {
  const isFollowers = kind === "followers";

  return (
    <div className="flex min-w-0 items-center gap-2">
      {isFollowers ? (
        <Image
          src="/people_insta.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
      ) : (
        <Image
          src="/premium_target.png"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain"
        />
      )}
      <p className="truncate text-[14px] font-semibold tracking-[-0.03em] text-white">
        {value}
      </p>
    </div>
  );
}

interface PriceButtonProps {
  profile: InfluencerProfile;
  className?: string;
}

function PriceButton({ profile, className }: PriceButtonProps) {
  return (
    <Link
      href={`/dashboard/business/discover/${profile.id}`}
      className={cn(
        "group/price inline-flex h-full min-h-[76px] items-center gap-3 rounded-[22px] bg-[#f4f4f1] px-5 py-3 text-[#111316] shadow-[0_18px_30px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:scale-[1.02]",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[9px] uppercase tracking-[0.22em] text-[#111316]/45">
          Starts from
        </p>
        <p className="mt-1 truncate text-[17px] font-semibold tracking-[-0.04em] text-[#111316]">
          {getPriceLabel(profile)}
        </p>
      </div>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#111316] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/price:translate-x-0.5" />
      </div>
    </Link>
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
          <p className="mt-1 text-[12px] font-medium tracking-[0.08em] text-white/55">
            @{instagramHandle}
          </p>
        ) : null}

        <p className="mt-2 line-clamp-2 max-w-[92%] text-[12px] leading-[1.45] text-white/62 sm:text-[12.5px]">
          {getShortBio(profile)}
        </p>

        <div className="mt-4 flex items-stretch justify-between gap-2.5 sm:gap-3">
          <div className="grid w-fit shrink-0 grid-cols-2 gap-3">
            <MetricPill kind="followers" value={getFollowerLabel(profile)} />
            <MetricPill kind="engagement" value={getEngagementLabel(profile)} />
          </div>
          <PriceButton
            profile={profile}
            className="w-[clamp(132px,42%,168px)] min-w-[132px] shrink-0 justify-between px-4 sm:px-5"
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
          "border border-white/[0.14] bg-[#080a0d]",
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
