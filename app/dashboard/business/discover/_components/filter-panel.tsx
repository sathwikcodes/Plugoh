"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  Check,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export type SortField = "followers" | "price" | "engagement";
export type SortDirection = "desc" | "asc";

export interface DiscoverFilters {
  place: string;
  category: string;
  contentType: string;
  priceRange: [number, number];
  sortField: SortField;
  sortDirection: SortDirection;
}

type FilterStep =
  | "root"
  | "place"
  | "category"
  | "contentType"
  | "price"
  | "sort";

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onClearAll: () => void;
  draftFilters: DiscoverFilters;
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
  placeOptions: string[];
  categoryOptions: string[];
  contentTypeOptions: string[];
  priceBounds: [number, number];
  resultCount: number;
  filterCount: number;
}

const DESKTOP_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 36,
};

const MOBILE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 34,
};

function formatPriceShort(value: number) {
  if (value >= 100000) return `₹${Math.round(value / 1000)}k`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
}

function formatPriceFull(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function summarizePrice(
  [min, max]: [number, number],
  bounds: [number, number],
) {
  if (min === bounds[0] && max === bounds[1]) return "Any budget";
  return `${formatPriceShort(min)} - ${formatPriceShort(max)}`;
}

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
      className="flex w-full items-center justify-between rounded-[26px] border border-white/10 bg-white/[0.04] px-5 py-4 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/[0.065]"
    >
      <span className="text-[1rem] font-medium text-white">{label}</span>
      <span className="flex items-center gap-3">
        <span className="text-sm text-white/60">{value}</span>
        <ChevronRight className="h-4 w-4 text-white/45" />
      </span>
    </button>
  );
}

function OptionList({
  options,
  selected,
  onSelect,
  allLabel,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  allLabel: string;
}) {
  const items = useMemo(() => ["All", ...options], [options]);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const active = selected === item;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={cn(
              "flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-colors",
              active
                ? "border-white/20 bg-white/[0.1]"
                : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]",
            )}
          >
            <span className="text-[15px] text-white">
              {item === "All" ? allLabel : item}
            </span>
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
  );
}

function SortSelector({
  sortField,
  sortDirection,
  setDraftFilters,
}: {
  sortField: SortField;
  sortDirection: SortDirection;
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="eyebrow-label text-[10px] text-white/35">Sort by</p>
        <div className="grid gap-3">
          {[
            { value: "followers", label: "Followers" },
            { value: "price", label: "Price" },
            { value: "engagement", label: "Engagement" },
          ].map((option) => {
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
                    ? "border-white/20 bg-white/[0.1]"
                    : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]",
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
          {[
            { value: "desc", label: "High to low" },
            { value: "asc", label: "Low to high" },
          ].map((option) => {
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
                    ? "border-white/20 bg-white/[0.1] text-white"
                    : "border-white/10 bg-white/[0.035] text-white/60 hover:bg-white/[0.065] hover:text-white",
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

function PriceRangePicker({
  priceRange,
  setDraftFilters,
  bounds,
}: {
  priceRange: [number, number];
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
  bounds: [number, number];
}) {
  const [minValue, maxValue] = priceRange;
  const [boundMin, boundMax] = bounds;
  const range = Math.max(boundMax - boundMin, 1);
  const minPercent = ((minValue - boundMin) / range) * 100;
  const maxPercent = ((maxValue - boundMin) / range) * 100;

  const commitMin = (value: number) => {
    setDraftFilters((prev) => {
      const nextMin = Math.min(value, prev.priceRange[1] - 500);
      return { ...prev, priceRange: [nextMin, prev.priceRange[1]] };
    });
  };

  const commitMax = (value: number) => {
    setDraftFilters((prev) => {
      const nextMax = Math.max(value, prev.priceRange[0] + 500);
      return { ...prev, priceRange: [prev.priceRange[0], nextMax] };
    });
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_18px_36px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Price range</h3>
        <button
          type="button"
          onClick={() =>
            setDraftFilters((prev) => ({ ...prev, priceRange: bounds }))
          }
          className="text-xs text-white/50 transition-colors hover:text-white/75"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/6 bg-black/20 px-4 py-6">
        <div className="relative h-14">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/12" />
          <div
            className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.35)]"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          <div
            className="absolute left-0 right-0 top-[8px] h-7 rounded-full bg-[radial-gradient(circle_at_35%_50%,rgba(110,231,183,0.9),rgba(110,231,183,0.38)_40%,transparent_68%)] opacity-75"
            style={{
              clipPath: `inset(0 ${100 - maxPercent}% 0 ${minPercent}%)`,
            }}
          />

          <input
            type="range"
            min={boundMin}
            max={boundMax - 500}
            step={500}
            value={minValue}
            onChange={(e) => commitMin(Number(e.target.value))}
            className="range-thumb pointer-events-auto absolute inset-x-0 top-1/2 h-10 w-full -translate-y-1/2 appearance-none bg-transparent"
          />
          <input
            type="range"
            min={boundMin + 500}
            max={boundMax}
            step={500}
            value={maxValue}
            onChange={(e) => commitMax(Number(e.target.value))}
            className="range-thumb pointer-events-auto absolute inset-x-0 top-1/2 h-10 w-full -translate-y-1/2 appearance-none bg-transparent"
          />

          <div
            className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-white shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
            style={{ left: `${minPercent}%` }}
          />
          <div
            className="pointer-events-none absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-black bg-white shadow-[0_6px_14px_rgba(0,0,0,0.22)]"
            style={{ left: `${maxPercent}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3">
            <p className="text-[11px] text-white/40">Min</p>
            <p className="mt-1 text-[1.15rem] font-medium text-white">
              {formatPriceFull(minValue)}
            </p>
          </div>
          <span className="text-lg font-medium text-white/55">-</span>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3">
            <p className="text-[11px] text-white/40">Max</p>
            <p className="mt-1 text-[1.15rem] font-medium text-white">
              {formatPriceFull(maxValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FilterPanel({
  open,
  onClose,
  onApply,
  onClearAll,
  draftFilters,
  setDraftFilters,
  placeOptions,
  categoryOptions,
  contentTypeOptions,
  priceBounds,
  resultCount,
  filterCount,
}: FilterPanelProps) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<FilterStep>("root");
  const handleDismiss = useCallback(() => {
    setStep("root");
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (open && isMobile) {
      document.body.dataset.mobileDockHidden = "true";
    } else {
      delete document.body.dataset.mobileDockHidden;
    }

    return () => {
      delete document.body.dataset.mobileDockHidden;
    };
  }, [isMobile, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        if (step !== "root") setStep("root");
        else handleDismiss();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDismiss, open, step]);

  const title =
    step === "root"
      ? "Filter"
      : step === "place"
        ? "Place"
        : step === "category"
          ? "Category"
          : step === "contentType"
            ? "Content type"
            : step === "price"
              ? "Price range"
              : "Sort";

  const content = (
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
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <SlidersHorizontal className="h-4 w-4 text-white/45" />
          )}
          <span className="text-[15px] font-semibold text-white">{title}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (step !== "root") setStep("root");
            else handleDismiss();
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
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
              label="Content type"
              value={
                draftFilters.contentType === "All"
                  ? "All content"
                  : draftFilters.contentType
              }
              onClick={() => setStep("contentType")}
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
        ) : step === "contentType" ? (
          <OptionList
            options={contentTypeOptions}
            selected={draftFilters.contentType}
            allLabel="All content"
            onSelect={(value) => {
              setDraftFilters((prev) => ({ ...prev, contentType: value }));
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

        <div className={cn("h-6", isMobile && "h-24")} />
      </div>

      <div
        className="shrink-0 border-t border-white/8 bg-[#151922]/96 px-5 py-4 backdrop-blur-xl"
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
            className="h-12 rounded-full border-white/12 bg-white/[0.04] text-[15px] font-medium text-white hover:bg-white/[0.08]"
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
            Show {resultCount}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open ? (
        <>
          <m.div
            key="filter-backdrop"
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleDismiss}
          />

          {isMobile ? (
            <m.div
              key="filter-sheet-mobile"
              ref={panelRef}
              className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[32px] border-t border-white/10 bg-[#151922] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)]"
              style={{ height: "min(88dvh, 760px)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={MOBILE_SPRING}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (step === "root" && info.offset.y > 90) handleDismiss();
              }}
            >
              {content}
            </m.div>
          ) : (
            <m.div
              key="filter-panel-desktop"
              ref={panelRef}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[420px] flex-col border-l border-white/10 bg-[#151922] text-white shadow-[-28px_0_90px_rgba(0,0,0,0.5)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={DESKTOP_SPRING}
            >
              {content}
            </m.div>
          )}
        </>
      ) : null}
    </AnimatePresence>
  );
}
