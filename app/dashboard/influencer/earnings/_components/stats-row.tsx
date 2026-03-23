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
  return (
    <m.div variants={fadeUp} className="grid gap-3 grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
        <img
          src="/coin.png"
          alt="coin"
          className="h-9 w-9 object-contain mb-3"
        />
        <p className="text-xl font-extrabold tracking-tight">
          ₹<AnimatedNumber value={thisMonthEarnings} />
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">This Month</p>
        {(thisMonthEarnings > 0 || lastMonthEarnings > 0) && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 text-[10px] font-medium",
              monthChange >= 0 ? "text-green-400" : "text-red-400",
            )}
          >
            {monthChange >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {monthChange >= 0 ? "+" : ""}
            {monthChange}%
          </div>
        )}
      </div>

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
    </m.div>
  );
}
