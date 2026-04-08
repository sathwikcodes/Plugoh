"use client";

import Link from "next/link";
import { ChevronRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface InfluencerInfo {
  id: string;
  display_name: string | null;
  ig_profile_picture_url: string | null;
  ig_username: string | null;
}

export interface ActiveCampaignCard {
  campaign: Campaign;
  influencer: InfluencerInfo | null;
}

interface ActiveCampaignsOverviewProps {
  items: ActiveCampaignCard[];
}

const STATUS_DOT: Record<string, string> = {
  pending: "bg-yellow-500",
  accepted: "bg-green-500",
  completed: "bg-violet-500",
  rejected: "bg-gray-500",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  accepted: "Active",
  completed: "Done",
  rejected: "Rejected",
};

export function ActiveCampaignsOverview({
  items,
}: ActiveCampaignsOverviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Active Campaigns</h2>
        <Link
          href="/dashboard/business/campaigns"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 mb-4">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold">No active campaigns</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Discover and book influencers to launch your first campaign
          </p>
          <Button asChild size="sm" className="mt-4 rounded-xl">
            <Link href="/dashboard/business/discover">Browse Influencers</Link>
          </Button>
        </div>
      ) : (
        <div
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map(({ campaign, influencer }) => {
            const initials = (influencer?.display_name || campaign.title || "?")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Link
                key={campaign.id}
                href={`/dashboard/business/campaigns/${campaign.id}`}
                className="snap-start shrink-0 w-[180px] sm:w-[200px] rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden group transition-all hover:border-white/20 hover:scale-[1.02]"
              >
                <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-[#FF7A59]" />

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    {influencer?.ig_profile_picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={influencer.ig_profile_picture_url}
                        alt={influencer.display_name || ""}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white/60">
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate leading-tight">
                        {influencer?.display_name || "Influencer"}
                      </p>
                      {influencer?.ig_username && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          @{influencer.ig_username}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {campaign.package_type || "Campaign"}
                    </p>
                    <p className="text-base font-extrabold tracking-tight">
                      ₹{(campaign.price_offered || 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        STATUS_DOT[campaign.status] || "bg-gray-500",
                      )}
                    />
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {STATUS_LABEL[campaign.status] || campaign.status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
