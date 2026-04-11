"use client";

import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";

interface MilestoneCardProps {
  totalEarned: number;
  nextMilestone: number;
  milestoneProgress: number;
  bestMonth: { month: string; amount: number };
}

export function MilestoneCard({
  totalEarned,
  nextMilestone,
  milestoneProgress,
  bestMonth,
}: MilestoneCardProps) {
  const clampedProgress = Math.min(milestoneProgress, 100);
  const isAlmostThere = clampedProgress > 80;

  return (
    <m.div variants={fadeUp}>
      <div
        className={cn(
          "rounded-2xl border bg-card/60 backdrop-blur-md p-4 space-y-3 transition-shadow duration-500",
          isAlmostThere
            ? "border-amber-500/60 shadow-[0_0_20px_2px_rgba(251,191,36,0.15)]"
            : "border-white/10",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/trophy.png"
              alt="trophy"
              className="h-5 w-5 object-contain"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Next Milestone
            </p>
            {isAlmostThere && (
              <span className="text-[10px] text-amber-400 font-semibold">
                🔥 So close!
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-xs font-bold",
              isAlmostThere ? "text-amber-400" : "text-amber-400/70",
            )}
          >
            ₹{nextMilestone.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="relative h-3.5 w-full rounded-full bg-white/10 overflow-visible">
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <m.div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                initial={{ width: "0%" }}
                animate={{ width: `${clampedProgress}%` }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
              />
            </div>
            {/* Pulsing dot at progress end */}
            {clampedProgress > 2 && (
              <m.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.6)] z-10"
                style={{ left: `calc(${clampedProgress}% - 10px)` }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  ease: "easeInOut",
                  delay: 1.9,
                }}
              />
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>₹{totalEarned.toLocaleString("en-IN")} earned</span>
            <span>
              ₹{(nextMilestone - totalEarned).toLocaleString("en-IN")} to go
            </span>
          </div>
        </div>

        {bestMonth.amount > 0 && (
          <p className="text-[11px] text-muted-foreground border-t border-white/5 pt-2.5">
            🏅 Best month:{" "}
            <span className="font-semibold text-foreground/80">
              ₹{bestMonth.amount.toLocaleString("en-IN")}
            </span>{" "}
            in {bestMonth.month}
          </p>
        )}
      </div>
    </m.div>
  );
}
