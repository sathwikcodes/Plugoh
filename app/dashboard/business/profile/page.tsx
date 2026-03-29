"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import { useInstagramMedia } from "@/hooks/queries/use-instagram-media";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { stagger } from "@/lib/animations";
import { toast } from "sonner";
import BusinessProfileCardHeader from "./_components/profile-card-header";
import OverviewTab from "./_components/tabs/overview-tab";
import BusinessInstagramTab from "./_components/tabs/instagram-tab";
import AnalyticsTab from "./_components/tabs/analytics-tab";
import SpendingTab from "./_components/tabs/spending-tab";
import SettingsTab from "./_components/tabs/settings-tab";
import {
  AIStatusBanner,
  ProfileTabSkeleton,
} from "@/app/dashboard/influencer/profile/_components/profile-page-skeleton";

type TabValue =
  | "instagram"
  | "overview"
  | "analytics"
  | "spending"
  | "settings";

function BusinessProfilePageInner() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const isOnboarding =
    searchParams.get("source") === "onboarding" ||
    (typeof window !== "undefined" &&
      sessionStorage.getItem("plugoh_business_ai_pending") === user?.id);

  const [activeTab, setActiveTab] = useState<TabValue>("overview");
  const [aiStatus, setAiStatus] = useState<
    "idle" | "running" | "done" | "failed"
  >(isOnboarding ? "running" : "idle");
  const aiTriggeredRef = useRef(false);

  const { data: identity, isLoading: identityLoading } = useMyBusinessProfile(
    user?.id,
    { refetchInterval: aiStatus === "running" ? 3000 : false },
  );
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );
  const { data: influencerProfiles = [] } = useInfluencerProfiles();
  const { data: media = [] } = useInstagramMedia(user?.id);

  const loading = authLoading || campaignsLoading || identityLoading;

  useEffect(() => {
    if (isOnboarding && user?.id) {
      sessionStorage.setItem("plugoh_business_ai_pending", user.id);
    }
  }, [isOnboarding, user?.id]);

  useEffect(() => {
    if (!isOnboarding || !user?.id || aiTriggeredRef.current) return;
    aiTriggeredRef.current = true;

    fetch("/api/ai/generate-business-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        setAiStatus("done");
        sessionStorage.removeItem("plugoh_business_ai_pending");
        queryClient.invalidateQueries({
          queryKey: ["my-business-profile", user.id],
        });
        queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      })
      .catch(() => {
        setAiStatus("failed");
        sessionStorage.removeItem("plugoh_business_ai_pending");
        toast.error(
          "AI suggestions unavailable — you can finish the brand profile manually.",
        );
      });
  }, [isOnboarding, queryClient, user?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile || !identity) return null;

  const totalCampaigns = campaigns.length;
  const totalSpent = campaigns
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (c.price_offered || 0), 0);
  const resolvedActiveTab =
    activeTab === "overview" &&
    isOnboarding &&
    identity.businessProfile?.ig_username
      ? "instagram"
      : activeTab;

  return (
    <div className="relative min-h-[calc(100dvh-4rem)]">
      <div className="relative z-10 container max-w-2xl py-6">
        <m.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <BusinessProfileCardHeader
            identity={identity}
            totalCampaigns={totalCampaigns}
            totalSpent={totalSpent}
            onNavigateToSettings={() => setActiveTab("settings")}
          />

          <AIStatusBanner visible={aiStatus === "running"} />

          {/* Discrete pill tab navigation */}
          <div className="flex justify-center py-1">
            <BusinessTabBar
              hasInstagram={!!identity.businessProfile?.ig_username}
              activeTab={resolvedActiveTab}
              onTabChange={(tab) => setActiveTab(tab as TabValue)}
            />
          </div>

          {/* Tab content */}
          <div>
            {aiStatus === "running" && resolvedActiveTab !== "settings" ? (
              <ProfileTabSkeleton
                tab={resolvedActiveTab === "instagram" ? "instagram" : "career"}
              />
            ) : null}
            {aiStatus !== "running" && resolvedActiveTab === "instagram" && (
              <BusinessInstagramTab
                businessProfile={identity.businessProfile!}
                media={media}
              />
            )}
            {aiStatus !== "running" && resolvedActiveTab === "overview" && (
              <OverviewTab
                identity={identity}
                campaigns={campaigns}
                onNavigateToSettings={() => setActiveTab("settings")}
              />
            )}
            {aiStatus !== "running" && resolvedActiveTab === "analytics" && (
              <AnalyticsTab
                campaigns={campaigns}
                influencerProfiles={influencerProfiles}
              />
            )}
            {aiStatus !== "running" && resolvedActiveTab === "spending" && (
              <SpendingTab
                campaigns={campaigns}
                influencerProfiles={influencerProfiles}
              />
            )}
            {resolvedActiveTab === "settings" && (
              <SettingsTab
                key={`${identity.basicProfile?.id ?? "business"}-${identity.businessProfile?.created_at ?? "initial"}-${identity.businessProfile?.brand_name ?? ""}-${identity.basicProfile?.full_name ?? ""}`}
                identity={identity}
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

export default function BusinessProfilePage() {
  return (
    <Suspense>
      <BusinessProfilePageInner />
    </Suspense>
  );
}

// ── Custom tab bar for business (4 tabs with different icons) ─────────────────
import {
  LayoutDashboard,
  BarChart3,
  Wallet,
  Settings2,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { m as motion } from "framer-motion";

const SPRING = {
  type: "spring" as const,
  damping: 20,
  stiffness: 230,
  mass: 1.2,
};

function BusinessTabBar({
  hasInstagram,
  activeTab,
  onTabChange,
}: {
  hasInstagram: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const TABS = [
    ...(hasInstagram
      ? [{ id: "instagram", label: "Instagram", Icon: Instagram }]
      : []),
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
