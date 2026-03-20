"use client";

import { ProtectedRoute } from "@/components/shared/protected-route";
import { BusinessDock } from "@/components/shared/business-dock";
import { InfluencerDock } from "@/components/shared/influencer-dock";
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
      <main className={cn((isInfluencer || isBusiness) && "pb-24")}>
        {children}
      </main>
      {isInfluencer ? <InfluencerDock /> : null}
      {isBusiness ? <BusinessDock /> : null}
    </>
  );
}
