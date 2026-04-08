"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMyInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useInstagramMedia } from "@/hooks/queries/use-instagram-media";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { Loader2 } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { stagger } from "@/lib/animations";
import { ProfileDiscreteTabBar } from "@/components/ui/discrete-tab";
import { toast } from "sonner";
import ProfileCard from "./_components/profile-card";
import InstagramTab from "./_components/tabs/instagram-tab";
import PricingTab from "./_components/tabs/pricing-tab";
import CareerTab from "./_components/tabs/career-tab";
import SettingsTab from "./_components/tabs/settings-tab";
import {
  AIStatusBanner,
  ProfileTabSkeleton,
} from "./_components/profile-page-skeleton";

type TabValue = "instagram" | "pricing" | "career" | "settings";

function InfluencerProfilePageInner() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const searchParams = useSearchParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Detect first-load from onboarding (survives refresh via sessionStorage)
  const isOnboarding =
    searchParams.get("source") === "onboarding" ||
    (typeof window !== "undefined" &&
      sessionStorage.getItem("plugoh_ai_pending") === user?.id);

  const [activeTab, setActiveTab] = useState<TabValue>("instagram");
  const [aiStatus, setAiStatus] = useState<
    "idle" | "running" | "done" | "failed"
  >(isOnboarding ? "running" : "idle");
  const aiTriggeredRef = useRef(false);

  const { data: ip, isLoading: profileLoading } = useMyInfluencerProfile(
    user?.id,
    { refetchInterval: aiStatus === "running" ? 3000 : false },
  );
  const { data: igMedia } = useInstagramMedia(user?.id);
  const { data: campaigns } = useCampaigns(user?.id, "influencer");

  const loading = authLoading || profileLoading;

  // Persist onboarding state across refreshes
  useEffect(() => {
    if (isOnboarding && user?.id) {
      sessionStorage.setItem("plugoh_ai_pending", user.id);
    }
  }, [isOnboarding, user?.id]);

  // Trigger AI profile generation once on onboarding land
  useEffect(() => {
    if (!isOnboarding || !user?.id || aiTriggeredRef.current) return;
    aiTriggeredRef.current = true;

    fetch("/api/ai/generate-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(() => {
        setAiStatus("done");
        sessionStorage.removeItem("plugoh_ai_pending");
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyInfluencerProfile.queryKey(),
        });
      })
      .catch(() => {
        setAiStatus("failed");
        sessionStorage.removeItem("plugoh_ai_pending");
        toast.error(
          "AI suggestions unavailable — you can fill in your details manually.",
        );
      });
  }, [isOnboarding, user?.id, queryClient]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ip || !user) return null;

  const showSkeleton = aiStatus === "running";

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

          {/* AI analyzing banner */}
          <AIStatusBanner visible={showSkeleton} />

          {/* Discrete pill tab navigation */}
          <div className="flex justify-center py-1">
            <ProfileDiscreteTabBar
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabValue)}
            />
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {showSkeleton && activeTab !== "settings" ? (
              <ProfileTabSkeleton
                key="skeleton"
                tab={
                  activeTab === "career"
                    ? "career"
                    : activeTab === "pricing"
                      ? "pricing"
                      : "instagram"
                }
              />
            ) : (
              <m.div
                key="content"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                {activeTab === "instagram" && (
                  <InstagramTab profile={ip} media={igMedia ?? []} />
                )}
                {activeTab === "pricing" && (
                  <PricingTab profile={ip} userId={user.id} />
                )}
                {activeTab === "career" && (
                  <CareerTab campaigns={campaigns ?? []} />
                )}
                {activeTab === "settings" && (
                  <SettingsTab
                    profile={ip}
                    userId={user.id}
                    onSignOut={signOut}
                  />
                )}
              </m.div>
            )}
          </AnimatePresence>
        </m.div>
      </div>
    </div>
  );
}

export default function InfluencerProfilePage() {
  return (
    <Suspense>
      <InfluencerProfilePageInner />
    </Suspense>
  );
}
