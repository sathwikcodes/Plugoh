"use client";

import { CheckCircle2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";

export type BadgeDef = {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  earned: boolean;
  earnedGradient: string;
  earnedBorder: string;
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

        <div
          className="flex gap-3 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={cn(
                "relative flex-shrink-0 flex flex-col items-center gap-1.5 w-[64px]",
                !badge.earned && "opacity-40",
              )}
            >
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl border bg-gradient-to-br flex items-center justify-center text-2xl relative",
                  badge.earned
                    ? cn(badge.earnedGradient, badge.earnedBorder)
                    : "from-white/5 to-white/5 border-white/10",
                )}
              >
                {badge.earned ? (
                  <>
                    <span>{badge.emoji}</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                    </div>
                  </>
                ) : (
                  <img
                    src="/lock.png"
                    alt="locked"
                    className="h-5 w-5 object-contain opacity-50"
                  />
                )}
              </div>
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
