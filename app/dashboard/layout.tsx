"use client";

import { Navbar } from "@/components/shared/navbar";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { InfluencerTabBar } from "@/components/shared/influencer-tab-bar";
import { InfluencerSidebar } from "@/components/shared/influencer-sidebar";
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

  return (
    <>
      <Navbar />
      {isInfluencer ? <InfluencerSidebar /> : null}
      <main className={cn(isInfluencer && "pb-20 md:pb-0 md:ml-[200px]")}>
        {children}
      </main>
      {isInfluencer ? <InfluencerTabBar /> : null}
    </>
  );
}
