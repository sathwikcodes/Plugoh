"use client";

import { useMemo } from "react";
import { BarChart3, Wallet, Settings2, Instagram } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING = {
  type: "spring" as const,
  damping: 20,
  stiffness: 230,
  mass: 1.2,
};

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
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <m.div
            key={tab.id}
            layoutId={"biz-tab-" + tab.id}
            transition={{ layout: SPRING }}
            onClick={() => onTabChange(tab.id)}
            className="w-fit h-fit flex cursor-pointer"
            style={{ willChange: "transform" }}
          >
            <m.div
              layout
              transition={{ layout: SPRING }}
              className={cn(
                "flex items-center gap-1.5 bg-secondary shadow-md",
                "outline-2 outline-background overflow-hidden",
                "transition-colors duration-75 ease-out select-none",
                isActive
                  ? "px-4 py-2.5 text-foreground"
                  : "px-3 py-2.5 text-muted-foreground hover:text-foreground/70",
              )}
              style={{ borderRadius: "25px" }}
            >
              <m.div
                layoutId={"biz-tab-icon-" + tab.id}
                className="shrink-0"
                style={{ willChange: "transform" }}
              >
                <tab.Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              </m.div>
              {isActive && (
                <m.span
                  layoutId={"biz-tab-label-" + tab.id}
                  initial={{ opacity: 0, filter: "blur(4px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.18, ease: [0.86, 0, 0.07, 1] }}
                  className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ willChange: "transform" }}
                >
                  {tab.label}
                </m.span>
              )}
            </m.div>
          </m.div>
        );
      })}
    </div>
  );
}
