"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import { brandDisplayAmountFromCampaign } from "@/lib/brand-pricing";
import type { Database } from "@/lib/supabase/types";
import { SpendingTransactionRow } from "./spending-transaction-row";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

type FilterValue = "all" | "completed" | "pending" | "accepted";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "completed", label: "Paid" },
  { value: "accepted", label: "Active" },
  { value: "pending", label: "Pending" },
];

interface SpendingTabProps {
  campaigns: Campaign[];
  influencerProfiles: InfluencerProfile[];
}

export default function SpendingTab({
  campaigns,
  influencerProfiles,
}: SpendingTabProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const ipMap = useMemo(
    () => new Map(influencerProfiles.map((ip) => [ip.id, ip])),
    [influencerProfiles],
  );

  const summary = useMemo(() => {
    const paidCampaigns = campaigns.filter((c) => c.status === "completed");
    const pendingCampaigns = campaigns.filter(
      (c) => c.status === "pending" || c.status === "accepted",
    );
    const totalPaid = paidCampaigns.reduce(
      (s, c) => s + brandDisplayAmountFromCampaign(c),
      0,
    );
    const totalPending = pendingCampaigns.reduce(
      (s, c) => s + brandDisplayAmountFromCampaign(c),
      0,
    );
    const avgPerCampaign =
      paidCampaigns.length > 0
        ? Math.round(totalPaid / paidCampaigns.length)
        : 0;
    return { totalPaid, totalPending, avgPerCampaign };
  }, [campaigns]);

  const transactions = useMemo(() => {
    return campaigns
      .filter((c) => {
        if (c.status === "rejected") return false;
        if (filter === "all") return true;
        return c.status === filter;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }, [campaigns, filter]);

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      <m.div variants={fadeUp}>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <Image
              src="/coin.png"
              alt="Total paid"
              width={32}
              height={32}
              className="mb-2 h-8 w-8 object-contain"
            />
            <p className="text-lg font-extrabold">
              {summary.totalPaid > 0
                ? `₹${compactNumber(summary.totalPaid)}`
                : "₹0"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Total Paid
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <Image
              src="/clock.png"
              alt="Pending"
              width={32}
              height={32}
              className="mb-2 h-8 w-8 object-contain"
            />
            <p className="text-lg font-extrabold">
              {summary.totalPending > 0
                ? `₹${compactNumber(summary.totalPending)}`
                : "₹0"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pending</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <Image
              src="/premium_target.png"
              alt="Average per campaign"
              width={32}
              height={32}
              className="mb-2 h-8 w-8 object-contain"
            />
            <p className="text-lg font-extrabold">
              {summary.avgPerCampaign > 0
                ? `₹${compactNumber(summary.avgPerCampaign)}`
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Avg / Campaign
            </p>
          </div>
        </div>
      </m.div>

      <m.div variants={fadeUp}>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all",
                filter === f.value
                  ? "bg-foreground text-background"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </m.div>

      <m.div variants={fadeUp}>
        {transactions.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center space-y-2">
            <Wallet className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm font-medium">No transactions yet</p>
            <p className="text-xs text-muted-foreground">
              Completed campaigns will show up here
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden">
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 border-b border-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Influencer
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Package
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">
                Amount
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </p>
            </div>
            <div className="divide-y divide-white/5">
              {transactions.map((c) => (
                <SpendingTransactionRow
                  key={c.id}
                  campaign={c}
                  influencerProfile={
                    c.influencer_profile_id
                      ? (ipMap.get(c.influencer_profile_id) ?? null)
                      : null
                  }
                />
              ))}
            </div>
          </div>
        )}
      </m.div>
    </m.div>
  );
}
