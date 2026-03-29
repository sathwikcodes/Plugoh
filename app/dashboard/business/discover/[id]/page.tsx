"use client";

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
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { usePortfolioMedia } from "@/hooks/queries/use-instagram-media";
import { useAuth } from "@/contexts/auth-context";
import { compactNumber, formatNumber } from "@/lib/format";
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
    <div className="container max-w-5xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/business/discover">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to discover
        </Link>
      </Button>

      <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-2xl">
        <CardContent className="space-y-8 p-0">
          <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(133,219,255,0.16),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)] p-6 sm:p-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-cyan-100/85">
              <Sparkles className="h-3.5 w-3.5" />
              Brand decision page
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="flex min-w-0 items-start gap-4">
                <Avatar
                  size="lg"
                  className="h-20 w-20 border border-white/12 bg-black/30"
                >
                  <AvatarImage
                    src={profile.ig_profile_picture_url ?? undefined}
                    alt={profile.display_name || "Creator"}
                  />
                  <AvatarFallback className="bg-white/10 text-white">
                    {getProfileInitials(profile.display_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 space-y-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-semibold tracking-tight">
                        {profile.display_name || "Creator"}
                      </h1>
                      <Badge className="rounded-full border border-cyan-300/18 bg-cyan-300/10 text-[10px] uppercase tracking-[0.18em] text-cyan-100">
                        {creatorTier}
                      </Badge>
                      {profile.category ? (
                        <Badge
                          variant="secondary"
                          className="rounded-full bg-white/10 text-white/80"
                        >
                          {profile.category}
                        </Badge>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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
                          className="flex items-center gap-1.5 text-pink-300 transition-colors hover:text-pink-200"
                        >
                          <Instagram className="h-4 w-4" /> @{handle}
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {profile.bio ? (
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      {profile.bio}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Starts at
                  </p>
                  <p className="mt-2 text-2xl font-semibold">
                    {startsAtPrice ? `₹${startsAtPrice.toLocaleString()}` : "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fixed package pricing, no manual offer step
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-400/18 bg-emerald-400/10 p-4">
                  <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                    <TrendingUp className="h-3 w-3" />
                    Engagement
                  </div>
                  <p className="mt-2 text-2xl font-semibold">
                    {engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—"}
                  </p>
                  <p className="mt-1 text-xs text-emerald-100/65">
                    Quick audience health signal
                  </p>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  {isProfileComplete ? (
                    <Button
                      size="lg"
                      disabled={!availablePackages.length}
                      onClick={() => setBookingState(true)}
                      className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90 disabled:bg-white/15 disabled:text-white/45"
                    >
                      {availablePackages.length
                        ? "Book now"
                        : "Pricing unavailable"}
                    </Button>
                  ) : (
                    <div className="space-y-3 rounded-2xl border border-yellow-500/40 bg-yellow-500/8 p-4">
                      <p className="text-sm font-medium">
                        Complete your business profile to book this creator
                      </p>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/dashboard/business/profile">
                          Complete business profile
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 px-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-7">
            <div className="rounded-2xl border border-white/10 bg-secondary/40 p-4">
              <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Audience
              </div>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(profile.follower_count)}
              </p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-secondary/40 p-4">
              <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <Video className="h-3.5 w-3.5" />
                Reach
              </div>
              <p className="mt-2 text-2xl font-semibold">
                {formatNumber(profile.avg_views_per_reel)}
              </p>
              <p className="text-xs text-muted-foreground">Avg reel views</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-secondary/40 p-4">
              <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                Languages
              </div>
              <p className="mt-2 text-lg font-semibold">
                {profile.languages?.length ? profile.languages.join(", ") : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                Creator language fit
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-secondary/40 p-4">
              <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Turnaround
              </div>
              <p className="mt-2 text-lg font-semibold">
                {profile.turnaround_time
                  ? profile.turnaround_time
                      .replace(/_/g, " ")
                      .replace(/(\d)(\d)/, "$1-$2")
                  : "Flexible"}
              </p>
              <p className="text-xs text-muted-foreground">Typical delivery</p>
            </div>
          </section>

          <section className="grid gap-6 px-6 pb-8 lg:grid-cols-[1fr_0.9fr] sm:px-7">
            <div className="space-y-6">
              {availablePackages.length > 0 ? (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold">Pricing</h2>
                    <p className="text-sm text-muted-foreground">
                      Fixed package pricing keeps checkout short and clear.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {availablePackages.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        disabled={!canOpenBooking}
                        onClick={() => setBookingState(true, item.key)}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-cyan-300/25 hover:bg-cyan-300/8 disabled:cursor-default disabled:hover:border-white/10 disabled:hover:bg-black/20"
                      >
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {item.label}
                        </p>
                        <p className="mt-2 text-2xl font-semibold">
                          ₹{item.price.toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {canOpenBooking
                            ? "Click to book this package"
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
                    <h2 className="text-lg font-semibold">Content fit</h2>
                    <p className="text-sm text-muted-foreground">
                      The formats this creator already works in.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.content_types.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {portfolioMedia?.length ? (
                <div className="space-y-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Portfolio highlights
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      A quick visual proof pass before booking.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {portfolioMedia.map((item) => {
                      const imageSource = item.thumbnail_url || item.media_url;
                      return (
                        <div
                          key={item.ig_media_id}
                          className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-secondary/40"
                        >
                          {imageSource ? (
                            <Image
                              src={imageSource}
                              alt={item.caption?.slice(0, 50) || "Portfolio"}
                              fill
                              sizes="(max-width: 768px) 50vw, 220px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              {profile.previous_brands?.length ? (
                <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Previous brand work
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Social proof, kept lightweight.
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.previous_brands.map((brand) => (
                      <Badge key={brand} className="bg-white/10 text-white/85">
                        {brand}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                <div>
                  <h2 className="text-lg font-semibold">Quick read</h2>
                  <p className="text-sm text-muted-foreground">
                    Short commercial summary for the brand side.
                  </p>
                </div>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>

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
    </div>
  );
}
