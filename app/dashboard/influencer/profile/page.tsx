"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useMyInfluencerProfile, useUpdateInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { usePortfolioMedia } from "@/hooks/queries/use-instagram-media";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { stagger } from "@/lib/animations";
import ProfileHeader from "./_components/profile-header";
import ProfileStrength from "./_components/profile-strength";
import RateCard from "./_components/rate-card";
import CareerStats from "./_components/career-stats";
import PortfolioSection from "./_components/portfolio-section";
import SocialProof from "./_components/social-proof";

export default function InfluencerProfilePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const { data: ip, isLoading: profileLoading } = useMyInfluencerProfile(
    user?.id,
  );
  const { data: campaigns } = useCampaigns(user?.id, "influencer");
  const { data: portfolioMedia } = usePortfolioMedia(
    user?.id,
    ip?.portfolio_media_ids,
  );

  const updateProfile = useUpdateInfluencerProfile();

  const handleToggleActive = async (active: boolean) => {
    if (!user) return;
    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        data: { is_active: active },
      });
      toast({
        title: active ? "Profile is now live" : "Profile hidden",
        description: active
          ? "Brands can now discover you."
          : "Your profile is hidden from brands.",
      });
    } catch {
      toast({
        title: "Failed to update",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const loading = authLoading || profileLoading;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ip) {
    router.push("/dashboard/influencer");
    return null;
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      <div className="relative z-10 container max-w-2xl py-6 pb-24 space-y-5">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-5"
        >
          <ProfileHeader
            profile={ip}
            fullName={profile?.full_name}
            onToggleActive={handleToggleActive}
            isToggling={updateProfile.isPending}
          />

          <ProfileStrength profile={ip} />

          <RateCard profile={ip} />

          <CareerStats campaigns={campaigns || []} />

          <PortfolioSection media={portfolioMedia || []} />

          <SocialProof brands={ip.previous_brands} />
        </motion.div>
      </div>
    </div>
  );
}
