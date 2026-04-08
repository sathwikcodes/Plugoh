"use client";

import { cn } from "@/lib/utils";
import { IndianRupee, Briefcase, TrendingUp, CheckCircle } from "lucide-react";
import { compactNumber } from "@/lib/format";

export interface SpendStatsData {
  totalSpent: number;
  activeCampaigns: number;
  acceptanceRate: number;
  avgCampaignValue: number;
  acceptanceColor: string;
  acceptanceBg: string;
}

interface SpendStatsProps {
  stats: SpendStatsData;
  hasCampaigns: boolean;
}

export function SpendStats({ stats, hasCampaigns }: SpendStatsProps) {
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-3">
          <IndianRupee className="h-4 w-4 text-green-400" />
        </div>
        <p className="text-2xl font-extrabold tracking-tight text-green-400">
          {hasCampaigns && stats.totalSpent > 0
            ? `₹${compactNumber(stats.totalSpent)}`
            : "₹0"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Total Spent</p>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 mb-3">
          <Briefcase className="h-4 w-4 text-blue-400" />
        </div>
        <p className="text-2xl font-extrabold tracking-tight">
          {stats.activeCampaigns}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Active Campaigns
        </p>
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br mb-3",
            stats.acceptanceBg,
          )}
        >
          <CheckCircle className={cn("h-4 w-4", stats.acceptanceColor)} />
        </div>
        <p
          className={cn(
            "text-2xl font-extrabold tracking-tight",
            stats.acceptanceColor,
          )}
        >
          {hasCampaigns ? `${stats.acceptanceRate}%` : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Acceptance Rate
        </p>
        {hasCampaigns && (
          <div className="h-1 w-full rounded-full bg-white/10 mt-2 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                stats.acceptanceRate >= 70
                  ? "bg-gradient-to-r from-green-500 to-emerald-400"
                  : stats.acceptanceRate >= 40
                    ? "bg-gradient-to-r from-yellow-500 to-orange-400"
                    : "bg-gradient-to-r from-red-500 to-rose-400",
              )}
              style={{ width: `${stats.acceptanceRate}%` }}
            />
          </div>
        )}
      </div>

      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-3">
          <TrendingUp className="h-4 w-4 text-violet-400" />
        </div>
        <p className="text-2xl font-extrabold tracking-tight">
          {hasCampaigns && stats.avgCampaignValue > 0
            ? `₹${compactNumber(stats.avgCampaignValue)}`
            : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Avg Campaign</p>
      </div>
    </div>
  );
}
