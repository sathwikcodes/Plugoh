"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";
import { ThreeDPill } from "@/components/ui/3d-pill";
import {
  VerificationBadge,
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
export function isProInfluencer(profile: InfluencerProfile) {
  return (
    Array.isArray(profile.previous_brands) && profile.previous_brands.length > 0
  );
}

export function getInstagramHandle(profile: InfluencerProfile) {
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

        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white/50">
          {locationLabel ? (
            <>
              <div className="flex min-w-0 items-center gap-1">
                <Image
                  src="/map.png"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3 w-3 shrink-0 object-contain opacity-60"
                />
                <span className="truncate">{locationLabel}</span>
              </div>
              {profile.category ? (
                <span className="text-white/20">•</span>
              ) : null}
            </>
          ) : null}
          {profile.category ? (
            <span className="truncate text-[#f7a3c8]/90">{profile.category}</span>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 max-w-[92%] text-[12px] leading-[1.45] text-white/62 sm:text-[12.5px]">
          {getShortBio(profile)}
        </p>

        <div className="mt-4 flex items-center gap-2.5 sm:gap-3">
          <ThreeDPill
            label={getFollowerLabel(profile)}
            color="sky"
            className="three-d-pill--md three-d-pill--no-glow shrink-0"
            icon={
              <Image
                src="/people_insta.png"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4 shrink-0 object-contain"
              />
            }
          />
          <PriceButton
            profileId={profile.id}
            label={getPriceLabel(profile)}
            className="min-w-0 flex-1"
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
  const isPro = isProInfluencer(profile);
  const igHandle = getInstagramHandle(profile);

  // Custom Instagram pink-purple palette
  const igColor = {
    base: "#f4a7c3",
    light: "#fce4ec",
    mid: "#e991b6",
    dark: "#b5617f",
    ink: "#2d1220",
    glow: "rgba(244, 167, 195, 0.28)",
  };

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

        {/* Pro / Fresh badge — top-left */}
        <div className="absolute left-4 top-4 z-20">
          <ThreeDPill
            label={isPro ? "Pro" : "Fresh"}
            color={isPro ? "amber" : "emerald"}
            className="three-d-pill--no-glow"
            icon={
              <Image
                src={isPro ? "/fire.png" : "/leaf.png"}
                alt=""
                width={14}
                height={14}
                className="h-3.5 w-3.5 shrink-0 object-contain"
              />
            }
          />
        </div>

        {/* Instagram handle pill — top-right */}
        {igHandle ? (
          <div className="absolute right-4 top-4 z-20">
            <ThreeDPill
              label={`${igHandle}`}
              color={igColor}
              className="three-d-pill--no-glow"
              icon={
                <Image
                  src="/instagram_3d.png"
                  alt=""
                  width={14}
                  height={14}
                  className="h-3.5 w-3.5 shrink-0 object-contain"
                />
              }
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
