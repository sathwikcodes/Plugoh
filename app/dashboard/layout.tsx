"use client";

import { Navbar } from "@/components/shared/navbar";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { InfluencerTabBar } from "@/components/shared/influencer-tab-bar";
import { InfluencerSidebar } from "@/components/shared/influencer-sidebar";
import { BusinessTabBar } from "@/components/shared/business-tab-bar";
import { BusinessSidebar } from "@/components/shared/business-sidebar";
import { useAuth } from "@/contexts/auth-context";
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
  const isInfluencer = role === "influencer";
  const isBusiness = role === "business";

  return (
    <>
      <Navbar />
      {isInfluencer ? <InfluencerSidebar /> : null}
      {isBusiness ? <BusinessSidebar /> : null}
      <main
        className={cn(
          (isInfluencer || isBusiness) && "pb-20 md:pb-0 md:ml-[200px]",
        )}
      >
        {children}
      </main>
      {isInfluencer ? <InfluencerTabBar /> : null}
      {isBusiness ? <BusinessTabBar /> : null}
    </>
  );
}
