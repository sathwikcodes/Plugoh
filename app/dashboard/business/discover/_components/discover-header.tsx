"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { m } from "framer-motion";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface DiscoverHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onOpenFilters: () => void;
  activeFilterCount: number;
}

export function DiscoverHeader({
  search,
  onSearchChange,
  onOpenFilters,
  activeFilterCount,
}: DiscoverHeaderProps) {
  return (
    <>
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

      <m.section variants={fadeUp} className="shrink-0 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search"
              className="h-12 rounded-full border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/35"
            />
          </div>

          <button
            type="button"
            onClick={onOpenFilters}
            className={cn(
              "relative flex h-12 w-12 shrink-0 items-center justify-center overflow-visible rounded-full border text-sm font-medium text-white backdrop-blur-md transition-all duration-200 sm:w-auto sm:gap-2 sm:px-5",
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
            {activeFilterCount > 0 ? (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 translate-x-[28%] -translate-y-[28%] items-center justify-center rounded-full border border-[#0F1115]/70 bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground shadow-[0_8px_20px_rgba(229,185,74,0.28)] ring-2 ring-[#151922] sm:hidden">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>
      </m.section>
    </>
  );
}
