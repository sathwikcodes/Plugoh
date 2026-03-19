"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Inbox, Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import {
  FILTER_PILL_STYLE,
  FILTER_PILL_TRANSITION,
  stagger,
  fadeUp,
} from "@/lib/animations";

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

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: campaigns = [], isLoading: loading } = useCampaigns(
    user?.id,
    "influencer",
  );
  const [filter, setFilter] = useState<Filter>("all");

  const statusMutation = useMutation(
    trpc.campaign.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["campaign"] });
        queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        queryClient.invalidateQueries({
          queryKey: ["business-inbox-conversations"],
        });
        toast({ title: "Campaign updated" });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const updateStatus = (id: string, status: string) => {
    statusMutation.mutate({
      campaignId: id,
      status: status as "accepted" | "rejected" | "completed",
    });
  };

  const { pending, active, completed, filtered } = useMemo(() => {
    const p: typeof campaigns = [];
    const a: typeof campaigns = [];
    const comp: typeof campaigns = [];
    const f: typeof campaigns = [];

    for (const c of campaigns) {
      if (c.status === "pending") p.push(c);
      else if (c.status === "accepted") a.push(c);
      else if (c.status === "completed") comp.push(c);

      if (filter === "all" ? c.status !== "rejected" : c.status === filter) {
        f.push(c);
      }
    }

    return { pending: p, active: a, completed: comp, filtered: f };
  }, [campaigns, filter]);

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
          <h1 className="text-2xl font-extrabold tracking-tight">Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pending.length > 0
              ? `${pending.length} pending request${pending.length > 1 ? "s" : ""}`
              : "Manage your brand collaborations"}
          </p>
        </motion.div>

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
                    layoutId="campaign-filter"
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
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-linear-to-br from-pink-500/10 to-purple-500/10 mb-4">
                  <Inbox className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold">No campaigns here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "all"
                    ? "Brands will send you booking requests once they discover your profile."
                    : `No ${filterLabels[filter].toLowerCase()} campaigns.`}
                </p>
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

                  {c.status === "accepted" &&
                    (c.business_contact_email || c.business_contact_phone) && (
                      <div className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          Brand contact:{" "}
                        </span>
                        {c.business_contact_email}
                        {c.business_contact_phone &&
                          ` · ${c.business_contact_phone}`}
                      </div>
                    )}

                  <div className="flex items-center gap-2 mt-4">
                    {c.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-9 rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:brightness-110 border-0 flex-1 sm:flex-none"
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
      </motion.div>
    </div>
  );
}
