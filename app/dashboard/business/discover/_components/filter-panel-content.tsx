"use client";

import { ArrowLeft, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiscoverFilters, FilterStep } from "./filter-types";
import { summarizePrice } from "./filter-types";
import { OptionList } from "./option-list";
import { SortSelector } from "./filter-sort-section";
import { PriceRangePicker } from "./filter-price-range";

const STEP_TITLES: Record<FilterStep, string> = {
  root: "Filter",
  place: "Place",
  category: "Category",
  price: "Price range",
  sort: "Sort",
};

function FilterRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[26px] border border-white/10 bg-white/4 px-5 py-4 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/6.5"
    >
      <span className="text-[1rem] font-medium text-white">{label}</span>
      <span className="flex items-center gap-3">
        <span className="text-sm text-white/60">{value}</span>
        <ChevronRight className="h-4 w-4 text-white/45" />
      </span>
    </button>
  );
}

export interface FilterPanelContentProps {
  step: FilterStep;
  setStep: (step: FilterStep) => void;
  handleDismiss: () => void;
  isMobile: boolean;
  draftFilters: DiscoverFilters;
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
  placeOptions: string[];
  categoryOptions: string[];
  priceBounds: [number, number];
  resultCount: number;
  filterCount: number;
  onApply: () => void;
  onClose: () => void;
  onClearAll: () => void;
}

export function FilterPanelContent({
  step,
  setStep,
  handleDismiss,
  isMobile,
  draftFilters,
  setDraftFilters,
  placeOptions,
  categoryOptions,
  priceBounds,
  resultCount,
  filterCount,
  onApply,
  onClose,
  onClearAll,
}: FilterPanelContentProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {isMobile ? (
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1.5 w-22 rounded-full bg-white/14" />
        </div>
      ) : null}

      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2.5">
          {step !== "root" ? (
            <button
              type="button"
              onClick={() => setStep("root")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/6 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <SlidersHorizontal className="h-4 w-4 text-white/45" />
          )}
          <span className="text-[15px] font-semibold text-white">
            {STEP_TITLES[step]}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (step !== "root") setStep("root");
            else handleDismiss();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/6 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5"
        style={{
          paddingBottom: isMobile
            ? "calc(env(safe-area-inset-bottom, 0px) + 120px)"
            : "88px",
        }}
      >
        {step === "root" ? (
          <div className="space-y-4 pb-6">
            <FilterRow
              label="Place"
              value={
                draftFilters.place === "All" ? "All places" : draftFilters.place
              }
              onClick={() => setStep("place")}
            />
            <FilterRow
              label="Category"
              value={
                draftFilters.category === "All"
                  ? "All categories"
                  : draftFilters.category
              }
              onClick={() => setStep("category")}
            />
            <FilterRow
              label="Price"
              value={summarizePrice(draftFilters.priceRange, priceBounds)}
              onClick={() => setStep("price")}
            />
            <FilterRow
              label="Sort"
              value={
                draftFilters.sortField === "followers"
                  ? `Followers · ${draftFilters.sortDirection === "desc" ? "High to low" : "Low to high"}`
                  : draftFilters.sortField === "price"
                    ? `Price · ${draftFilters.sortDirection === "desc" ? "High to low" : "Low to high"}`
                    : `Engagement · ${draftFilters.sortDirection === "desc" ? "High to low" : "Low to high"}`
              }
              onClick={() => setStep("sort")}
            />
          </div>
        ) : step === "place" ? (
          <OptionList
            options={placeOptions}
            selected={draftFilters.place}
            allLabel="All places"
            onSelect={(value) => {
              setDraftFilters((prev) => ({ ...prev, place: value }));
              setStep("root");
            }}
          />
        ) : step === "category" ? (
          <OptionList
            options={categoryOptions}
            selected={draftFilters.category}
            allLabel="All categories"
            onSelect={(value) => {
              setDraftFilters((prev) => ({ ...prev, category: value }));
              setStep("root");
            }}
          />
        ) : step === "price" ? (
          <PriceRangePicker
            priceRange={draftFilters.priceRange}
            setDraftFilters={setDraftFilters}
            bounds={priceBounds}
          />
        ) : (
          <SortSelector
            sortField={draftFilters.sortField}
            sortDirection={draftFilters.sortDirection}
            setDraftFilters={setDraftFilters}
          />
        )}
      </div>

      <div
        className="shrink-0 border-t border-white/8 bg-[#141414]/96 px-5 py-4 backdrop-blur-xl"
        style={{
          paddingBottom: isMobile
            ? "calc(env(safe-area-inset-bottom, 0px) + 28px)"
            : undefined,
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClearAll}
            className="h-12 rounded-full border-white/12 bg-white/4 text-[15px] font-medium text-white hover:bg-white/8"
          >
            Clear
            {filterCount > 0 ? ` (${filterCount})` : ""}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="h-12 rounded-full bg-white text-[15px] font-medium text-black hover:bg-white/90"
          >
            Show [{resultCount}]
          </Button>
        </div>
      </div>
    </div>
  );
}
