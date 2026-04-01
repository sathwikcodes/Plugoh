"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Instagram,
  MapPin,
  Search,
  SearchX,
  SlidersHorizontal,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import { compactNumber } from "@/lib/format";
import { CATEGORIES_WITH_ALL, CONTENT_TYPES, LANGUAGES } from "@/lib/constants";
import {
  fadeUp,
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
} from "@/lib/animations";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

type SortField = "followers" | "price" | "engagement";
type SortDirection = "desc" | "asc";

function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

function getCreatorTier(followers: number | null): string {
  if (!followers || followers < 10_000) return "Nano";
  if (followers < 100_000) return "Micro";
  if (followers < 500_000) return "Mid";
  return "Macro";
}

function getStartsAtPrice(profile: InfluencerProfile): number | null {
  const prices = [
    profile.price_per_reel,
    profile.price_per_post,
    profile.price_per_story,
  ].filter((value): value is number => typeof value === "number" && value > 0);

  if (prices.length === 0) return null;
  return Math.min(...prices);
}

function getSortValue(
  profile: InfluencerProfile,
  sortField: SortField,
): number {
  if (sortField === "price") return getStartsAtPrice(profile) ?? 0;
  if (sortField === "engagement")
    return getEngagementRate(
      profile.avg_likes_per_reel,
      profile.follower_count,
    );
  return profile.follower_count ?? 0;
}

function getProfileInitials(name: string | null): string {
  const source = name?.trim() || "Creator";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function InfluencerDiscovery() {
  const { data: profiles = [], isLoading: loading } = useInfluencerProfiles();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [language, setLanguage] = useState("All");
  const [contentType, setContentType] = useState("All");
  const [sortField, setSortField] = useState<SortField>("followers");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const filtered = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const result = profiles
      .filter((profile) => {
        if (normalizedSearch) {
          const haystack = [
            profile.display_name,
            profile.instagram_handle,
            profile.ig_username,
            profile.bio,
            profile.category,
            profile.city,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(normalizedSearch)) return false;
        }

        if (category !== "All" && profile.category !== category) return false;
        if (
          city &&
          !profile.city?.toLowerCase().includes(city.trim().toLowerCase())
        )
          return false;
        if (minPrice && (getStartsAtPrice(profile) ?? 0) < Number(minPrice))
          return false;
        if (maxPrice && (getStartsAtPrice(profile) ?? 0) > Number(maxPrice))
          return false;
        if (
          minFollowers &&
          (profile.follower_count ?? 0) < Number(minFollowers)
        )
          return false;
        if (
          language !== "All" &&
          !(profile.languages as string[] | null)?.includes(language)
        )
          return false;
        if (
          contentType !== "All" &&
          !(profile.content_types as string[] | null)?.includes(contentType)
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        const delta = getSortValue(a, sortField) - getSortValue(b, sortField);
        return sortDirection === "asc" ? delta : -delta;
      });

    return result;
  }, [
    category,
    city,
    contentType,
    deferredSearch,
    language,
    maxPrice,
    minFollowers,
    minPrice,
    profiles,
    sortDirection,
    sortField,
  ]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinFollowers("");
    setLanguage("All");
    setContentType("All");
    setSortField("followers");
    setSortDirection("desc");
  };

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={180}
          breathingRange={8}
          animationSpeed={0.015}
          containerStyle={GRADIENT_STYLE}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff14,transparent_38%),linear-gradient(180deg,#06070a_0%,#090a0f_42%,#0c1017_100%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#9fb8ff14_0%,transparent_100%)]" />
      </div>

      <div className="relative z-10 container py-6">
        <m.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <m.div variants={fadeUp} className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-11 w-11 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10"
            >
              <Link href="/dashboard/business">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.34em] text-white/45">
                Brand Marketplace
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Discover creators
              </h1>
            </div>
          </m.div>

          <m.section variants={fadeUp} className="space-y-3">
            <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-black/20 p-3 backdrop-blur-xl sm:p-4">
              <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by creator, handle, niche, or city"
                    className="h-12 rounded-full border-white/10 bg-white/[0.05] pl-11 text-white placeholder:text-white/35"
                  />
                </div>

                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger
                      render={
                        <Button className="h-12 shrink-0 rounded-full border border-cyan-300/20 bg-[linear-gradient(135deg,#dfe7ff18,#8be9ff14)] px-5 text-white shadow-[0_12px_32px_rgba(18,24,41,0.35)] backdrop-blur-md hover:bg-white/12" />
                      }
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Sort & Filter
                    </SheetTrigger>
                    <SheetContent
                      side="right"
                      className="w-full border-white/10 bg-[linear-gradient(180deg,#0f1118_0%,#0b0e14_100%)] p-0 text-white sm:max-w-lg"
                    >
                      <SheetHeader className="border-b border-white/10 px-6 py-5">
                        <SheetTitle className="text-white">
                          Sort & Filter
                        </SheetTitle>
                        <SheetDescription className="text-white/55">
                          Keep the grid clean, tune the shortlist only when you
                          need to.
                        </SheetDescription>
                      </SheetHeader>

                      <div className="h-full overflow-y-auto px-6 py-5">
                        <div className="space-y-6">
                          <section className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                                Sort
                              </p>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-white/70">
                                    Sort by
                                  </Label>
                                  <Select
                                    value={sortField}
                                    onValueChange={(value) =>
                                      setSortField(
                                        (value as SortField | null) ?? "followers",
                                      )
                                    }
                                  >
                                    <SelectTrigger className="h-11 border-white/10 bg-white/[0.04]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="followers">
                                        Followers
                                      </SelectItem>
                                      <SelectItem value="price">
                                        Price
                                      </SelectItem>
                                      <SelectItem value="engagement">
                                        Engagement
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-white/70">
                                    Direction
                                  </Label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => setSortDirection("desc")}
                                      className={cn(
                                        "h-11 rounded-2xl border border-white/10",
                                        sortDirection === "desc"
                                          ? "bg-white/12 text-white"
                                          : "bg-white/[0.04] text-white/60",
                                      )}
                                    >
                                      Desc
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      onClick={() => setSortDirection("asc")}
                                      className={cn(
                                        "h-11 rounded-2xl border border-white/10",
                                        sortDirection === "asc"
                                          ? "bg-white/12 text-white"
                                          : "bg-white/[0.04] text-white/60",
                                      )}
                                    >
                                      Asc
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-white/10" />

                          <section className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                              Audience fit
                            </p>
                            <div className="grid gap-3">
                              <div className="space-y-2">
                                <Label className="text-white/70">
                                  Category
                                </Label>
                                <Select
                                  value={category}
                                  onValueChange={(value) =>
                                    setCategory(value ?? "All")
                                  }
                                >
                                  <SelectTrigger className="h-11 border-white/10 bg-white/[0.04]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CATEGORIES_WITH_ALL.map((item) => (
                                      <SelectItem key={item} value={item}>
                                        {item}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-2">
                                  <Label className="text-white/70">
                                    Language
                                  </Label>
                                  <Select
                                    value={language}
                                    onValueChange={(value) =>
                                      setLanguage(value ?? "All")
                                    }
                                  >
                                    <SelectTrigger className="h-11 border-white/10 bg-white/[0.04]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="All">All</SelectItem>
                                      {LANGUAGES.map((item) => (
                                        <SelectItem key={item} value={item}>
                                          {item}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-white/70">
                                    Content type
                                  </Label>
                                  <Select
                                    value={contentType}
                                    onValueChange={(value) =>
                                      setContentType(value ?? "All")
                                    }
                                  >
                                    <SelectTrigger className="h-11 border-white/10 bg-white/[0.04]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="All">All</SelectItem>
                                      {CONTENT_TYPES.map((item) => (
                                        <SelectItem key={item} value={item}>
                                          {item}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-white/10" />

                          <section className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                              Commercial fit
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-2">
                                <Label className="text-white/70">
                                  Min price
                                </Label>
                                <Input
                                  type="number"
                                  value={minPrice}
                                  onChange={(e) => setMinPrice(e.target.value)}
                                  placeholder="0"
                                  className="h-11 border-white/10 bg-white/[0.04]"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-white/70">
                                  Max price
                                </Label>
                                <Input
                                  type="number"
                                  value={maxPrice}
                                  onChange={(e) => setMaxPrice(e.target.value)}
                                  placeholder="50000"
                                  className="h-11 border-white/10 bg-white/[0.04]"
                                />
                              </div>
                              <div className="space-y-2 sm:col-span-2">
                                <Label className="text-white/70">
                                  Minimum followers
                                </Label>
                                <Input
                                  type="number"
                                  value={minFollowers}
                                  onChange={(e) =>
                                    setMinFollowers(e.target.value)
                                  }
                                  placeholder="1000"
                                  className="h-11 border-white/10 bg-white/[0.04]"
                                />
                              </div>
                            </div>
                          </section>

                          <Separator className="bg-white/10" />

                          <section className="space-y-3">
                            <p className="text-xs uppercase tracking-[0.24em] text-white/35">
                              Location
                            </p>
                            <div className="space-y-2">
                              <Label className="text-white/70">City</Label>
                              <Input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="Hyderabad"
                                className="h-11 border-white/10 bg-white/[0.04]"
                              />
                            </div>
                          </section>

                          <div className="flex gap-3 pt-2">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={clearFilters}
                              className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.08]"
                            >
                              Clear all
                            </Button>
                            <Button
                              type="button"
                              onClick={() => setSheetOpen(false)}
                              className="h-11 flex-1 rounded-2xl bg-white text-black hover:bg-white/90"
                            >
                              Apply filters
                            </Button>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
            </div>
            {!loading && (
              <p className="pl-1 text-xs text-white/40">
                {filtered.length} creator{filtered.length === 1 ? "" : "s"}
              </p>
            )}
          </m.section>

          {loading ? (
            <m.div
              variants={fadeUp}
              className="py-20 text-center text-white/55"
            >
              Loading creator marketplace...
            </m.div>
          ) : filtered.length === 0 ? (
            <m.div variants={fadeUp}>
              <Card className="border-white/10 bg-white/[0.04] backdrop-blur-2xl">
                <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
                  <div className="flex h-18 w-18 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]">
                    <SearchX className="h-8 w-8 text-white/42" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-semibold text-white">
                      No creators match this cut
                    </p>
                    <p className="max-w-md text-sm leading-6 text-white/58">
                      Reset the filters, widen the price range, or try a broader
                      niche to bring more creators back into the shortlist.
                    </p>
                  </div>
                  <Button
                    onClick={clearFilters}
                    className="h-11 rounded-full bg-white text-black hover:bg-white/90"
                  >
                    Clear all filters
                  </Button>
                </CardContent>
              </Card>
            </m.div>
          ) : (
            <m.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {filtered.map((profile) => {
                const engagementRate = getEngagementRate(
                  profile.avg_likes_per_reel,
                  profile.follower_count,
                );
                const startsAt = getStartsAtPrice(profile);
                const tier = getCreatorTier(profile.follower_count);
                const handle = profile.instagram_handle || profile.ig_username;

                return (
                  <m.div key={profile.id} variants={fadeUp}>
                    <Link href={`/dashboard/business/discover/${profile.id}`}>
                      <Card className="group relative cursor-pointer overflow-hidden rounded-[24px] border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-white/18 hover:shadow-[0_16px_48px_rgba(0,0,0,0.32)]">
                        <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(circle_at_top_left,rgba(145,226,255,0.10),transparent_55%)]" />
                        <CardContent className="relative p-4 sm:p-5">
                          {/* Single horizontal row — stacks on mobile */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">

                            {/* Identity */}
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <Avatar className="h-12 w-12 shrink-0 border border-white/10 bg-black/30">
                                <AvatarImage
                                  src={profile.ig_profile_picture_url ?? undefined}
                                  alt={profile.display_name || "Creator"}
                                />
                                <AvatarFallback className="bg-white/10 text-sm text-white">
                                  {getProfileInitials(profile.display_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 space-y-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-semibold tracking-tight text-white">
                                    {profile.display_name || "Creator"}
                                  </h3>
                                  <Badge className="rounded-full border border-cyan-300/20 bg-cyan-300/10 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
                                    {tier}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-white/45">
                                  {handle ? (
                                    <span className="inline-flex items-center gap-1 text-pink-200/65">
                                      <Instagram className="h-3 w-3" />@{handle}
                                    </span>
                                  ) : null}
                                  {profile.category ? <span>{profile.category}</span> : null}
                                  {profile.city ? (
                                    <span className="inline-flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />{profile.city}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex shrink-0 items-center gap-2">
                              <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-center">
                                <p className="text-xs font-semibold text-white">
                                  {compactNumber(profile.follower_count)}
                                </p>
                                <p className="text-[10px] text-white/38">followers</p>
                              </div>
                              <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2 text-center">
                                <p className="text-xs font-semibold text-white">
                                  {compactNumber(profile.avg_views_per_reel)}
                                </p>
                                <p className="text-[10px] text-white/38">avg views</p>
                              </div>
                              {engagementRate > 0 ? (
                                <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-2 text-center">
                                  <p className="text-xs font-semibold text-white">
                                    {engagementRate.toFixed(1)}%
                                  </p>
                                  <p className="text-[10px] text-emerald-300/55">engmt</p>
                                </div>
                              ) : null}
                            </div>

                            {/* Price + CTA */}
                            <div className="flex shrink-0 items-center gap-3 sm:ml-2">
                              {startsAt ? (
                                <div className="text-right">
                                  <p className="text-[10px] uppercase tracking-[0.14em] text-white/38">from</p>
                                  <p className="text-sm font-semibold text-cyan-200">
                                    ₹{compactNumber(startsAt)}
                                  </p>
                                </div>
                              ) : null}
                              <Button
                                size="sm"
                                className="h-9 shrink-0 rounded-full bg-white px-4 text-xs font-medium text-black hover:bg-white/90"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Profile
                              </Button>
                            </div>

                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </m.div>
                );
              })}
            </m.div>
          )}
        </m.div>
      </div>
    </div>
  );
}
