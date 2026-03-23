"use client";

import Image from "next/image";
import { Instagram, MapPin } from "lucide-react";
import { RealReachVerifiedBadge } from "@/components/ui/realreach-verified-badge";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileCardProps {
  profile: InfluencerProfile;
  basicProfile?: Profile | null;
  onNavigateToSettings?: () => void;
}

export default function ProfileCard({
  profile,
  basicProfile,
  onNavigateToSettings,
}: ProfileCardProps) {
  const initials = (profile.display_name || basicProfile?.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasPhone = !!basicProfile?.phone;
  const handle = profile.instagram_handle || profile.ig_username;
  const instagramUrl =
    profile.instagram_url ||
    (handle ? `https://instagram.com/${handle}` : null);

  return (
    <m.div variants={fadeUp}>
      <div
        className="rounded-3xl border border-white/[0.08] p-6 space-y-5 shadow-2xl"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 10%, #1e1e1e 0%, #111112 55%, #0c0c0d 100%)",
        }}
      >
        {/* ── STATUS BAR ── */}
        <button
          onClick={onNavigateToSettings}
          className="w-full flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <span className={cn("relative flex h-2.5 w-2.5")}>
              {/* Pulsing ring */}
              <span
                className={cn(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-50",
                  profile.is_active ? "bg-green-400" : "bg-amber-400",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  profile.is_active ? "bg-green-500" : "bg-amber-500",
                )}
              />
            </span>
            <span
              className={cn(
                "text-sm font-medium tracking-wide",
                profile.is_active ? "text-green-400" : "text-amber-400",
              )}
            >
              {profile.is_active ? "Visible to brands" : "Hidden from brands"}
            </span>
          </div>

          {profile.category && (
            <span className="text-xs text-white/50 bg-white/[0.07] border border-white/[0.08] px-3 py-1 rounded-full group-hover:bg-white/[0.10] transition-colors">
              {profile.category}
            </span>
          )}
        </button>

        {/* ── IDENTITY ROW ── */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className="rounded-full p-[3px] shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #f58529, #dd2a7b, #8134af, #515bd4)",
              }}
            >
              {profile.ig_profile_picture_url ? (
                <Image
                  src={profile.ig_profile_picture_url}
                  alt={profile.display_name || "Profile"}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover border-[3px] border-[#111112]"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-[3px] border-[#111112] bg-[#1e1e1e] flex items-center justify-center">
                  <span className="text-2xl font-bold text-white/60">
                    {initials}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            {/* Name row with inline verified badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-white truncate">
                {profile.display_name || basicProfile?.full_name || "Creator"}
              </h1>
              {hasPhone && <RealReachVerifiedBadge />}
            </div>

            {/* Instagram + Location row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {handle && instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-pink-400/80 hover:text-pink-300 transition-colors"
                >
                  <Instagram className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">@{handle}</span>
                </a>
              )}
              {handle && profile.city && (
                <span className="text-white/20 text-xs">·</span>
              )}
              {profile.city && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/50">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {profile.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── BIO BLOCK ── */}
        {profile.bio ? (
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-4 py-3.5">
            <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
              {profile.bio}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/[0.10] px-4 py-3.5">
            <p className="text-sm text-white/25 italic">No bio added yet</p>
          </div>
        )}
      </div>
    </m.div>
  );
}
