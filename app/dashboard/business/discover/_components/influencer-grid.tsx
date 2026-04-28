"use client";

import { m } from "framer-motion";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, stagger } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";
import { InfluencerCard } from "./influencer-card";
import { InfluencerCardStack } from "./influencer-card-stack";
import {
  InfluencerCardSkeleton,
  MobileDiscoverStackSkeleton,
} from "../loading";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface InfluencerGridProps {
  loading: boolean;
  filtered: InfluencerProfile[];
  onClearFilters: () => void;
}

export function InfluencerGrid({
  loading,
  filtered,
  onClearFilters,
}: InfluencerGridProps) {
  if (loading) {
    return (
      <>
        <m.div
          key="desktop-skeleton"
          variants={fadeUp}
          className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6"
        >
          {[0, 1, 2].map((i) => (
            <InfluencerCardSkeleton key={i} />
          ))}
        </m.div>
        <m.div
          key="mobile-skeleton"
          variants={fadeUp}
          className="flex min-h-0 flex-1 md:hidden"
        >
          <MobileDiscoverStackSkeleton />
        </m.div>
      </>
    );
  }

  if (filtered.length === 0) {
    return (
      <m.div variants={fadeUp} className="flex flex-1 items-center md:block">
        <Card className="border-white/10 bg-white/4 backdrop-blur-2xl">
          <CardContent className="flex flex-col items-center gap-5 py-16 text-center">
            <div className="flex h-18 w-18 items-center justify-center rounded-full border border-white/10 bg-white/6">
              <SearchX className="h-8 w-8 text-white/42" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-white">
                No influencers match this cut
              </p>
              <p className="max-w-md text-sm leading-6 text-white/58">
                Reset the filters, widen the price range, or try a broader niche
                to bring more influencers back into the shortlist.
              </p>
            </div>
            <Button
              onClick={onClearFilters}
              className="h-11 rounded-full bg-white text-black hover:bg-white/90"
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      </m.div>
    );
  }

  return (
    <>
      <m.div
        key="desktop-grid"
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

      <m.div
        key="mobile-grid"
        variants={fadeUp}
        className="flex min-h-0 flex-1 md:hidden"
      >
        <InfluencerCardStack profiles={filtered} className="h-full w-full" />
      </m.div>
    </>
  );
}
