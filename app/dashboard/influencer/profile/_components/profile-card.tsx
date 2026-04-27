"use client";

import Image from "next/image";
import { RealReachVerifiedBadge } from "@/components/ui/realreach-verified-badge";
import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
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
}: ProfileCardProps) {
  const initials = (profile.display_name || basicProfile?.full_name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const hasPhone = !!basicProfile?.phone;
  const handle = profile.instagram_handle || profile.ig_username;
  const cleanHandle = handle?.replace(/^@+/, "") || null;
  const instagramUrl =
    profile.instagram_url ||
    (cleanHandle ? `https://instagram.com/${cleanHandle}` : null);
  const avatarUrl = profile.ig_profile_picture_url || authAvatarUrl || null;
  const locationLabel = profile.city
    ? /india/i.test(profile.city)
      ? profile.city
      : `${profile.city}, India`
    : null;

  return (
    <m.div variants={fadeUp}>
      <div
        className="rounded-3xl border border-white/8 p-6 space-y-5 shadow-2xl"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 10%, #1c1524 0%, #120e18 55%, #0a0810 100%)",
        }}
      >
        {/* ── IDENTITY ROW ── */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            <div className="rounded-full p-0.75 shadow-lg">
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
            <div className="flex min-w-0 items-center gap-1.5">
              <h1 className="min-w-0 max-w-full truncate text-2xl font-bold tracking-tight text-white">
                {profile.display_name ||
                  basicProfile?.full_name ||
                  "Influencer"}
              </h1>
              {hasPhone && (
                <>
                  <span className="inline-flex shrink-0 items-center justify-center md:hidden">
                    <Image
                      src="/verified.png"
                      alt="Verified"
                      width={30}
                      height={30}
                      className="h-7.5 w-7.5 object-contain"
                    />
                  </span>
                  <span className="hidden md:block">
                    <RealReachVerifiedBadge />
                  </span>
                </>
              )}
            </div>

            {/* Instagram + Location row */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {cleanHandle && instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary/85 transition-colors hover:text-primary"
                >
                  <Image
                    src="/instagram_3d.png"
                    alt="Instagram"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 shrink-0 object-contain"
                  />
                  <span className="font-medium">{cleanHandle}</span>
                </a>
              )}
              {cleanHandle && locationLabel && (
                <span className="text-white/20 text-xs">·</span>
              )}
              {locationLabel && (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/60">
                  <Image
                    src="/map.png"
                    alt="Location"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 shrink-0 object-contain"
                  />
                  <span className="font-medium text-white/70">
                    {locationLabel}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── BIO BLOCK ── */}
        {profile.bio ? (
          <div className="rounded-2xl border border-white/6 bg-white/4 px-4 py-3.5">
            <p className="text-sm text-white/60 leading-relaxed line-clamp-3">
              {profile.bio}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3.5">
            <p className="text-sm text-white/25 italic">No bio added yet</p>
          </div>
        )}
      </div>
    </m.div>
  );
}
