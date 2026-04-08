"use client";

import { useMemo } from "react";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Building2, MapPin, Phone } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import {
  type BusinessIdentity,
  getBusinessLocation,
  isBusinessProfileComplete,
} from "@/lib/business-profile";
import {
  ProfileStrengthCard,
  type StrengthItem,
} from "./profile-strength-card";
import { CampaignStatsCard } from "./campaign-stats-card";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface OverviewTabProps {
  identity: BusinessIdentity;
  campaigns: Campaign[];
  onNavigateToSettings: () => void;
}

export default function BusinessOverviewTab({
  identity,
  campaigns,
  onNavigateToSettings,
}: OverviewTabProps) {
  const profile = identity.basicProfile;
  const businessProfile = identity.businessProfile;
  const location = getBusinessLocation(identity);

  const strengthItems = useMemo<StrengthItem[]>(
    () => [
      {
        label: "Brand name",
        done: !!businessProfile?.brand_name || !!profile?.business_name,
        field: "brand_name",
      },
      {
        label: "Brand type",
        done: !!businessProfile?.brand_type || !!profile?.business_type,
        field: "brand_type",
      },
      { label: "Location", done: !!location, field: "brand_location" },
      { label: "Phone number", done: !!profile?.phone, field: "phone" },
    ],
    [businessProfile, location, profile],
  );

  const completedItems = strengthItems.filter((i) => i.done).length;
  const completeness = Math.round(
    (completedItems / strengthItems.length) * 100,
  );
  const isComplete =
    completeness === 100 && isBusinessProfileComplete(identity);

  const stats = useMemo(() => {
    const total = campaigns.length;
    const completed = campaigns.filter((c) => c.status === "completed");
    const totalSpent = completed.reduce(
      (s, c) => s + (c.price_offered || 0),
      0,
    );
    const accepted = campaigns.filter(
      (c) => c.status === "accepted" || c.status === "completed",
    ).length;
    const nonRejected = campaigns.filter((c) => c.status !== "rejected").length;
    const acceptanceRate =
      nonRejected > 0 ? Math.round((accepted / nonRejected) * 100) : 0;
    return { total, completed: completed.length, totalSpent, acceptanceRate };
  }, [campaigns]);

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      <m.div variants={fadeUp}>
        <ProfileStrengthCard
          items={strengthItems}
          completeness={completeness}
          isComplete={isComplete}
          onNavigateToSettings={onNavigateToSettings}
        />
      </m.div>

      {stats.total > 0 && (
        <m.div variants={fadeUp}>
          <CampaignStatsCard stats={stats} />
        </m.div>
      )}

      {(businessProfile?.brand_type || location || profile?.phone) && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Business Details
            </p>
            <div className="space-y-2.5">
              {(businessProfile?.brand_type || profile?.business_type) && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Business Type
                    </p>
                    <p className="text-sm font-medium">
                      {businessProfile?.brand_type || profile?.business_type}
                    </p>
                  </div>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Location
                    </p>
                    <p className="text-sm font-medium">{location}</p>
                  </div>
                </div>
              )}
              {profile?.phone && (
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
