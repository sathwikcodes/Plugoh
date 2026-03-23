"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import { Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { stagger } from "@/lib/animations";
import { ProfileDiscreteTabBar } from "@/components/ui/discrete-tab";
import BusinessProfileCardHeader from "./_components/profile-card-header";
import OverviewTab from "./_components/tabs/overview-tab";
import AnalyticsTab from "./_components/tabs/analytics-tab";
import SpendingTab from "./_components/tabs/spending-tab";
import SettingsTab from "./_components/tabs/settings-tab";

type TabValue = "overview" | "analytics" | "spending" | "settings";

const BUSINESS_TABS = [
  { id: "overview", label: "Overview" },
  { id: "analytics", label: "Analytics" },
  { id: "spending", label: "Spending" },
  { id: "settings", label: "Settings" },
];

export default function BusinessProfilePage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );
  const { data: influencerProfiles = [] } = useInfluencerProfiles();

  const loading = authLoading || campaignsLoading;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const totalCampaigns = campaigns.length;
  const totalSpent = campaigns
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (c.price_offered || 0), 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-10 container max-w-2xl py-6 pb-24">
        <m.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <BusinessProfileCardHeader
            profile={profile}
            totalCampaigns={totalCampaigns}
            totalSpent={totalSpent}
            onNavigateToSettings={() => setActiveTab("settings")}
          />

          {/* Discrete pill tab navigation */}
          <div className="flex justify-center py-1">
            <BusinessTabBar
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabValue)}
            />
          </div>

          {/* Tab content */}
          <div>
            {activeTab === "overview" && (
              <OverviewTab
                profile={profile}
                campaigns={campaigns}
                onNavigateToSettings={() => setActiveTab("settings")}
              />
            )}
            {activeTab === "analytics" && (
              <AnalyticsTab
                campaigns={campaigns}
                influencerProfiles={influencerProfiles}
              />
            )}
            {activeTab === "spending" && (
              <SpendingTab
                campaigns={campaigns}
                influencerProfiles={influencerProfiles}
              />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                profile={profile}
                userId={user.id}
                onSignOut={signOut}
              />
            )}
          </div>
        </m.div>
      </div>
    </div>
  );
}

// ── Custom tab bar for business (4 tabs with different icons) ─────────────────
import { LayoutDashboard, BarChart3, Wallet, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { m as motion } from "framer-motion";

const SPRING = {
  type: "spring" as const,
  damping: 20,
  stiffness: 230,
  mass: 1.2,
};

function BusinessTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const TABS = [
    { id: "overview", label: "Overview", Icon: LayoutDashboard },
    { id: "analytics", label: "Analytics", Icon: BarChart3 },
    { id: "spending", label: "Spending", Icon: Wallet },
    { id: "settings", label: "Settings", Icon: Settings2 },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <motion.div
            key={tab.id}
            layoutId={"biz-tab-" + tab.id}
            transition={{ layout: SPRING }}
            onClick={() => onTabChange(tab.id)}
            className="w-fit h-fit flex cursor-pointer"
            style={{ willChange: "transform" }}
          >
            <motion.div
              layout
              transition={{ layout: SPRING }}
              className={cn(
                "flex items-center gap-1.5 bg-secondary shadow-md",
                "outline-2 outline outline-background overflow-hidden",
                "transition-colors duration-75 ease-out select-none",
                isActive
                  ? "px-4 py-2.5 text-foreground"
                  : "px-3 py-2.5 text-muted-foreground hover:text-foreground/70",
              )}
              style={{ borderRadius: "25px" }}
            >
              <motion.div
                layoutId={"biz-tab-icon-" + tab.id}
                className="shrink-0"
                style={{ willChange: "transform" }}
              >
                <tab.Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              </motion.div>
              {isActive && (
                <motion.span
                  layoutId={"biz-tab-label-" + tab.id}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.18, ease: [0.86, 0, 0.07, 1] }}
                  className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ willChange: "transform" }}
                >
                  {tab.label}
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
