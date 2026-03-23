"use client";

import { AwardBadge, type AwardBadgeType } from "@/components/ui/award-badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { TIERS } from "@/lib/constants";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";

type Tier = (typeof TIERS)[number];

const TIER_BADGE_MAP: Record<string, { type: AwardBadgeType; place?: number }> =
  {
    "Rising Star": { type: "product-of-the-week", place: 3 },
    Creator: { type: "product-of-the-week", place: 1 },
    "Pro Creator": { type: "product-of-the-month", place: 2 },
    "Elite Creator": { type: "product-of-the-day", place: 1 },
    "Top Creator": { type: "golden-kitty" },
  };

interface TierHeroCardProps {
  tier: Tier;
  nextTier: Tier | null;
  totalEarned: number;
  tierProgress: number;
  tierGap: number;
}

export function TierHeroCard({
  tier,
  nextTier,
  totalEarned,
  tierProgress,
  tierGap,
}: TierHeroCardProps) {
  return (
    <m.div variants={fadeUp}>
      <div
        className={cn(
          "relative rounded-2xl border bg-gradient-to-br p-5 overflow-hidden",
          tier.borderClass,
          tier.bgClass,
        )}
      >
        {/* ambient glow */}
        <div
          className={cn(
            "absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl bg-gradient-to-br",
            tier.fromClass,
            tier.toClass,
          )}
        />

        <div className="relative flex items-start gap-4">
          <img
            src={tier.emoji}
            alt="tier icon"
            className="flex-shrink-0 w-16 h-16 object-contain drop-shadow-md select-none"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <AwardBadge
                type={TIER_BADGE_MAP[tier.name].type}
                place={TIER_BADGE_MAP[tier.name].place}
              />
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">
                  Total Earned
                </p>
                <p className="text-2xl font-extrabold tracking-tight">
                  ₹<AnimatedNumber value={totalEarned} />
                </p>
              </div>
            </div>

            {nextTier ? (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Progress to {nextTier.name}</span>
                  <span>{Math.round(tierProgress)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <m.div
                    className={cn(
                      "h-full rounded-full bg-gradient-to-r",
                      tier.barClass,
                    )}
                    initial={{ width: "0%" }}
                    animate={{ width: `${tierProgress}%` }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: 0.4,
                    }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  ₹{tierGap.toLocaleString("en-IN")} more to unlock{" "}
                  <span className={cn("font-semibold", nextTier.textClass)}>
                    {nextTier.name}
                  </span>
                </p>
              </div>
            ) : (
              <p className={cn("mt-2 text-sm font-semibold", tier.textClass)}>
                👑 Legend status. You&apos;ve reached the top.
              </p>
            )}
          </div>
        </div>
      </div>
    </m.div>
  );
}
