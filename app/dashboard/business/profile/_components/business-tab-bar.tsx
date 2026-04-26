"use client";

import { useMemo } from "react";
import { BarChart3, Wallet, Settings2, Instagram } from "lucide-react";
import { ThreeDPill } from "@/components/ui/3d-pill";

const BASE_TABS = [
  { id: "spending", label: "Spending", Icon: Wallet },
  { id: "analytics", label: "Analytics", Icon: BarChart3 },
  { id: "settings", label: "Settings", Icon: Settings2 },
] as const;

const INSTAGRAM_TAB = {
  id: "instagram",
  label: "Instagram",
  Icon: Instagram,
} as const;

export function BusinessTabBar({
  hasInstagram,
  activeTab,
  onTabChange,
}: {
  hasInstagram: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const tabs = useMemo(
    () =>
      hasInstagram
        ? [BASE_TABS[0], INSTAGRAM_TAB, BASE_TABS[1], BASE_TABS[2]]
        : [...BASE_TABS],
    [hasInstagram],
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <ThreeDPill
            key={tab.id}
            label={tab.label}
            color={isActive ? "gold" : "slate"}
            icon={<tab.Icon size={13} className="shrink-0" />}
            onClick={() => onTabChange(tab.id)}
            className="cursor-pointer select-none"
          />
        );
      })}
    </div>
  );
}
