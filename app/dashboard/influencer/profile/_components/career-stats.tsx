"use client";

import { Briefcase, TrendingUp, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface CareerStatsProps {
  campaigns: Campaign[];
}

export default function CareerStats({ campaigns }: CareerStatsProps) {
  const completed = campaigns.filter((c) => c.status === "completed");

  if (completed.length === 0) return null;

  const totalEarned = completed.reduce(
    (sum, c) => sum + (c.price_offered || 0),
    0,
  );
  const avgDealSize =
    completed.length > 0 ? Math.round(totalEarned / completed.length) : 0;
  const uniqueBrands = new Set(completed.map((c) => c.business_id)).size;

  const stats = [
    {
      icon: Briefcase,
      value: completed.length.toString(),
      label: "Campaigns Done",
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: null,
      coinIcon: true,
      value: `\u20B9${totalEarned.toLocaleString()}`,
      label: "Total Earned",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: TrendingUp,
      value: `\u20B9${avgDealSize.toLocaleString()}`,
      label: "Avg Deal Size",
      gradient: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Building2,
      value: uniqueBrands.toString(),
      label: "Brands Worked With",
      gradient: "from-orange-500/20 to-amber-500/20",
      iconColor: "text-orange-400",
    },
  ];

  return (
    <motion.div variants={fadeUp}>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Career Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br",
                    stat.gradient,
                  )}
                >
                  {stat.coinIcon ? (
                    <img
                      src="/coin.png"
                      alt="coin"
                      className="h-3.5 w-3.5 object-contain"
                    />
                  ) : (
                    stat.icon && (
                      <stat.icon
                        className={cn("h-3.5 w-3.5", stat.iconColor)}
                      />
                    )
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {stat.label}
                </p>
              </div>
              <p className="text-lg font-extrabold tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
