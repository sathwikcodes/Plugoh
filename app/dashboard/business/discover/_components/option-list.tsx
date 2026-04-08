"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptionListProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  allLabel: string;
}

export function OptionList({
  options,
  selected,
  onSelect,
  allLabel,
}: OptionListProps) {
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
