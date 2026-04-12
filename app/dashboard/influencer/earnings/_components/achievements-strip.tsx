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

// Maps earnedBorder class → glow rgba color
const BADGE_GLOW: Record<string, string> = {
  "border-sky-500/30": "rgba(14,165,233,0.4)",
  "border-green-500/30": "rgba(34,197,94,0.4)",
  "border-amber-500/30": "rgba(245,158,11,0.4)",
  "border-[#FF7A59]/30": "rgba(255,122,89,0.4)",
  "border-violet-500/30": "rgba(139,92,246,0.4)",
  "border-teal-500/30": "rgba(20,184,166,0.4)",
  "border-orange-500/30": "rgba(249,115,22,0.4)",
  "border-red-500/30": "rgba(239,68,68,0.4)",
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
          className="flex gap-3 overflow-x-auto pt-2 pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {badges.map((badge) => {
            const glowColor = BADGE_GLOW[badge.earnedBorder];
            return (
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
                  style={
                    badge.earned && glowColor
                      ? { boxShadow: `inset 0 0 14px 3px ${glowColor}` }
                      : undefined
                  }
                >
                  {badge.earned ? (
                    <>
                      <span>{badge.emoji}</span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                      </div>
                    </>
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
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
            );
          })}
        </div>
      </div>
    </m.div>
  );
}
