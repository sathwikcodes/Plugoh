"use client";

import { useMemo } from "react";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { BusinessDock } from "@/components/shared/business-dock";
import { InfluencerDock } from "@/components/shared/influencer-dock";
import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <DashboardShell>{children}</DashboardShell>
    </ProtectedRoute>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const pathname = usePathname();

  const { isInfluencer, isBusiness, padClass } = useMemo(() => {
    const inf =
      role === "influencer" ||
      (!role && pathname.startsWith("/dashboard/influencer"));
    const biz =
      role === "business" ||
      (!role && pathname.startsWith("/dashboard/business"));
    const isInboxPage = pathname.includes("/inbox");
    const isBusinessDiscoverHome = pathname === "/dashboard/business/discover";
    const isBusinessCampaignsHome =
      pathname === "/dashboard/business/campaigns";
    const isBusinessDashboardHome = pathname === "/dashboard/business";
    const isInfluencerDashboardHome = pathname === "/dashboard/influencer";
    const isInfluencerCampaignsHome =
      pathname === "/dashboard/influencer/campaigns";
    const shouldPad =
      (inf || biz) &&
      !isInboxPage &&
      !isBusinessDiscoverHome &&
      !isBusinessCampaignsHome &&
      !isBusinessDashboardHome &&
      !isInfluencerDashboardHome &&
      !isInfluencerCampaignsHome;
    return {
      isInfluencer: inf,
      isBusiness: biz,
      padClass: shouldPad
        ? "pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-4"
        : undefined,
    };
  }, [role, pathname]);

  return (
    <>
      <main className={cn(padClass)}>{children}</main>
      {isInfluencer ? <InfluencerDock /> : null}
      {isBusiness ? <BusinessDock /> : null}
    </>
  );
}
