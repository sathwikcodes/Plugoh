"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import {
  fadeUp,
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
} from "@/lib/animations";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/lib/supabase/types";
import { InfluencerCard } from "./_components/influencer-card";
import { InfluencerCardStack } from "./_components/influencer-card-stack";
import { FilterPanel, type DiscoverFilters } from "./_components/filter-panel";
import { getStartsAtPrice } from "./_components/influencer-card";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

function getSortValue(
  profile: InfluencerProfile,
  sortField: DiscoverFilters["sortField"],
): number {
  if (sortField === "price") return getStartsAtPrice(profile) ?? 0;
  if (sortField === "engagement")
    return getEngagementRate(
      profile.avg_likes_per_reel,
      profile.follower_count,
    );
  return profile.follower_count ?? 0;
}

function getDefaultPriceBounds(
  profiles: InfluencerProfile[],
): [number, number] {
  const prices = profiles
    .map((profile) => getStartsAtPrice(profile))
    .filter((price): price is number => typeof price === "number" && price > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) return [500, 50000];

  const min = Math.max(500, Math.floor(prices[0] / 500) * 500);
  const rawMax = prices[prices.length - 1];
  const paddedMax = rawMax < 10000 ? rawMax + 2000 : rawMax * 1.1;
  const max = Math.ceil(paddedMax / 500) * 500;

  return [min, Math.max(min + 500, max)];
}

function createDefaultFilters(priceBounds: [number, number]): DiscoverFilters {
  return {
    place: "All",
    category: "All",
    contentType: "All",
    priceRange: priceBounds,
    sortField: "followers",
    sortDirection: "desc",
  };
}

function applyFilters(
  profiles: InfluencerProfile[],
  search: string,
  filters: DiscoverFilters,
  priceBounds: [number, number],
) {
  const normalizedSearch = search.trim().toLowerCase();

  return profiles
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

      if (filters.category !== "All" && profile.category !== filters.category) {
        return false;
      }

      if (filters.place !== "All" && profile.city !== filters.place) {
        return false;
      }

      const startsAt = getStartsAtPrice(profile);
      const isBudgetDefault =
        filters.priceRange[0] === priceBounds[0] &&
        filters.priceRange[1] === priceBounds[1];
      if (startsAt != null) {
        if (
          startsAt < filters.priceRange[0] ||
          startsAt > filters.priceRange[1]
        ) {
          return false;
        }
      } else if (!isBudgetDefault) {
        return false;
      }

      if (
        filters.contentType !== "All" &&
        !(profile.content_types as string[] | null)?.includes(
          filters.contentType,
        )
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const delta =
        getSortValue(a, filters.sortField) - getSortValue(b, filters.sortField);
      return filters.sortDirection === "asc" ? delta : -delta;
    });
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="aspect-3/4 w-full animate-pulse rounded-[24px] border border-white/8 bg-white/4" />
  );
}

export default function InfluencerDiscovery() {
  const { data: profiles = [], isLoading: loading } = useInfluencerProfiles();
  const isMobile = useIsMobile();

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const priceBounds = useMemo(
    () => getDefaultPriceBounds(profiles),
    [profiles],
  );
  const [activeFilters, setActiveFilters] = useState<DiscoverFilters>(() =>
    createDefaultFilters(priceBounds),
  );
  const [draftFilters, setDraftFilters] = useState<DiscoverFilters>(() =>
    createDefaultFilters(priceBounds),
  );
  const previousBoundsRef = useRef(priceBounds);

  useEffect(() => {
    const previousBounds = previousBoundsRef.current;
    previousBoundsRef.current = priceBounds;

    const previousDefaults = createDefaultFilters(previousBounds);
    const nextDefaults = createDefaultFilters(priceBounds);

    setActiveFilters((prev) => {
      const priceWasDefault =
        prev.priceRange[0] === previousDefaults.priceRange[0] &&
        prev.priceRange[1] === previousDefaults.priceRange[1];
      return priceWasDefault
        ? { ...prev, priceRange: nextDefaults.priceRange }
        : prev;
    });
    setDraftFilters((prev) => {
      const priceWasDefault =
        prev.priceRange[0] === previousDefaults.priceRange[0] &&
        prev.priceRange[1] === previousDefaults.priceRange[1];
      if (priceWasDefault) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }

      const activePrice = prev.priceRange;
      if (
        activePrice[0] < priceBounds[0] ||
        activePrice[1] > priceBounds[1] ||
        activePrice[0] >= activePrice[1]
      ) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }
      return prev;
    });
  }, [priceBounds]);

  const placeOptions = useMemo(
    () =>
      [
        ...new Set(
          profiles.map((profile) => profile.city?.trim()).filter(Boolean),
        ),
      ].sort((a, b) => String(a).localeCompare(String(b))) as string[],
    [profiles],
  );

  const categoryOptions = useMemo(
    () =>
      [
        ...new Set(
          profiles.map((profile) => profile.category?.trim()).filter(Boolean),
        ),
      ].sort((a, b) => String(a).localeCompare(String(b))) as string[],
    [profiles],
  );

  const contentTypeOptions = useMemo(
    () =>
      [
        ...new Set(
          profiles.flatMap((profile) =>
            ((profile.content_types as string[] | null) ?? []).filter(Boolean),
          ),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [profiles],
  );

  const filtered = useMemo(
    () => applyFilters(profiles, deferredSearch, activeFilters, priceBounds),
    [profiles, deferredSearch, activeFilters, priceBounds],
  );

  const previewFiltered = useMemo(
    () => applyFilters(profiles, deferredSearch, draftFilters, priceBounds),
    [profiles, deferredSearch, draftFilters, priceBounds],
  );

  const activeFilterCount = [
    activeFilters.place !== "All",
    activeFilters.category !== "All",
    activeFilters.contentType !== "All",
    activeFilters.priceRange[0] !== priceBounds[0] ||
      activeFilters.priceRange[1] !== priceBounds[1],
  ].filter(Boolean).length;

  const draftFilterCount = [
    draftFilters.place !== "All",
    draftFilters.category !== "All",
    draftFilters.contentType !== "All",
    draftFilters.priceRange[0] !== priceBounds[0] ||
      draftFilters.priceRange[1] !== priceBounds[1],
  ].filter(Boolean).length;

  const clearFilters = () => {
    const defaults = createDefaultFilters(priceBounds);
    setActiveFilters(defaults);
    setDraftFilters(defaults);
  };

  const openFilterPanel = () => {
    setDraftFilters(activeFilters);
    setFilterPanelOpen(true);
  };

  const mobileViewportHeight = "100dvh";
  const mobileBottomInset = "calc(96px + env(safe-area-inset-bottom, 0px))";

  return (
    <>
      <div
        className="relative overflow-hidden md:min-h-[calc(100dvh-4rem)]"
        style={
          isMobile
            ? {
                height: mobileViewportHeight,
                minHeight: mobileViewportHeight,
              }
            : undefined
        }
      >
        {/* Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden md:absolute">
          <AnimatedGradientBackground
            Breathing
            gradientColors={GRADIENT_COLORS}
            gradientStops={GRADIENT_STOPS}
            startingGap={180}
            breathingRange={8}
            animationSpeed={0.015}
            containerStyle={GRADIENT_STYLE}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff0a,transparent_38%),linear-gradient(180deg,#0F1115_0%,#0F1115_42%,#0F1115_100%)]" />
          <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#20B8A814_0%,transparent_100%)]" />
        </div>

        <div
          className="relative z-10 container h-full py-4 md:h-auto md:py-6"
          style={isMobile ? { paddingBottom: mobileBottomInset } : undefined}
        >
          <m.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex h-full flex-col gap-3 md:h-auto md:gap-6"
          >
            {/* Header */}
            <m.div
              variants={fadeUp}
              className="shrink-0 flex items-center justify-center gap-3 md:justify-start"
            >
              <div className="min-w-0 flex flex-col justify-center text-center md:text-left">
                <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                  Discover{" "}
                  <span className="heading-mix-accent text-4xl text-white/90">
                    Influencers
                  </span>
                </h1>
              </div>
            </m.div>

            {/* Search + Filter bar */}
            <m.section variants={fadeUp} className="shrink-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-12 rounded-full border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/35"
                  />
                </div>

                <button
                  type="button"
                  onClick={openFilterPanel}
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-medium text-white backdrop-blur-md transition-all duration-200 sm:w-auto sm:gap-2 sm:px-5",
                    activeFilterCount > 0
                      ? "border-white/25 bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                      : "border-primary/20 bg-primary/[0.07] shadow-[0_12px_32px_rgba(15,17,21,0.35)] hover:bg-primary/10",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    Filter
                    {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
                  </span>
                </button>
              </div>
            </m.section>

            {/* Results */}
            {loading ? (
              <>
                {/* Desktop skeleton */}
                <m.div
                  variants={fadeUp}
                  className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6"
                >
                  {[0, 1, 2].map((i) => (
                    <SkeletonCard key={i} />
                  ))}
                </m.div>
                {/* Mobile skeleton */}
                <m.div
                  variants={fadeUp}
                  className="flex flex-1 items-center justify-center md:hidden"
                >
                  <div className="w-full max-w-[min(85vw,21rem)]">
                    <SkeletonCard />
                  </div>
                </m.div>
              </>
            ) : filtered.length === 0 ? (
              <m.div
                variants={fadeUp}
                className="flex flex-1 items-center md:block"
              >
                <Card className="border-white/10 bg-white/4 backdrop-blur-2xl">
                  <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
                    <div className="flex h-18 w-18 items-center justify-center rounded-full border border-white/10 bg-white/6">
                      <SearchX className="h-8 w-8 text-white/42" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-semibold text-white">
                        No creators match this cut
                      </p>
                      <p className="max-w-md text-sm leading-6 text-white/58">
                        Reset the filters, widen the price range, or try a
                        broader niche to bring more creators back into the
                        shortlist.
                      </p>
                    </div>
                    <Button
                      onClick={clearFilters}
                      className="h-11 rounded-full bg-white text-black hover:bg-white/90"
                    >
                      Clear filters
                    </Button>
                  </CardContent>
                </Card>
              </m.div>
            ) : (
              <>
                {/* Desktop: 3-column grid */}
                <m.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6"
                >
                  {filtered.map((profile) => (
                    <m.div key={profile.id} variants={fadeUp}>
                      <InfluencerCard profile={profile} />
                    </m.div>
                  ))}
                </m.div>

                {/* Mobile: card stack */}
                <m.div
                  variants={fadeUp}
                  className="flex flex-col min-h-0 flex-1 md:hidden"
                >
                  <InfluencerCardStack
                    profiles={filtered}
                    className="w-full flex-1"
                  />
                </m.div>
              </>
            )}
          </m.div>
        </div>
      </div>

      {/* Filter panel (portal-like, outside the scrollable container) */}
      <FilterPanel
        open={filterPanelOpen}
        onClose={() => setFilterPanelOpen(false)}
        onApply={() => setActiveFilters(draftFilters)}
        onClearAll={clearFilters}
        draftFilters={draftFilters}
        setDraftFilters={(updater) => setDraftFilters((prev) => updater(prev))}
        placeOptions={placeOptions}
        categoryOptions={categoryOptions}
        contentTypeOptions={contentTypeOptions}
        priceBounds={priceBounds}
        resultCount={previewFiltered.length}
        filterCount={draftFilterCount}
      />
    </>
  );
}
