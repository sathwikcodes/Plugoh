"use client";

import { Briefcase, TrendingUp, Building2, Clock } from "lucide-react";
import { m } from "framer-motion";
import { fadeUp, stagger } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface CareerTabProps {
  campaigns: Campaign[];
  showSkeleton?: boolean;
}

export default function CareerTab({ campaigns, showSkeleton }: CareerTabProps) {
  if (showSkeleton) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-lg" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const nonRejected = campaigns.filter((c) => c.status !== "rejected");
  const completed = campaigns.filter((c) => c.status === "completed");
  const pending = campaigns.filter((c) => c.status === "pending");
  const totalEarned = completed.reduce(
    (sum, c) => sum + (c.price_offered ?? 0),
    0,
  );
  const uniqueBrands = new Set(
    completed.map((c) => c.business_id).filter(Boolean),
  ).size;

  if (nonRejected.length === 0) {
    return (
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-8 flex flex-col items-center text-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
            <Briefcase className="h-6 w-6 text-blue-400" />
          </div>
          <p className="font-semibold text-sm">No campaigns yet</p>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Your campaign stats will appear here once you complete your first
            brand collaboration.
          </p>
        </div>
      </m.div>
    );
  }

  const stats = [
    {
      icon: Briefcase,
      value: nonRejected.length.toString(),
      label: "Total Campaigns",
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: TrendingUp,
      value: completed.length.toString(),
      label: "Completed",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: Clock,
      value: pending.length.toString(),
      label: "Pending Offers",
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-400",
    },
    {
      icon: Building2,
      value: uniqueBrands.toString(),
      label: "Brands Worked With",
      gradient: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-400",
    },
  ];

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <m.div variants={fadeUp}>
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
                    <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
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
      </m.div>

      {totalEarned > 0 && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Total Earned
              </p>
              <p className="text-2xl font-black tracking-tight mt-0.5">
                ₹{totalEarned.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/20">
              <img
                src="/coin.png"
                alt="earnings"
                className="h-6 w-6 object-contain"
              />
            </div>
          </div>
        </m.div>
      )}
    </m.div>
  );
}
