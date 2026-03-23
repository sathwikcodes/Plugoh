"use client";

import { useMemo } from "react";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import {
  Briefcase,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  Building2,
  MapPin,
  Phone,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface OverviewTabProps {
  profile: Profile;
  campaigns: Campaign[];
  onNavigateToSettings: () => void;
}

interface StrengthItem {
  label: string;
  done: boolean;
  field: string;
}

export default function BusinessOverviewTab({
  profile,
  campaigns,
  onNavigateToSettings,
}: OverviewTabProps) {
  // Profile strength items
  const strengthItems = useMemo<StrengthItem[]>(
    () => [
      {
        label: "Business name",
        done: !!profile.business_name,
        field: "business_name",
      },
      {
        label: "Business type",
        done: !!profile.business_type,
        field: "business_type",
      },
      { label: "Location", done: !!profile.location, field: "location" },
      { label: "Phone number", done: !!profile.phone, field: "phone" },
    ],
    [profile],
  );

  const completedItems = strengthItems.filter((i) => i.done).length;
  const completeness = Math.round(
    (completedItems / strengthItems.length) * 100,
  );
  const isComplete = completeness === 100;

  // Campaign stats
  const stats = useMemo(() => {
    const total = campaigns.length;
    const completed = campaigns.filter((c) => c.status === "completed");
    const totalSpent = completed.reduce(
      (s, c) => s + (c.price_offered || 0),
      0,
    );
    const avgValue =
      completed.length > 0 ? Math.round(totalSpent / completed.length) : 0;
    const accepted = campaigns.filter(
      (c) => c.status === "accepted" || c.status === "completed",
    ).length;
    const nonRejected = campaigns.filter((c) => c.status !== "rejected").length;
    const acceptanceRate =
      nonRejected > 0 ? Math.round((accepted / nonRejected) * 100) : 0;

    return {
      total,
      completed: completed.length,
      totalSpent,
      avgValue,
      acceptanceRate,
    };
  }, [campaigns]);

  const ringColor =
    completeness >= 80
      ? "text-green-500"
      : completeness >= 50
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      {/* Profile Strength */}
      <m.div variants={fadeUp}>
        {isComplete ? (
          <div className="flex items-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/5 backdrop-blur-md px-4 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-green-400">
              Profile complete
            </span>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
            <div className="flex items-center gap-5">
              {/* Circular progress ring */}
              <div className="relative shrink-0">
                <svg width="72" height="72" viewBox="0 0 72 72">
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    className="text-white/5"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 30}`}
                    strokeDashoffset={`${2 * Math.PI * 30 * (1 - completeness / 100)}`}
                    className={cn(ringColor, "transition-all duration-700")}
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-extrabold">
                    {completeness}%
                  </span>
                </div>
              </div>

              {/* Missing items */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Profile Strength
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {strengthItems
                    .filter((item) => !item.done)
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.field}
                        onClick={onNavigateToSettings}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                          completeness >= 50
                            ? "bg-yellow-500/10 hover:brightness-125"
                            : "bg-red-500/10 hover:brightness-125",
                        )}
                      >
                        {item.label}
                        <ArrowRight className="h-3 w-3 opacity-50" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </m.div>

      {/* Career Stats */}
      {stats.total > 0 && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Brand Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Total Campaigns
                  </p>
                </div>
                <p className="text-lg font-extrabold">{stats.total}</p>
              </div>

              <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Completed</p>
                </div>
                <p className="text-lg font-extrabold">{stats.completed}</p>
              </div>

              <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                    <IndianRupee className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Total Spent
                  </p>
                </div>
                <p className="text-lg font-extrabold">
                  ₹{stats.totalSpent.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20">
                    <TrendingUp className="h-3.5 w-3.5 text-orange-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Acceptance Rate
                  </p>
                </div>
                <p className="text-lg font-extrabold">
                  {stats.acceptanceRate}%
                </p>
              </div>
            </div>
          </div>
        </m.div>
      )}

      {/* Business Details */}
      {(profile.business_type || profile.location || profile.phone) && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Business Details
            </p>
            <div className="space-y-2.5">
              {profile.business_type && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Business Type
                    </p>
                    <p className="text-sm font-medium">
                      {profile.business_type}
                    </p>
                  </div>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Location
                    </p>
                    <p className="text-sm font-medium">{profile.location}</p>
                  </div>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Phone</p>
                    <p className="text-sm font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </m.div>
      )}
    </m.div>
  );
}
