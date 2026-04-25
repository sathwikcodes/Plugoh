"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMyAvatar, useMyProfile } from "@/hooks/queries/use-my-identity";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import { useInstagramMedia } from "@/hooks/queries/use-instagram-media";
import { useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { m } from "framer-motion";
import { stagger } from "@/lib/animations";
import { toast } from "sonner";
import BusinessProfileCardHeader from "./_components/profile-card-header";
import BusinessInstagramTab from "./_components/tabs/instagram-tab";
import AnalyticsTab from "./_components/tabs/analytics-tab";
import SpendingTab from "./_components/tabs/spending-tab";
import SettingsTab from "./_components/tabs/settings-tab";
import {
  AIStatusBanner,
  ProfileTabSkeleton,
} from "@/app/dashboard/influencer/profile/_components/profile-page-skeleton";
import { BusinessTabBar } from "./_components/business-tab-bar";
import BusinessProfileLoading from "./loading";

type TabValue = "instagram" | "analytics" | "spending" | "settings";

function BusinessProfilePageInner() {
  const { user, authReady, signOut } = useAuth();
  const { data: profile } = useMyProfile();
  const avatarUrl = useMyAvatar();
  const searchParams = useSearchParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const hasMounted = useHasMounted();
  const fromUrl = searchParams.get("source") === "onboarding";
  const [hasPendingAi, setHasPendingAi] = useState(false);
  const isOnboarding = fromUrl || hasPendingAi;

  const [activeTab, setActiveTab] = useState<TabValue>("spending");
  const [aiStatus, setAiStatus] = useState<
    "idle" | "running" | "done" | "failed"
  >("idle");

  useEffect(() => {
    if (fromUrl && aiStatus === "idle") setAiStatus("running");
  }, [fromUrl, aiStatus]);
  const aiTriggeredRef = useRef(false);
  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasMounted || !user?.id) return;
    const pending =
      sessionStorage.getItem("plugoh_business_ai_pending") === user.id;
    if (pending) {
      setHasPendingAi(true);
      setAiStatus((prev) => (prev === "idle" ? "running" : prev));
    }
  }, [hasMounted, user?.id]);

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

  const loading = !authReady || campaignsLoading || identityLoading;

  useEffect(() => {
    if (isOnboarding && user?.id) {
      sessionStorage.setItem("plugoh_business_ai_pending", user.id);
    }
  }, [isOnboarding, user?.id]);

  useEffect(() => {
    if (!isOnboarding || !user?.id || aiTriggeredRef.current) return;
    aiTriggeredRef.current = true;

    aiTimeoutRef.current = setTimeout(() => {
      setAiStatus((prev) => {
        if (prev !== "running") return prev;
        sessionStorage.removeItem("plugoh_business_ai_pending");
        toast.error(
          "AI suggestions timed out — you can finish the brand profile manually.",
        );
        return "failed";
      });
    }, 120_000);

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
          queryKey: trpc.profile.getMyBusinessProfile.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyProfile.queryKey(),
        });
      })
      .catch(() => {
        setAiStatus("failed");
        sessionStorage.removeItem("plugoh_business_ai_pending");
        toast.error(
          "AI suggestions unavailable — you can finish the brand profile manually.",
        );
      });

    return () => {
      if (aiTimeoutRef.current) {
        clearTimeout(aiTimeoutRef.current);
        aiTimeoutRef.current = null;
      }
    };
    // trpc proxy accessors are stable within provider; exclude them to avoid false-positive re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnboarding, queryClient, user?.id]);

  if (loading) {
    return <BusinessProfileLoading />;
  }

  if (!user || !profile || !identity) return null;

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
            authAvatarUrl={avatarUrl}
          />

          <AIStatusBanner visible={aiStatus === "running"} />

          <div className="flex justify-center py-1">
            <BusinessTabBar
              hasInstagram={!!identity.businessProfile?.ig_username}
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabValue)}
            />
          </div>

          <div>
            {aiStatus === "running" && activeTab !== "settings" ? (
              <ProfileTabSkeleton
                tab={activeTab === "instagram" ? "instagram" : "career"}
              />
            ) : null}
            {aiStatus !== "running" && activeTab === "analytics" && (
              <AnalyticsTab
                campaigns={campaigns}
                influencerProfiles={influencerProfiles}
              />
            )}
            {aiStatus !== "running" && activeTab === "instagram" && (
              <BusinessInstagramTab
                businessProfile={identity.businessProfile!}
                media={media}
              />
            )}
            {aiStatus !== "running" && activeTab === "spending" && (
              <SpendingTab
                campaigns={campaigns}
                influencerProfiles={influencerProfiles}
              />
            )}
            {activeTab === "settings" && (
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
