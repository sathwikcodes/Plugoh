"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import {
  usePortfolioMedia,
  useTopMedia,
} from "@/hooks/queries/use-instagram-media";
import { useAuth } from "@/contexts/auth-context";
import { compactNumber } from "@/lib/format";
import {
  getAvailablePackages,
  getCreatorTier,
  getEngagementRate,
  getStartsAtPrice,
  type BookablePackage,
} from "@/lib/booking";
import type { Database } from "@/lib/supabase/types";
import { BookingDrawer } from "./_components/booking-drawer";
import { InfluencerHero } from "./_components/influencer-hero";
import { InfluencerPackages } from "./_components/influencer-packages";
import {
  PortfolioDialog,
  PortfolioGrid,
} from "./_components/influencer-portfolio";
import { InfluencerInstagramTab } from "./_components/influencer-instagram-tab";
import { MediaShowcase } from "./_components/media-showcase";
import { SHOWCASE_FALLBACK } from "./_components/showcase-constants";

function normalizePackage(value: string | null): BookablePackage | null {
  if (value === "reel" || value === "post" || value === "story") return value;
  return null;
}

function formatStat(value: number | null | undefined): string {
  return typeof value === "number" ? compactNumber(value) : "\u2014";
}

export default function InfluencerProfileView() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const { isProfileComplete } = useAuth();
  const [activeMedia, setActiveMedia] = useState<
    Database["public"]["Tables"]["instagram_media"]["Row"] | null
  >(null);
  const { data: profile, isLoading } = useInfluencerProfile(id);
  const { data: portfolioMedia } = usePortfolioMedia(
    profile?.user_id,
    profile?.portfolio_media_ids,
  );
  const { data: topMedia } = useTopMedia(profile?.user_id, 6);
  const availablePackages = profile ? getAvailablePackages(profile) : [];
  const bookingOpen = searchParams.get("book") === "1";
  const selectedPackageSeed = normalizePackage(searchParams.get("package"));
  const canOpenBooking = isProfileComplete && availablePackages.length > 0;
  const handle = profile?.instagram_handle || profile?.ig_username || "";
  const engagementRate = getEngagementRate(
    profile?.avg_likes_per_reel ?? null,
    profile?.follower_count ?? null,
  );
  const creatorTier = getCreatorTier(profile?.follower_count ?? null);
  const startsAtPrice = profile ? getStartsAtPrice(profile) : null;
  const showcaseItems = topMedia?.length
    ? topMedia.slice(0, 3)
    : portfolioMedia?.length
      ? portfolioMedia.slice(0, 3)
      : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Influencer not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/business/discover">Back to Discovery</Link>
        </Button>
      </div>
    );
  }

  const setBookingState = (
    open: boolean,
    packageType?: BookablePackage | null,
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (open) {
      nextParams.set("book", "1");
      if (packageType) {
        nextParams.set("package", packageType);
      } else {
        nextParams.delete("package");
      }
    } else {
      nextParams.delete("book");
      nextParams.delete("package");
    }
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  };

  return (
    <div className="container max-w-6xl space-y-6 py-6 animate-fade-in text-slate-100">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-9 w-9 rounded-full border border-slate-700/70 text-slate-200 hover:bg-white/10"
        >
          <Link
            href="/dashboard/business/discover"
            aria-label="Back to discover influencers"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="heading-mix text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Discover{" "}
            <span className="heading-mix-accent text-3xl text-white/90 sm:text-4xl">
              Influencers
            </span>
          </h1>
        </div>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-slate-800/70 bg-slate-950/70 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
        <InfluencerHero
          profile={profile}
          handle={handle}
          creatorTier={creatorTier}
          engagementRate={engagementRate}
          startsAtPrice={startsAtPrice}
          isProfileComplete={isProfileComplete}
          availablePackages={availablePackages}
          onBook={() => setBookingState(true)}
        />

        <section className="px-6 py-8 sm:px-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Content showcase
                </h2>
                <p className="text-sm text-slate-400">
                  {topMedia && topMedia.length > 0
                    ? "Their best-performing posts — see the real content."
                    : "A preview of what this creator's content looks like."}
                </p>
              </div>

              <MediaShowcase
                showcaseItems={showcaseItems}
                showcaseFallback={SHOWCASE_FALLBACK}
                formatStat={formatStat}
              />

              {topMedia && topMedia.length > 0 ? (
                <InfluencerInstagramTab
                  topMedia={topMedia}
                  showcaseFallback={SHOWCASE_FALLBACK}
                />
              ) : portfolioMedia?.length ? (
                <PortfolioGrid
                  media={portfolioMedia}
                  onSelect={setActiveMedia}
                />
              ) : (
                <InfluencerInstagramTab
                  topMedia={null}
                  showcaseFallback={SHOWCASE_FALLBACK}
                />
              )}

              {handle ? (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    className="h-11 rounded-full border-slate-700/80 text-slate-200"
                    asChild
                  >
                    <a
                      href={
                        profile.instagram_url ||
                        `https://instagram.com/${handle}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Show more
                    </a>
                  </Button>
                </div>
              ) : null}

              <InfluencerPackages
                availablePackages={availablePackages}
                canOpenBooking={canOpenBooking}
                turnaroundTime={profile.turnaround_time}
                onSelectPackage={(pkg) => setBookingState(true, pkg)}
              />
            </div>
          </div>
        </section>
      </div>

      <BookingDrawer
        creator={profile}
        initialPackage={selectedPackageSeed}
        isProfileComplete={isProfileComplete}
        open={bookingOpen}
        onOpenChange={(nextOpen) => {
          if (nextOpen) {
            setBookingState(true, selectedPackageSeed);
            return;
          }
          setBookingState(false);
        }}
      />

      <PortfolioDialog
        activeMedia={activeMedia}
        onClose={() => setActiveMedia(null)}
        formatStat={formatStat}
      />
    </div>
  );
}
