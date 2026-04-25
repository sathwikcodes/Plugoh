"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { m } from "framer-motion";
import { stagger } from "@/lib/animations";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
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

  const previousBoundsRef = useRef<[number, number]>(priceBounds);

  useEffect(() => {
    const [boundsMin, boundsMax] = priceBounds;
    const [prevBoundsMin, prevBoundsMax] = previousBoundsRef.current;

    if (prevBoundsMin === boundsMin && prevBoundsMax === boundsMax) {
      return;
    }

    const previousDefaults = createDefaultFilters([
      prevBoundsMin,
      prevBoundsMax,
    ]);
    const nextDefaults = createDefaultFilters([boundsMin, boundsMax]);

    setActiveFilters((prev) => {
      const priceWasDefault =
        prev.priceRange[0] === previousDefaults.priceRange[0] &&
        prev.priceRange[1] === previousDefaults.priceRange[1];

      if (priceWasDefault) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }

      const nextMin = Math.max(boundsMin, prev.priceRange[0]);
      const nextMax = Math.min(boundsMax, prev.priceRange[1]);
      if (nextMin > nextMax) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }

      if (nextMin !== prev.priceRange[0] || nextMax !== prev.priceRange[1]) {
        return { ...prev, priceRange: [nextMin, nextMax] };
      }

      return prev;
    });

    setDraftFilters((prev) => {
      const priceWasDefault =
        prev.priceRange[0] === previousDefaults.priceRange[0] &&
        prev.priceRange[1] === previousDefaults.priceRange[1];

      if (priceWasDefault) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }

      const nextMin = Math.max(boundsMin, prev.priceRange[0]);
      const nextMax = Math.min(boundsMax, prev.priceRange[1]);
      if (nextMin > nextMax) {
        return { ...prev, priceRange: nextDefaults.priceRange };
      }

      if (nextMin !== prev.priceRange[0] || nextMax !== prev.priceRange[1]) {
        return { ...prev, priceRange: [nextMin, nextMax] };
      }

      return prev;
    });

    previousBoundsRef.current = priceBounds;
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
    activeFilters.priceRange[0] !== priceBounds[0] ||
      activeFilters.priceRange[1] !== priceBounds[1],
    activeFilters.sortField !== "followers",
    activeFilters.sortDirection !== "desc",
  ].filter(Boolean).length;

  const draftFilterCount = [
    draftFilters.place !== "All",
    draftFilters.category !== "All",
    draftFilters.priceRange[0] !== priceBounds[0] ||
      draftFilters.priceRange[1] !== priceBounds[1],
    draftFilters.sortField !== "followers",
    draftFilters.sortDirection !== "desc",
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

  return (
    <>
      <div className="relative overflow-hidden h-dvh md:min-h-dvh md:h-auto">
        <div className="relative z-10 container h-full py-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:h-auto md:py-6 md:pb-6">
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
        priceBounds={priceBounds}
        resultCount={previewFiltered.length}
        filterCount={draftFilterCount}
      />
    </>
  );
}
