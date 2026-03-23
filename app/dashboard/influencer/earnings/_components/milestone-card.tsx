"use client";

import { m } from "framer-motion";
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
  return (
    <m.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 space-y-3">
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
          </div>
          <p className="text-xs font-bold text-amber-400">
            ₹{nextMilestone.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
            <m.div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
              initial={{ width: "0%" }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
            />
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
