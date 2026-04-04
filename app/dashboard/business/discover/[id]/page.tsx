"use client";

import { useState } from "react";
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
  Clock,
  Globe,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { usePortfolioMedia } from "@/hooks/queries/use-instagram-media";
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

  const { data: profile, isLoading } = useInfluencerProfile(id);
  const { data: portfolioMedia } = usePortfolioMedia(
    profile?.user_id,
    profile?.portfolio_media_ids,
  );
  const availablePackages = profile ? getAvailablePackages(profile) : [];
  const bookingOpen = searchParams.get("book") === "1";
  const selectedPackageSeed = normalizePackage(searchParams.get("package"));
  const canOpenBooking = isProfileComplete && availablePackages.length > 0;

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

  const handle = profile.instagram_handle || profile.ig_username;
  const engagementRate = getEngagementRate(
    profile.avg_likes_per_reel,
    profile.follower_count,
  );
  const creatorTier = getCreatorTier(profile.follower_count);
  const startsAtPrice = getStartsAtPrice(profile);
  const activeImage = activeMedia?.media_url || activeMedia?.thumbnail_url;
  const formatStat = (value: number | null | undefined) =>
    typeof value === "number" ? compactNumber(value) : "\u2014";

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
    <div className="container max-w-6xl space-y-6 py-6 animate-fade-in text-slate-900">
      <Button variant="ghost" asChild className="text-slate-600">
        <Link href="/dashboard/business/discover">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to discover
        </Link>
      </Button>

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <section className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc,#ffffff_60%)] px-6 py-8 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="flex min-w-0 items-start gap-5">
              <Avatar className="h-20 w-20 border border-slate-200 bg-white">
                <AvatarImage
                  src={profile.ig_profile_picture_url ?? undefined}
                  alt={profile.display_name || "Creator"}
                />
                <AvatarFallback className="bg-slate-100 text-slate-700">
                  {getProfileInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                    {profile.display_name || "Creator"}
                  </h1>
                  <Image
                    src="/verified.png"
                    alt="Verified"
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] object-contain"
                  />
                  <Badge className="rounded-full border border-slate-200 bg-slate-100 text-[10px] uppercase tracking-[0.2em] text-slate-700">
                    {creatorTier}
                  </Badge>
                  {profile.category ? (
                    <Badge className="rounded-full border border-slate-200 bg-white text-slate-600">
                      {profile.category}
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
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
                      className="flex items-center gap-1.5 text-slate-700 transition-colors hover:text-slate-900"
                    >
                      <Instagram className="h-4 w-4" /> @{handle}
                    </a>
                  ) : null}
                </div>

                {profile.bio ? (
                  <p className="max-w-2xl text-sm leading-6 text-slate-600">
                    {profile.bio}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 lg:pl-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
                  Starts from
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-900">
                  {startsAtPrice
                    ? `₹${startsAtPrice.toLocaleString("en-IN")}`
                    : "—"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Fixed pricing, faster bookings.
                </p>

                <div className="mt-4 grid gap-2">
                  {isProfileComplete ? (
                    <Button
                      size="lg"
                      disabled={!availablePackages.length}
                      onClick={() => setBookingState(true)}
                      className="h-12 w-full rounded-full bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400"
                    >
                      {availablePackages.length
                        ? "Book now"
                        : "Pricing unavailable"}
                    </Button>
                  ) : (
                    <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-medium text-amber-900">
                        Complete your business profile to book this creator
                      </p>
                      <Button
                        variant="outline"
                        asChild
                        className="w-full border-amber-200 text-amber-900"
                      >
                        <Link href="/dashboard/business/profile">
                          Complete business profile
                        </Link>
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-full border-slate-200 text-slate-700"
                    asChild
                  >
                    <Link href="#packages">View packages</Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-emerald-700">
                  <TrendingUp className="h-3 w-3" /> Engagement
                </div>
                <p className="mt-3 text-2xl font-semibold text-emerald-950">
                  {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—"}
                </p>
                <p className="mt-1 text-xs text-emerald-700/70">
                  Quick audience health signal.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 border-b border-slate-200/80 px-6 py-6 sm:grid-cols-2 lg:grid-cols-5 sm:px-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <Users className="h-3.5 w-3.5" /> Followers
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {compactNumber(profile.follower_count)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <Video className="h-3.5 w-3.5" /> Avg views
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {compactNumber(profile.avg_views_per_reel)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" /> Engagement
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <Globe className="h-3.5 w-3.5" /> Languages
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {profile.languages?.length ? profile.languages.join(", ") : "—"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Turnaround
            </div>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {profile.turnaround_time
                ? profile.turnaround_time
                    .replace(/_/g, " ")
                    .replace(/(\d)(\d)/, "$1-$2")
                : "Flexible"}
            </p>
          </div>
        </section>

        <section className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_0.75fr] sm:px-10">
          <div className="space-y-8">
            {availablePackages.length > 0 ? (
              <div id="packages" className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Packages
                  </h2>
                  <p className="text-sm text-slate-500">
                    Fixed pricing keeps booking fast and predictable.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {availablePackages.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      disabled={!canOpenBooking}
                      onClick={() => setBookingState(true, item.key)}
                      className="rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] disabled:cursor-default"
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {canOpenBooking
                          ? "Tap to book this package"
                          : "Bookable once your profile is ready"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {profile.content_types?.length ? (
              <div className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Content fit
                  </h2>
                  <p className="text-sm text-slate-500">
                    Formats the creator already delivers.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.content_types.map((item) => (
                    <Badge
                      key={item}
                      className="rounded-full border border-slate-200 bg-slate-50 text-slate-600"
                    >
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            {portfolioMedia?.length ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Portfolio highlights
                  </h2>
                  <p className="text-sm text-slate-500">
                    Tap any post to see the original details.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {portfolioMedia.map((item) => {
                    const imageSource = item.thumbnail_url || item.media_url;
                    return (
                      <button
                        key={item.ig_media_id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
                        className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            {profile.previous_brands?.length ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-5">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Previous brand work
                  </h2>
                  <p className="text-sm text-slate-500">
                    Trusted by teams that ship often.
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.previous_brands.map((brand) => (
                    <Badge
                      key={brand}
                      className="rounded-full border border-slate-200 bg-slate-50 text-slate-600"
                    >
                      {brand}
                    </Badge>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Quick read
                </h2>
                <p className="text-sm text-slate-500">
                  Short commercial summary for the brand side.
                </p>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>
                  {profile.display_name || "This creator"} works best when the
                  brand already knows the package and the outcome they want.
                </p>
                <p>
                  {profile.follower_count
                    ? `${compactNumber(profile.follower_count)} audience with ${engagementRate > 0 ? `${engagementRate.toFixed(1)}% engagement` : "active content performance"}.`
                    : "Audience metrics are partially available from synced Instagram data."}
                </p>
                <p>
                  Booking keeps to fixed pricing and a short structured brief,
                  so the creator sees clearer intent and the brand spends less
                  time typing.
                </p>
              </div>
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
