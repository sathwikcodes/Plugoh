"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ArrowLeft,
  Image as ImageIcon,
  Instagram,
  Loader2,
  MapPin,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import {
  usePortfolioMedia,
  useTopMedia,
} from "@/hooks/queries/use-instagram-media";
import { useAuth } from "@/contexts/auth-context";
import { compactNumber } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";
import {
  getCreatorTier,
  getEngagementRate,
  getAvailablePackages,
  getProfileInitials,
  getStartsAtPrice,
  type BookablePackage,
} from "@/lib/booking";
import { InstagramEmbed } from "@/components/shared/instagram-embed";
import { BookingDrawer } from "./_components/booking-drawer";

function normalizePackage(value: string | null): BookablePackage | null {
  if (value === "reel" || value === "post" || value === "story") {
    return value;
  }

  return null;
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
  const [showcaseIndex, setShowcaseIndex] = useState(0);

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
  const activeImage = activeMedia?.media_url || activeMedia?.thumbnail_url;
  const formatStat = (value: number | null | undefined) =>
    typeof value === "number" ? compactNumber(value) : "\u2014";
  const showcaseFallback = [
    {
      type: "Reel",
      caption:
        "Tried this amazing biryani at the new outlet and honestly blown away by the flavors! Must visit if you're in Koramangala.",
      likes: "12.4K",
      comments: "342",
      views: "89K",
    },
    {
      type: "Post",
      caption:
        "Summer collection drop! Every piece is handcrafted with love. Swipe to see my favorites from the lookbook shoot.",
      likes: "8.2K",
      comments: "215",
      views: null,
    },
    {
      type: "Reel",
      caption:
        "Honest review of the new skincare range — no filter, no edits. Here's what actually worked for my skin.",
      likes: "15.1K",
      comments: "523",
      views: "112K",
    },
    {
      type: "Story",
      caption:
        "BTS from today's cafe shoot. The vibe, the coffee, the content — everything was perfect.",
      likes: "6.8K",
      comments: "128",
      views: "45K",
    },
  ];
  const showcaseItems = topMedia?.length
    ? topMedia.slice(0, 3)
    : portfolioMedia?.length
      ? portfolioMedia.slice(0, 3)
      : [];
  const hasShowcaseMedia = showcaseItems.length > 0;
  const showcaseFallbackItems = showcaseFallback.slice(0, 3);
  const showcaseTotal = hasShowcaseMedia
    ? showcaseItems.length
    : showcaseFallbackItems.length;
  const activeShowcaseItem = hasShowcaseMedia
    ? showcaseItems[showcaseIndex % showcaseTotal]
    : showcaseFallbackItems[showcaseIndex % showcaseTotal];
  const activeShowcaseMedia = hasShowcaseMedia
    ? (activeShowcaseItem as Database["public"]["Tables"]["instagram_media"]["Row"])
    : null;
  const activeShowcaseFallback = !hasShowcaseMedia
    ? (activeShowcaseItem as (typeof showcaseFallback)[number])
    : null;

  useEffect(() => {
    setShowcaseIndex(0);
  }, [hasShowcaseMedia, showcaseItems.length]);

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
                        profile.instagram_url ||
                        `https://instagram.com/${handle}`
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

                {(profile.content_types?.length || profile.languages?.length) ? (
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
                      onClick={() => setBookingState(true)}
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

        <section className="px-6 py-8 sm:px-10">
          <div className="space-y-8">
            {/* ── Content Showcase (Instagram Embeds) ───────────── */}
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

              {showcaseTotal > 0 ? (
                <div className="sm:hidden space-y-4">
                  <div className="relative aspect-[0.8] w-full overflow-hidden rounded-[28px] border border-white/12 bg-[#080a0d] shadow-[0_28px_80px_rgba(0,0,0,0.46)]">
                    {hasShowcaseMedia ? (
                      (() => {
                        const imageSource =
                          activeShowcaseMedia?.thumbnail_url ||
                          activeShowcaseMedia?.media_url;
                        return imageSource ? (
                          <Image
                            src={imageSource}
                            alt={
                              activeShowcaseMedia?.caption?.slice(0, 60) ||
                              "Content preview"
                            }
                            fill
                            sizes="100vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-slate-400" />
                          </div>
                        );
                      })()
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
                          {activeShowcaseFallback?.type === "Reel" ? (
                            <Video className="h-12 w-12" />
                          ) : (
                            <ImageIcon className="h-12 w-12" />
                          )}
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {activeShowcaseFallback?.type}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,8,0)_0%,rgba(3,5,8,0.35)_52%,rgba(3,5,8,0.9)_100%)]" />
                    <div className="absolute inset-x-3 bottom-3 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(40,44,49,0.24)_0%,rgba(12,14,19,0.9)_100%)] px-4 py-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-[16px]">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-white/60">
                        {hasShowcaseMedia
                          ? activeShowcaseMedia?.media_type || "Content"
                          : activeShowcaseFallback?.type}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm text-white/80">
                        {hasShowcaseMedia
                          ? activeShowcaseMedia?.caption ||
                            "Creator content highlight."
                          : activeShowcaseFallback?.caption}
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" />
                          {hasShowcaseMedia
                            ? formatStat(activeShowcaseMedia?.like_count)
                            : activeShowcaseFallback?.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Video className="h-3.5 w-3.5" />
                          {hasShowcaseMedia
                            ? formatStat(activeShowcaseMedia?.comments_count)
                            : activeShowcaseFallback?.comments}
                        </span>
                        {hasShowcaseMedia ? null : activeShowcaseFallback?.views ? (
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {activeShowcaseFallback.views}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-center gap-3">
                    <ShinyButton
                      onClick={() =>
                        setShowcaseIndex((prev) =>
                          showcaseTotal
                            ? (prev - 1 + showcaseTotal) % showcaseTotal
                            : 0,
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center rounded-[20px] border-white/14 bg-white/[0.05] px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
                    >
                      <Image
                        src="/back.png"
                        alt="Previous content"
                        width={22}
                        height={22}
                        className="h-5.5 w-5.5 shrink-0 object-contain"
                      />
                    </ShinyButton>
                    <div className="min-w-[72px] text-center">
                      <span className="text-sm font-medium tabular-nums text-white/78">
                        {showcaseTotal ? showcaseIndex + 1 : 0}
                      </span>
                      <span className="px-1 text-white/22">/</span>
                      <span className="text-sm tabular-nums text-white/48">
                        {showcaseTotal}
                      </span>
                    </div>
                    <ShinyButton
                      onClick={() =>
                        setShowcaseIndex((prev) =>
                          showcaseTotal ? (prev + 1) % showcaseTotal : 0,
                        )
                      }
                      className="flex h-12 w-12 items-center justify-center rounded-[20px] border-white/14 bg-white/[0.05] px-0 py-0 text-white/80 shadow-[0_14px_30px_rgba(0,0,0,0.24)]"
                    >
                      <Image
                        src="/next.png"
                        alt="Next content"
                        width={22}
                        height={22}
                        className="h-5.5 w-5.5 shrink-0 object-contain"
                      />
                    </ShinyButton>
                  </div>
                </div>
              ) : null}

              {topMedia && topMedia.length > 0 ? (
                <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                  {topMedia.slice(0, 3).map((item) =>
                    item.permalink ? (
                      <InstagramEmbed
                        key={item.ig_media_id}
                        permalink={item.permalink}
                      />
                    ) : null,
                  )}
                </div>
              ) : portfolioMedia?.length ? (
                <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-3">
                  {portfolioMedia.slice(0, 3).map((item) => {
                    const imageSource = item.thumbnail_url || item.media_url;
                    return (
                      <button
                        key={item.ig_media_id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/50"
                      >
                        {imageSource ? (
                          <Image
                            src={imageSource}
                            alt={item.caption?.slice(0, 50) || "Portfolio"}
                            fill
                            sizes="(max-width: 768px) 50vw, 220px"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-slate-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* ── Placeholder cards when no Instagram data ── */
                <div className="hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
                  {showcaseFallback.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-800/70 bg-slate-900/60 overflow-hidden"
                    >
                      {/* Placeholder image area */}
                      <div className="relative aspect-square bg-gradient-to-br from-slate-900 to-slate-800">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-500">
                          {item.type === "Reel" ? (
                            <Video className="h-10 w-10" />
                          ) : (
                            <ImageIcon className="h-10 w-10" />
                          )}
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {item.type}
                          </span>
                        </div>
                        {/* Placeholder badge */}
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 shadow-sm border border-slate-700/70">
                            Sample
                          </span>
                        </div>
                      </div>
                      {/* Caption & stats */}
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                          {item.caption}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            {item.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {item.comments}
                          </span>
                          {item.views ? (
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {item.views}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* ── Packages ─────────────────────────────────────── */}
              {availablePackages.length > 0 ? (
                <div id="packages" className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Packages
                    </h2>
                    <p className="text-sm text-slate-400">
                      Fixed pricing keeps booking fast and predictable.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {availablePackages.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        disabled={!canOpenBooking}
                        onClick={() => setBookingState(true, item.key)}
                        className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-left transition hover:border-slate-700 hover:shadow-[0_12px_24px_rgba(2,6,23,0.4)] disabled:cursor-default"
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {canOpenBooking
                            ? "Tap to book this package"
                            : "Bookable once your profile is ready"}
                        </p>
                      </button>
                    ))}
                  </div>
                  {profile.turnaround_time ? (
                    <p className="text-xs text-slate-400">
                      Typical turnaround:{" "}
                      <span className="font-medium text-slate-200">
                        {profile.turnaround_time
                          .replace(/_/g, " ")
                          .replace(/(\d)(\d)/, "$1-$2")}
                      </span>
                    </p>
                  ) : null}
                </div>
              ) : null}
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

      <Dialog
        open={!!activeMedia}
        onOpenChange={(open) => {
          if (!open) setActiveMedia(null);
        }}
      >
        <DialogContent className="max-w-3xl border border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-lg">Portfolio detail</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={activeMedia?.caption?.slice(0, 60) || "Portfolio"}
                  fill
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-slate-400" />
                </div>
              )}

            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Caption
                </p>
                <p className="mt-2 text-sm text-slate-700">
                  {activeMedia?.caption || "No caption available."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Likes
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {formatStat(activeMedia?.like_count)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Comments
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {formatStat(activeMedia?.comments_count)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Reach
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {formatStat(activeMedia?.reach)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Impressions
                  </p>
                  <p className="mt-1 text-base font-semibold text-slate-900">
                    {formatStat(activeMedia?.impressions)}
                  </p>
                </div>
              </div>
              {activeMedia?.permalink ? (
                <Button asChild className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800">
                  <a
                    href={activeMedia.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Instagram
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
