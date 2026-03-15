"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  X,
  Clock,
  IndianRupee,
  Inbox,
  Instagram,
  Loader2,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  FILTER_PILL_STYLE,
  FILTER_PILL_TRANSITION,
  stagger,
  fadeUp,
} from "@/lib/animations";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

const FILTERS = ["all", "pending", "accepted", "completed"] as const;
type Filter = (typeof FILTERS)[number];

const filterLabels: Record<Filter, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Active",
  completed: "Done",
};

const statusBorderColor: Record<string, string> = {
  pending: "border-l-yellow-500",
  accepted: "border-l-green-500",
  completed: "border-l-primary",
  rejected: "border-l-red-500",
};

export default function InfluencerDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [ip, setIp] = useState<InfluencerProfile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [ipRes, campRes] = await Promise.all([
          supabase
            .from("influencer_profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("campaigns")
            .select("*")
            .eq("influencer_id", user.id)
            .order("created_at", { ascending: false }),
        ]);
        if (ipRes.error) throw ipRes.error;
        if (campRes.error) throw campRes.error;
        setIp(ipRes.data);
        setCampaigns(campRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        toast({
          title: "Failed to load dashboard",
          description: "Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, toast]);

  const updateStatus = async (id: string, status: string) => {
    const campaign = campaigns.find((c) => c.id === id);
    const { error } = await supabase
      .from("campaigns")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    );
    toast({ title: `Campaign ${status}` });

    if (campaign) {
      const notifType =
        status === "accepted"
          ? "booking_accepted"
          : status === "rejected"
            ? "booking_rejected"
            : "booking_completed";
      await supabase.from("notifications").insert({
        user_id: campaign.business_id,
        type: notifType,
        data: { title: campaign.title || "Untitled", campaign_id: campaign.id },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // No influencer profile yet — show connect Instagram
  if (!ip) {
    return (
      <div className="container max-w-2xl py-12 space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-md p-8 text-center space-y-4">
          <Instagram className="mx-auto h-12 w-12 text-pink-500" />
          <h1 className="text-2xl font-bold">Welcome to ReelReach!</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Connect your Instagram to unlock your dashboard, get discovered by
            brands, and start earning.
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/dashboard/influencer/onboarding">
              Connect Instagram
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const pending = campaigns.filter((c) => c.status === "pending");
  const active = campaigns.filter((c) => c.status === "accepted");
  const completed = campaigns.filter((c) => c.status === "completed");
  const totalEarnings = [...active, ...completed].reduce(
    (sum, c) => sum + (c.price_offered || 0),
    0,
  );

  const filtered =
    filter === "all"
      ? campaigns.filter((c) => c.status !== "rejected")
      : campaigns.filter((c) => c.status === filter);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={180}
          breathingRange={8}
          animationSpeed={0.015}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10 container max-w-3xl py-6 space-y-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Profile Incomplete Banner */}
          {!ip.is_active && (
            <motion.div variants={fadeUp}>
              <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Your profile isn&apos;t visible to brands yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Complete your profile to start receiving bookings
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 border-0"
                    asChild
                  >
                    <Link href="/dashboard/influencer/complete-profile">
                      Complete Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hero Header */}
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hey, {ip.display_name || profile?.full_name || "Creator"}{" "}
              <span className="inline-block animate-[float_3s_ease-in-out_infinite]">
                ✨
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your bookings and earnings at a glance
            </p>
          </motion.div>

          {/* Stat Cards */}
          <motion.div variants={fadeUp} className="grid gap-3 grid-cols-3">
            {/* Earnings */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 mb-3">
                <IndianRupee className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-2xl font-extrabold tracking-tight">
                ₹{totalEarnings.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Total Earned
              </p>
            </div>

            {/* New Requests */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-3">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-extrabold tracking-tight">
                  {pending.length}
                </p>
                {pending.length > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                New Requests
              </p>
            </div>

            {/* Active Jobs */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 transition-all hover:border-white/20 hover:scale-[1.02]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 mb-3">
                <Briefcase className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold tracking-tight">
                {active.length}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Active Jobs
              </p>
            </div>
          </motion.div>

          {/* Filter Pills */}
          <motion.div variants={fadeUp} className="flex items-center gap-2">
            {FILTERS.map((f) => {
              const count =
                f === "all"
                  ? campaigns.filter((c) => c.status !== "rejected").length
                  : f === "pending"
                    ? pending.length
                    : f === "accepted"
                      ? active.length
                      : completed.length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium transition-all",
                    filter === f
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  {filter === f && (
                    <motion.div
                      layoutId="active-filter"
                      className="absolute inset-0 rounded-full"
                      style={FILTER_PILL_STYLE}
                      transition={FILTER_PILL_TRANSITION}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {filterLabels[f]}
                    {count > 0 && (
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                          filter === f ? "bg-white/20" : "bg-white/10",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </motion.div>

          {/* Campaign Feed */}
          <motion.div variants={fadeUp} className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center"
                >
                  <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 mb-4">
                    <Inbox className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="font-semibold">No campaigns here yet</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                    {ip.is_active
                      ? "Brands will send you booking requests once they discover your profile."
                      : "Complete your profile to appear in brand discovery and start receiving bookings."}
                  </p>
                  {!ip.is_active && (
                    <Button className="mt-4 rounded-xl" asChild>
                      <Link href="/dashboard/influencer/complete-profile">
                        Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </motion.div>
              ) : (
                filtered.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-5 transition-all hover:border-white/10 border-l-[3px]",
                      statusBorderColor[c.status] || "border-l-muted",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] px-2 py-0 h-5 rounded-full border",
                              c.status === "pending" &&
                                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                              c.status === "accepted" &&
                                "bg-green-500/10 text-green-400 border-green-500/20",
                              c.status === "completed" &&
                                "bg-primary/10 text-primary border-primary/20",
                            )}
                          >
                            {c.status === "accepted" ? "active" : c.status}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">
                            {timeAgo(c.created_at)}
                          </span>
                        </div>
                        <p className="font-semibold text-[15px] truncate">
                          {c.title || "Untitled Campaign"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {c.package_type || "—"} package
                        </p>
                      </div>
                      <p className="text-lg font-extrabold shrink-0">
                        ₹{c.price_offered?.toLocaleString() || "—"}
                      </p>
                    </div>

                    {/* Contact info for active campaigns */}
                    {c.status === "accepted" &&
                      (c.business_contact_email ||
                        c.business_contact_phone) && (
                        <div className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">
                            Brand contact:{" "}
                          </span>
                          {c.business_contact_email}
                          {c.business_contact_phone &&
                            ` · ${c.business_contact_phone}`}
                        </div>
                      )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {c.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            className="h-9 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 border-0 flex-1 sm:flex-none"
                            onClick={() => updateStatus(c.id, "accepted")}
                          >
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 rounded-xl border-white/10 flex-1 sm:flex-none"
                            onClick={() => updateStatus(c.id, "rejected")}
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" />
                            Decline
                          </Button>
                        </>
                      )}
                      {c.status === "accepted" && (
                        <Button
                          size="sm"
                          className="h-9 rounded-xl"
                          onClick={() => updateStatus(c.id, "completed")}
                        >
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 rounded-xl ml-auto text-muted-foreground"
                        asChild
                      >
                        <Link href={`/dashboard/influencer/campaigns/${c.id}`}>
                          Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>

          {/* Earnings Summary */}
          {completed.length > 0 && (
            <motion.div variants={fadeUp}>
              <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-5">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Earnings Summary
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-lg font-extrabold">
                      ₹{totalEarnings.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Total Earned
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold">{completed.length}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Completed
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold">
                      ₹
                      {completed.length > 0
                        ? Math.round(
                            completed.reduce(
                              (s, c) => s + (c.price_offered || 0),
                              0,
                            ) / completed.length,
                          ).toLocaleString()
                        : "0"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Avg Campaign
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
