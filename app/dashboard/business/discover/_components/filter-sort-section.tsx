"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiscoverFilters, SortDirection, SortField } from "./filter-types";

interface SortSelectorProps {
  sortField: SortField;
  sortDirection: SortDirection;
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
}

export function SortSelector({
  sortField,
  sortDirection,
  setDraftFilters,
}: SortSelectorProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="eyebrow-label text-[10px] text-white/35">Sort by</p>
        <div className="grid gap-3">
          {(
            [
              { value: "followers", label: "Followers" },
              { value: "price", label: "Price" },
              { value: "engagement", label: "Engagement" },
            ] as const
          ).map((option) => {
            const active = sortField === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    sortField: option.value as SortField,
                  }))
                }
                className={cn(
                  "flex items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-colors",
                  active
                    ? "border-white/20 bg-white/10"
                    : "border-white/10 bg-white/[0.035] hover:bg-white/6.5",
                )}
              >
                <span className="text-[15px] text-white">{option.label}</span>
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border",
                    active
                      ? "border-white bg-white text-black"
                      : "border-white/12 text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <p className="eyebrow-label text-[10px] text-white/35">Direction</p>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "desc", label: "High to low" },
              { value: "asc", label: "Low to high" },
            ] as const
          ).map((option) => {
            const active = sortDirection === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setDraftFilters((prev) => ({
                    ...prev,
                    sortDirection: option.value as SortDirection,
                  }))
                }
                className={cn(
                  "rounded-[22px] border px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/10 bg-white/[0.035] text-white/60 hover:bg-white/6.5 hover:text-white",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
