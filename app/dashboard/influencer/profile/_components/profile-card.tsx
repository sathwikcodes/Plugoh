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
  authAvatarUrl?: string | null;
  onNavigateToSettings?: () => void;
}

export default function ProfileCard({
  profile,
  basicProfile,
  authAvatarUrl,
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
  const avatarUrl = profile.ig_profile_picture_url || authAvatarUrl || null;

  return (
    <m.div variants={fadeUp}>
      <div
        className="rounded-3xl border border-white/[0.08] p-6 space-y-5 shadow-2xl"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 10%, #1c1524 0%, #120e18 55%, #0a0810 100%)",
        }}
      >

        {/* ── IDENTITY ROW ── */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div
              className="rounded-full p-[3px] shadow-lg"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={profile.display_name || "Profile"}
                  width={96}
                  height={96}
                  className="h-24 w-24 rounded-full object-cover border-[3px] border-[#120e18]"
                />
              ) : (
                <div className="h-24 w-24 rounded-full border-[3px] border-[#120e18] bg-[#1c1524] flex items-center justify-center">
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
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="min-w-0 flex-1 truncate text-2xl font-bold tracking-tight text-white">
                {profile.display_name || basicProfile?.full_name || "Creator"}
              </h1>
              {hasPhone && (
                <>
                  <span className="inline-flex shrink-0 items-center justify-center md:hidden">
                    <Image
                      src="/verified.png"
                      alt="Verified"
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] object-contain"
                    />
                  </span>
                  <span className="hidden md:block">
                    <RealReachVerifiedBadge />
                  </span>
                </>
              )}
            </div>

            {/* Instagram + Location row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              {handle && instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary/80 hover:text-primary transition-colors"
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
