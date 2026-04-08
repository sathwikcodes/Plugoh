"use client";

import type { DiscoverFilters } from "./filter-types";
import { formatPriceFull } from "./filter-types";

interface PriceRangePickerProps {
  priceRange: [number, number];
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
  bounds: [number, number];
}

export function PriceRangePicker({
  priceRange,
  setDraftFilters,
  bounds,
}: PriceRangePickerProps) {
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
