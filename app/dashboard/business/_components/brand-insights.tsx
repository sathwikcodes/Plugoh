"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface BrandInsightItem {
  icon: LucideIcon;
  title: string;
  detail: string;
  color: string;
}

interface BrandInsightsProps {
  insights: BrandInsightItem[];
}

export function BrandInsights({ insights }: BrandInsightsProps) {
  if (insights.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold">Brand Insights</h2>
      <div className="grid gap-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 flex items-start gap-4"
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                insight.color,
              )}
            >
              <insight.icon className="h-5 w-5 text-white/80" />
            </div>
            <div>
              <p className="text-sm font-semibold">{insight.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {insight.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
