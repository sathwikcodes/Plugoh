import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThreeDButton } from "@/components/ui/3d-button";
import { compactNumber } from "@/lib/format";
import {
  getProfileInitials,
  type BookablePackage,
  type InfluencerProfile,
} from "@/lib/booking";

interface InfluencerHeroProps {
  profile: InfluencerProfile;
  handle: string;
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
  engagementRate,
  startsAtPrice,
  isProfileComplete,
  availablePackages,
  onBook,
}: InfluencerHeroProps) {
  return (
    <>
      <section className="border-b border-white/10 bg-transparent px-6 py-8 sm:px-10">
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
                  width={30}
                  height={30}
                  className="h-7.5 w-7.5 object-contain"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                {profile.city ? (
                  <span className="flex items-center gap-1">
                    <Image
                      src="/map.png"
                      alt="Location"
                      width={14}
                      height={14}
                      className="h-3.5 w-3.5 object-contain"
                    />
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
                    <Image
                      src="/instagram_3d.png"
                      alt="Instagram"
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain"
                    />
                    @{handle}
                  </a>
                ) : null}
              </div>

              {profile.bio ? (
                <p className="max-w-2xl text-sm leading-6 text-slate-300">
                  {profile.bio}
                </p>
              ) : null}

              {profile.languages?.length ? (
                <div className="flex flex-wrap gap-1.5">
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
                {startsAtPrice ? (
                  <span className="inline-flex items-center gap-2">
                    <Image
                      src="/coin.png"
                      alt="Price"
                      width={24}
                      height={24}
                      className="h-6 w-6 object-contain"
                    />
                    {startsAtPrice.toLocaleString("en-IN")}
                  </span>
                ) : (
                  "—"
                )}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Fixed pricing, faster bookings.
              </p>

              <div className="mt-4 grid gap-3.5">
                {isProfileComplete ? (
                  <ThreeDButton
                    label={availablePackages.length ? "Book now" : "Pricing unavailable"}
                    disabled={!availablePackages.length}
                    onClick={onBook}
                    hideIcon
                    className="three-d-button--no-glow three-d-button--sm w-full"
                  />
                ) : (
                  <div className="space-y-3 rounded-2xl border border-amber-300/60 bg-amber-900/20 p-4 text-center">
                    <p className="text-sm font-medium text-amber-200">
                      Complete your business profile to book this creator
                    </p>
                    <ThreeDButton
                      asChild
                      label="Complete profile"
                      hideIcon
                      className="three-d-button--amber three-d-button--no-glow three-d-button--sm w-full"
                    >
                      <Link href="/dashboard/business/profile">
                        Complete profile
                      </Link>
                    </ThreeDButton>
                  </div>
                )}
                <ThreeDButton
                  asChild
                  label="View packages"
                  hideIcon
                  className="three-d-button--neutral three-d-button--no-glow three-d-button--sm w-full"
                >
                  <Link href="#packages">View packages</Link>
                </ThreeDButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 border-b border-slate-800/70 px-6 py-6 sm:px-10">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4 text-center">
          <div className="mb-2 flex justify-center">
            <Image
              src="/people_insta.png"
              alt="Followers"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
          <p className="text-xl font-semibold text-white">
            {compactNumber(profile.follower_count)}
          </p>
          <p className="mt-1 text-[9px] leading-tight text-slate-400 sm:text-[10px]">
            Followers
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4 text-center">
          <div className="mb-2 flex justify-center">
            <Image
              src="/play.png"
              alt="Avg views"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
          <p className="text-xl font-semibold text-white">
            {compactNumber(profile.avg_views_per_reel)}
          </p>
          <p className="mt-1 text-[9px] leading-tight text-slate-400 sm:text-[10px]">
            Avg views
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4 text-center">
          <div className="mb-2 flex justify-center">
            <Image
              src="/premium_target.png"
              alt="Engagement"
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
          </div>
          <p className="text-xl font-semibold text-white">
            {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—"}
          </p>
          <p className="mt-1 text-[9px] leading-tight text-slate-400 sm:text-[10px]">
            Engagement
          </p>
        </div>
      </section>
    </>
  );
}
