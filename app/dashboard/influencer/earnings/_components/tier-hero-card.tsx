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

// Maps tier name → its brand color hex for the shimmer gradient
const TIER_SHIMMER_COLOR: Record<string, string> = {
  "Rising Star": "#34d399",   // emerald-400
  Creator: "#60a5fa",          // blue-400
  "Pro Creator": "#fbbf24",    // amber-400
  "Elite Creator": "#a78bfa",  // violet-400
  "Top Creator": "#facc15",    // yellow-400
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
  const shimmerColor = TIER_SHIMMER_COLOR[tier.name] ?? "#ffffff";

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
            <div className="flex items-center justify-between gap-6">
              <div className="max-w-[150px] sm:max-w-[240px]">
                <AwardBadge
                  type={TIER_BADGE_MAP[tier.name].type}
                  place={TIER_BADGE_MAP[tier.name].place}
                />
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground">Total Earned</p>
                <p
                  className="text-3xl font-black tracking-tight"
                  style={{
                    background: `linear-gradient(90deg, ${shimmerColor} 20%, #ffffff 50%, ${shimmerColor} 80%)`,
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    animation: "shimmer 2.4s ease-in-out infinite",
                  }}
                >
                  ₹<AnimatedNumber value={totalEarned} />
                </p>
              </div>
            </div>

            {nextTier ? (
              <div className="mt-3 space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
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
