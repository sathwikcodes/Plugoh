"use client";

import { Banknote, Instagram, Settings2 } from "lucide-react";
import { ThreeDPill } from "@/components/ui/3d-pill";

const PROFILE_TABS = [
  { id: "pricing", label: "Pricing", Icon: Banknote },
  { id: "instagram", label: "Instagram", Icon: Instagram },
  { id: "settings", label: "Settings", Icon: Settings2 },
] as const;

export function ProfileDiscreteTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {PROFILE_TABS.map((tab) => {
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

export default ProfileDiscreteTabBar;
