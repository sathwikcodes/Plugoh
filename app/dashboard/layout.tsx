"use client";

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
  const isInfluencer = role === "influencer";
  const isBusiness = role === "business";
  const isInboxPage = pathname.includes("/inbox");

  return (
    <>
      <main
        className={cn(
          (isInfluencer || isBusiness) &&
            !isInboxPage &&
            "pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-4",
        )}
      >
        {children}
      </main>
      {isInfluencer ? <InfluencerDock /> : null}
      {isBusiness ? <BusinessDock /> : null}
    </>
  );
}
