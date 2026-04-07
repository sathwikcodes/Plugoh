"use client";

import { Star } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";

export type MonthlyDataPoint = {
  month: string;
  amount: number;
};

interface EarningsChartProps {
  monthlyData: MonthlyDataPoint[];
  maxMonthlyAmount: number;
  peakMonthIdx: number;
  avgPerCampaign: number;
}

export function EarningsChart({
  monthlyData,
  maxMonthlyAmount,
  peakMonthIdx,
  avgPerCampaign,
}: EarningsChartProps) {
  return (
    <m.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Last 6 Months
          </p>
          <p className="text-xs text-muted-foreground">
            Avg ₹{avgPerCampaign.toLocaleString("en-IN")}/campaign
          </p>
        </div>

        <div className="flex items-end justify-between gap-2 h-32">
          {monthlyData.map((m, i) => {
            const isPeak = i === peakMonthIdx && m.amount > 0;
            return (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                {isPeak ? (
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                ) : (
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {m.amount > 0
                      ? `₹${m.amount >= 1000 ? `${(m.amount / 1000).toFixed(1)}K` : m.amount}`
                      : ""}
                  </span>
                )}
                <div
                  className={cn(
                    "w-full rounded-t-lg transition-all",
                    m.amount > 0
                      ? isPeak
                        ? "bg-gradient-to-t from-amber-500/80 to-yellow-400/60"
                        : "bg-gradient-to-t from-primary/80 to-primary/40"
                      : "bg-white/5",
                  )}
                  style={{
                    height: `${Math.max((m.amount / maxMonthlyAmount) * 100, 4)}%`,
                    minHeight: "4px",
                  }}
                />
                <span
                  className={cn(
                    "text-[10px]",
                    isPeak
                      ? "text-amber-400 font-semibold"
                      : "text-muted-foreground",
                  )}
                >
                  {m.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </m.div>
  );
}
