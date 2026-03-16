"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Loader2,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { stagger, fadeUp } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default function EarningsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [businessProfiles, setBusinessProfiles] = useState<
    Map<string, Profile>
  >(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .select("*")
          .eq("influencer_id", user.id)
          .in("status", ["accepted", "completed"])
          .order("updated_at", { ascending: false });
        if (error) throw error;

        const camps = data || [];
        setCampaigns(camps);

        const bids = [...new Set(camps.map((c) => c.business_id))];
        if (bids.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", bids);
          setBusinessProfiles(new Map((profiles || []).map((p) => [p.id, p])));
        }
      } catch (err) {
        console.error("Failed to load earnings:", err);
        toast({
          title: "Failed to load earnings",
          description: "Please try refreshing.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const {
    completed,
    active,
    totalEarned,
    pendingEarnings,
    avgPerCampaign,
    thisMonthEarnings,
    lastMonthEarnings,
    monthChange,
    monthlyData,
    maxMonthlyAmount,
  } = useMemo(() => {
    const comp = campaigns.filter((c) => c.status === "completed");
    const act = campaigns.filter((c) => c.status === "accepted");
    const earned = comp.reduce((s, c) => s + (c.price_offered || 0), 0);
    const pending = act.reduce((s, c) => s + (c.price_offered || 0), 0);
    const avg = comp.length > 0 ? Math.round(earned / comp.length) : 0;

    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const thisMe = comp
      .filter((c) => {
        const d = new Date(c.updated_at || c.created_at);
        return d.getMonth() === curMonth && d.getFullYear() === curYear;
      })
      .reduce((s, c) => s + (c.price_offered || 0), 0);

    const lastDate = new Date(curYear, curMonth - 1, 1);
    const lastMe = comp
      .filter((c) => {
        const d = new Date(c.updated_at || c.created_at);
        return (
          d.getMonth() === lastDate.getMonth() &&
          d.getFullYear() === lastDate.getFullYear()
        );
      })
      .reduce((s, c) => s + (c.price_offered || 0), 0);

    const change =
      lastMe > 0
        ? Math.round(((thisMe - lastMe) / lastMe) * 100)
        : thisMe > 0
          ? 100
          : 0;

    const monthly: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const monthName = d.toLocaleDateString("en", { month: "short" });
      const me = comp
        .filter((c) => {
          const cd = new Date(c.updated_at || c.created_at);
          return (
            cd.getMonth() === d.getMonth() &&
            cd.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, c) => s + (c.price_offered || 0), 0);
      monthly.push({ month: monthName, amount: me });
    }
    const maxAmount = Math.max(...monthly.map((m) => m.amount), 1);

    return {
      completed: comp,
      active: act,
      totalEarned: earned,
      pendingEarnings: pending,
      avgPerCampaign: avg,
      thisMonthEarnings: thisMe,
      lastMonthEarnings: lastMe,
      monthChange: change,
      monthlyData: monthly,
      maxMonthlyAmount: maxAmount,
    };
  }, [campaigns]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-extrabold tracking-tight">Earnings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your income from brand collaborations
          </p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total Earned
                </p>
                <p className="text-4xl font-extrabold tracking-tight mt-1">
                  ₹{totalEarned.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-green-500/20 to-emerald-500/20">
                <Wallet className="h-6 w-6 text-green-400" />
              </div>
            </div>
            {(thisMonthEarnings > 0 || lastMonthEarnings > 0) && (
              <div className="flex items-center gap-2 text-sm">
                {monthChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-400" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    monthChange >= 0 ? "text-green-400" : "text-red-400",
                  )}
                >
                  {monthChange >= 0 ? "+" : ""}
                  {monthChange}%
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid gap-3 grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 mb-3">
              <IndianRupee className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              ₹{thisMonthEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              This Month
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-yellow-500/20 to-orange-500/20 mb-3">
              <ArrowUpRight className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              ₹{pendingEarnings.toLocaleString()}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-purple-500/20 to-violet-500/20 mb-3">
              <Briefcase className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              {completed.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Completed
            </p>
          </div>
        </motion.div>

        {completed.length > 0 && (
          <motion.div variants={fadeUp}>
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last 6 Months
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg ₹{avgPerCampaign.toLocaleString()}/campaign
                </p>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {monthlyData.map((m) => (
                  <div
                    key={m.month}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {m.amount > 0
                        ? `₹${m.amount >= 1000 ? `${(m.amount / 1000).toFixed(1)}K` : m.amount}`
                        : ""}
                    </span>
                    <div
                      className={cn(
                        "w-full rounded-t-lg transition-all",
                        m.amount > 0
                          ? "bg-linear-to-t from-pink-500/80 to-purple-500/60"
                          : "bg-white/5",
                      )}
                      style={{
                        height: `${Math.max((m.amount / maxMonthlyAmount) * 100, 4)}%`,
                        minHeight: "4px",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {m.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transaction History
            </p>
            {completed.length === 0 && active.length === 0 ? (
              <div className="py-8 text-center">
                <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No transactions yet. Complete campaigns to see your earnings
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...completed, ...active].map((c) => {
                  const bp = businessProfiles.get(c.business_id);
                  const brandName =
                    bp?.business_name || bp?.full_name || "Brand";
                  const isCompleted = c.status === "completed";
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          isCompleted ? "bg-green-500/10" : "bg-yellow-500/10",
                        )}
                      >
                        <IndianRupee
                          className={cn(
                            "h-4 w-4",
                            isCompleted ? "text-green-400" : "text-yellow-400",
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {c.title || "Untitled Campaign"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {brandName} &middot; {c.package_type || "—"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">
                          ₹{(c.price_offered || 0).toLocaleString()}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 rounded-full border",
                            isCompleted
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                          )}
                        >
                          {isCompleted ? "earned" : "pending"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
