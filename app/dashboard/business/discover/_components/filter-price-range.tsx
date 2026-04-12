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
  const actualRange = Math.max(boundMax - boundMin, 0);
  const step = actualRange >= 500 ? 500 : Math.max(actualRange, 1);
  const minGap = actualRange >= 500 ? 500 : actualRange;
  const range = Math.max(actualRange, 1);
  const minPercent = ((minValue - boundMin) / range) * 100;
  const maxPercent = ((maxValue - boundMin) / range) * 100;

  const commitMin = (value: number) => {
    setDraftFilters((prev) => {
      const maxAllowed = prev.priceRange[1] - minGap;
      const nextMin = Math.max(boundMin, Math.min(value, maxAllowed));
      return { ...prev, priceRange: [nextMin, prev.priceRange[1]] };
    });
  };

  const commitMax = (value: number) => {
    setDraftFilters((prev) => {
      const minAllowed = prev.priceRange[0] + minGap;
      const nextMax = Math.min(boundMax, Math.max(value, minAllowed));
      return { ...prev, priceRange: [prev.priceRange[0], nextMax] };
    });
  };

  return (
    <div className="rounded-[28px] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02))] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.2)] sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Price range</h3>
          <p className="mt-0.5 text-xs text-white/55">
            Max available {formatPriceFull(boundMax)}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setDraftFilters((prev) => ({ ...prev, priceRange: bounds }))
          }
          className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          Reset
        </button>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/8 bg-black/20 px-3 py-5 sm:px-4 sm:py-6">
        <div className="relative h-14">
          <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/12" />
          <div
            className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300 shadow-[0_0_24px_rgba(110,231,183,0.35)]"
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
            max={boundMax - minGap}
            step={step}
            value={minValue}
            onChange={(e) => commitMin(Number(e.target.value))}
            className="range-thumb pointer-events-auto absolute inset-x-0 top-1/2 h-10 w-full -translate-y-1/2 appearance-none bg-transparent"
          />
          <input
            type="range"
            min={boundMin + minGap}
            max={boundMax}
            step={step}
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

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
              Min
            </p>
            <p className="mt-1 text-[1.05rem] font-semibold text-white sm:text-[1.15rem]">
              {formatPriceFull(minValue)}
            </p>
          </div>
          <span className="hidden text-lg font-medium text-white/55 sm:block">
            -
          </span>
          <div className="rounded-[20px] border border-white/10 bg-white/[0.045] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.08em] text-white/45">
              Max
            </p>
            <p className="mt-1 text-[1.05rem] font-semibold text-white sm:text-[1.15rem]">
              {formatPriceFull(maxValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
