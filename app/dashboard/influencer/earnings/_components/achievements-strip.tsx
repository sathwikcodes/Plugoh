"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";
import { ThreeDPill } from "@/components/ui/3d-pill";
import type { PillPreset } from "@/components/ui/3d-pill";

export type BadgeDef = {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  earned: boolean;
  earnedGradient: string;
  earnedBorder: string;
  pillPreset: PillPreset;
};

interface AchievementsStripProps {
  badges: BadgeDef[];
}

export function AchievementsStrip({ badges }: AchievementsStripProps) {
  const earnedBadgeCount = badges.filter((b) => b.earned).length;

  return (
    <m.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Achievements
          </p>
          <p className="text-[11px] text-muted-foreground">
            {earnedBadgeCount}/{badges.length} unlocked
          </p>
        </div>

        {/* Horizontal scroll strip — same layout as original */}
        <div
          className="flex gap-3 overflow-x-auto pt-2 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "relative flex-shrink-0 flex flex-col items-center gap-1.5 w-[70px]",
                !badge.earned && "opacity-40",
              )}
            >
              {/* 3D badge pill — 56×56 rounded-square, emoji only, label below */}
              <ThreeDPill
                label={badge.label}
                color={badge.earned ? badge.pillPreset : "slate"}
                icon={
                  <span
                    className="text-[30px] leading-none select-none"
                    aria-hidden="true"
                  >
                    {badge.emoji}
                  </span>
                }
                className="three-d-pill--badge"
                title={badge.desc}
              />

              {/* Label below the tile, exactly as before */}
              <p className="text-[9px] text-center text-muted-foreground leading-tight font-medium line-clamp-2">
                {badge.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </m.div>
  );
}
