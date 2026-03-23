"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useMyInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { usePortfolioMedia } from "@/hooks/queries/use-instagram-media";
import { Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { stagger } from "@/lib/animations";
import { ProfileDiscreteTabBar } from "@/components/ui/discrete-tab";
import ProfileCard from "./_components/profile-card";
import OverviewTab from "./_components/tabs/overview-tab";
import PricingTab from "./_components/tabs/pricing-tab";
import PortfolioTab from "./_components/tabs/portfolio-tab";
import InstagramTab from "./_components/tabs/instagram-tab";
import SettingsTab from "./_components/tabs/settings-tab";

type TabValue = "overview" | "pricing" | "portfolio" | "instagram" | "settings";

export default function InfluencerProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const { data: ip, isLoading: profileLoading } = useMyInfluencerProfile(
    user?.id,
  );
  const { data: campaigns } = useCampaigns(user?.id, "influencer");
  const { data: portfolioMedia } = usePortfolioMedia(
    user?.id,
    ip?.portfolio_media_ids,
  );

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ip || !user) return null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-10 container max-w-2xl py-6 pb-24">
        <m.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <ProfileCard
            profile={ip}
            basicProfile={profile}
            onNavigateToSettings={() => setActiveTab("settings")}
          />

          {/* Discrete pill tab navigation */}
          <div className="flex justify-center py-1">
            <ProfileDiscreteTabBar
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabValue)}
            />
          </div>

          {/* Tab content */}
          <div>
            {activeTab === "overview" && (
              <OverviewTab
                profile={ip}
                campaigns={campaigns || []}
                onNavigateToTab={(tab) => setActiveTab(tab as TabValue)}
              />
            )}
            {activeTab === "pricing" && (
              <PricingTab profile={ip} userId={user.id} />
            )}
            {activeTab === "portfolio" && (
              <PortfolioTab
                profile={ip}
                portfolioMedia={portfolioMedia || []}
                userId={user.id}
              />
            )}
            {activeTab === "instagram" && <InstagramTab profile={ip} />}
            {activeTab === "settings" && (
              <SettingsTab profile={ip} userId={user.id} onSignOut={signOut} />
            )}
          </div>
        </m.div>
      </div>
    </div>
  );
}
