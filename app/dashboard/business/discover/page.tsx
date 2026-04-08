"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { m } from "framer-motion";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
} from "@/lib/animations";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import { useIsMobile } from "@/hooks/use-mobile";
import { FilterPanel, type DiscoverFilters } from "./_components/filter-panel";
import { DiscoverHeader } from "./_components/discover-header";
import { InfluencerGrid } from "./_components/influencer-grid";
import {
  applyFilters,
  createDefaultFilters,
  getDefaultPriceBounds,
} from "./_components/discover-utils";

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

  const [prevBoundsMin, setPrevBoundsMin] = useState(priceBounds[0]);
  const [prevBoundsMax, setPrevBoundsMax] = useState(priceBounds[1]);
  const [boundsMin, boundsMax] = priceBounds;

  if (prevBoundsMin !== boundsMin || prevBoundsMax !== boundsMax) {
    const previousDefaults = createDefaultFilters([
      prevBoundsMin,
      prevBoundsMax,
    ]);
    const nextDefaults = createDefaultFilters([boundsMin, boundsMax]);

    setPrevBoundsMin(boundsMin);
    setPrevBoundsMax(boundsMax);
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
      if (
        prev.priceRange[0] < boundsMin ||
        prev.priceRange[1] > boundsMax ||
        prev.priceRange[0] >= prev.priceRange[1]
      ) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }
      return prev;
    });
  }

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
        className="relative overflow-hidden min-h-dvh"
        style={
          isMobile
            ? {
                height: mobileViewportHeight,
                minHeight: mobileViewportHeight,
              }
            : undefined
        }
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden md:absolute">
          <AnimatedGradientBackground
            Breathing
            gradientColors={GRADIENT_COLORS}
            gradientStops={GRADIENT_STOPS}
            startingGap={125}
            breathingRange={2.2}
            animationSpeed={0.008}
            containerStyle={GRADIENT_STYLE}
          />
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
            <DiscoverHeader
              search={search}
              onSearchChange={setSearch}
              onOpenFilters={openFilterPanel}
              activeFilterCount={activeFilterCount}
            />
            <InfluencerGrid
              loading={loading}
              filtered={filtered}
              onClearFilters={clearFilters}
            />
          </m.div>
        </div>
      </div>

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
