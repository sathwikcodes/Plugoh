import type { ReactNode } from "react";
import { DashboardBackground } from "@/components/shared/dashboard-background";

export default function InfluencerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden md:min-h-dvh bg-background">
      <DashboardBackground />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
