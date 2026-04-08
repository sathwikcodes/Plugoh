import Link from "next/link";
import Image from "next/image";
import { Instagram, MapPin, TrendingUp, Users, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { compactNumber } from "@/lib/format";
import {
  getProfileInitials,
  type BookablePackage,
  type InfluencerProfile,
} from "@/lib/booking";

interface InfluencerHeroProps {
  profile: InfluencerProfile;
  handle: string;
  creatorTier: string;
  engagementRate: number;
  startsAtPrice: number | null;
  isProfileComplete: boolean;
  availablePackages: Array<{
    key: BookablePackage;
    label: string;
    price: number;
  }>;
  onBook: () => void;
}

export function InfluencerHero({
  profile,
  handle,
  creatorTier,
  engagementRate,
  startsAtPrice,
  isProfileComplete,
  availablePackages,
  onBook,
}: InfluencerHeroProps) {
  return (
    <>
      <section className="border-b border-slate-800/70 bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(2,6,23,0.6))] px-6 py-8 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="flex min-w-0 items-start gap-5">
            <Avatar className="h-20 w-20 border border-slate-800/70 bg-slate-900/60">
              <AvatarImage
                src={profile.ig_profile_picture_url ?? undefined}
                alt={profile.display_name || "Creator"}
              />
              <AvatarFallback className="bg-slate-800 text-slate-200">
                {getProfileInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  {profile.display_name || "Creator"}
                </h1>
                <Image
                  src="/verified.png"
                  alt="Verified"
                  width={22}
                  height={22}
                  className="h-[22px] w-[22px] object-contain"
                />
                <Badge className="rounded-full border border-slate-800/70 bg-slate-900/70 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                  {creatorTier}
                </Badge>
                {profile.category ? (
                  <Badge className="rounded-full border border-slate-800/70 bg-slate-950/50 text-slate-300">
                    {profile.category}
                  </Badge>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                {profile.city ? (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.city}
                  </span>
                ) : null}
                {handle ? (
                  <a
                    href={
                      profile.instagram_url || `https://instagram.com/${handle}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-slate-200 transition-colors hover:text-white"
                  >
                    <Instagram className="h-4 w-4" /> @{handle}
                    {profile.follower_count ? (
                      <span className="text-slate-500">
                        &middot; {compactNumber(profile.follower_count)}
                      </span>
                    ) : null}
                  </a>
                ) : null}
              </div>

              {profile.bio ? (
                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  {profile.bio}
                </p>
              ) : null}

              {profile.content_types?.length || profile.languages?.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile.content_types?.map((type) => (
                    <Badge
                      key={type}
                      className="rounded-full border border-slate-800/70 bg-slate-900/50 text-xs text-slate-300"
                    >
                      {type}
                    </Badge>
                  ))}
                  {profile.languages?.map((lang) => (
                    <Badge
                      key={lang}
                      className="rounded-full border border-slate-800/70 bg-slate-950/40 text-xs text-slate-400"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 lg:pl-4">
            <div className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.45)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                Starts from
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {startsAtPrice
                  ? `₹${startsAtPrice.toLocaleString("en-IN")}`
                  : "—"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Fixed pricing, faster bookings.
              </p>

              <div className="mt-4 grid gap-2">
                {isProfileComplete ? (
                  <Button
                    size="lg"
                    disabled={!availablePackages.length}
                    onClick={onBook}
                    className="h-12 w-full rounded-full bg-white text-slate-900 hover:bg-slate-100 disabled:bg-slate-800 disabled:text-slate-500"
                  >
                    {availablePackages.length
                      ? "Book now"
                      : "Pricing unavailable"}
                  </Button>
                ) : (
                  <div className="space-y-3 rounded-2xl border border-amber-300/60 bg-amber-900/20 p-4">
                    <p className="text-sm font-medium text-amber-200">
                      Complete your business profile to book this creator
                    </p>
                    <Button
                      variant="outline"
                      asChild
                      className="w-full border-amber-300/60 text-amber-200"
                    >
                      <Link href="/dashboard/business/profile">
                        Complete business profile
                      </Link>
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border-slate-700/80 text-slate-200"
                  asChild
                >
                  <Link href="#packages">View packages</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 border-b border-slate-800/70 px-6 py-6 sm:px-10">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
          <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <Users className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Followers</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-white">
            {compactNumber(profile.follower_count)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
          <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <Video className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Avg views</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-white">
            {compactNumber(profile.avg_views_per_reel)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4">
          <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Engagement</span>
          </div>
          <p className="mt-2 text-xl font-semibold text-white">
            {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—"}
          </p>
        </div>
      </section>
    </>
  );
}
