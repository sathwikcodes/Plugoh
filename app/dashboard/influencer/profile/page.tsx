"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  useMyInfluencerProfile,
  useUpdateInfluencerProfile,
} from "@/hooks/queries/use-influencer-profiles";
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
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };
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

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Theme</p>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <Button
                variant="outline"
                className="w-full h-11 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
