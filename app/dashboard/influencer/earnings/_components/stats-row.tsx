"use client";

import { AnimatedNumber } from "@/components/ui/animated-number";
import { TrendingUp, TrendingDown } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";

interface StatsRowProps {
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  monthChange: number;
  pendingEarnings: number;
  completedCount: number;
}

export function StatsRow({
  thisMonthEarnings,
  lastMonthEarnings,
  monthChange,
  pendingEarnings,
  completedCount,
}: StatsRowProps) {
  const hasChange = thisMonthEarnings > 0 || lastMonthEarnings > 0;
  const isPositive = monthChange >= 0;

  const changePillClasses = cn(
    "flex items-center gap-1 text-[10px] font-semibold",
    isPositive ? "text-green-400" : "text-red-400",
  );

  const changeContent = (
    <>
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {isPositive ? "+" : ""}
      {monthChange}%
    </>
  );

  return (
    <m.div variants={fadeUp} className="flex flex-col gap-3 sm:grid sm:grid-cols-3">
      {/* This Month — hero on mobile, normal on sm+ */}
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 flex items-center justify-between sm:flex-col sm:items-start sm:justify-start">
        <div className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-0">
          <img
            src="/coin.png"
            alt="coin"
            className="h-9 w-9 object-contain sm:mb-3"
          />
          <div>
            <p className="text-3xl font-black tracking-tight sm:text-xl">
              ₹<AnimatedNumber value={thisMonthEarnings} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">This Month</p>
            {/* Desktop: inline pill below label */}
            {hasChange && (
              <div className={cn("hidden sm:flex mt-1", changePillClasses)}>
                {changeContent}
              </div>
            )}
          </div>
        </div>
        {/* Mobile only: pill floats right */}
        {hasChange && (
          <div
            className={cn(
              "sm:hidden flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border",
              isPositive
                ? "text-green-400 bg-green-500/10 border-green-500/20"
                : "text-red-400 bg-red-500/10 border-red-500/20",
            )}
          >
            {changeContent}
          </div>
        )}
      </div>

      {/* Pending + Completed — 2-col row on mobile, normal cols on sm+ */}
      <div className="grid grid-cols-2 gap-3 sm:contents">
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
          <img
            src="/clock.png"
            alt="pending"
            className="h-9 w-9 object-contain mb-3"
          />
          <p className="text-xl font-extrabold tracking-tight">
            ₹<AnimatedNumber value={pendingEarnings} />
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Pending</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
          <img
            src="/premium_target.png"
            alt="completed"
            className="h-9 w-9 object-contain mb-3"
          />
          <p className="text-xl font-extrabold tracking-tight">
            {completedCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Completed</p>
        </div>
      </div>
    </m.div>
  );
}
