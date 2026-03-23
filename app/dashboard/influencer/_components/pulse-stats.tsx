"use client";

import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { Zap, Users, Sparkles } from "lucide-react";

export interface PulseStatsData {
  engagementRate: number;
  engagementColor: string;
  engagementBg: string;
  totalReach: number;
  contentScore: number;
}

interface PulseStatsProps {
  stats: PulseStatsData;
  hasMedia: boolean;
}

export function PulseStats({ stats, hasMedia }: PulseStatsProps) {
  return (
    <div className="grid gap-3 grid-cols-3">
      {/* Engagement Rate */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br mb-3",
            stats.engagementBg,
          )}
        >
          <Zap className={cn("h-4 w-4", stats.engagementColor)} />
        </div>
        <p
          className={cn(
            "text-2xl font-extrabold tracking-tight",
            stats.engagementColor,
          )}
        >
          {stats.engagementRate > 0
            ? stats.engagementRate.toFixed(1) + "%"
            : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Engagement Rate
        </p>
      </div>

      {/* Total Reach */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 mb-3">
          <Users className="h-4 w-4 text-blue-400" />
        </div>
        <p className="text-2xl font-extrabold tracking-tight">
          {stats.totalReach > 0 ? compactNumber(stats.totalReach) : "—"}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Total Reach</p>
      </div>

      {/* Content Score */}
      <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 mb-3">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <p className="text-2xl font-extrabold tracking-tight">
          {hasMedia ? (
            <>
              {stats.contentScore}
              <span className="text-sm font-medium text-muted-foreground">
                /100
              </span>
            </>
          ) : (
            "—"
          )}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Content Score
        </p>
        {hasMedia && (
          <div className="h-1 w-full rounded-full bg-white/10 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-1000"
              style={{ width: `${stats.contentScore}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
