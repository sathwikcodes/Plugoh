"use client";

import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Banknote, Instagram, Settings2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SPRING = {
  type: "spring" as const,
  damping: 20,
  stiffness: 230,
  mass: 1.2,
};

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
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {PROFILE_TABS.map((tab) => (
        <TabPill
          key={tab.id}
          id={tab.id}
          label={tab.label}
          Icon={tab.Icon}
          isActive={activeTab === tab.id}
          onSelect={onTabChange}
        />
      ))}
    </div>
  );
}

function TabPill({
  id,
  label,
  Icon,
  isActive,
  onSelect,
}: {
  id: string;
  label: string;
  Icon: LucideIcon;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Shine fires on every activation after mount
  useEffect(() => {
    if (isActive && isLoaded) {
      // shine effect could be added here if desired
    }
  }, [isActive, isLoaded]);

  return (
    <m.div
      layoutId={"profile-tab-" + id}
      transition={{ layout: SPRING }}
      onClick={() => {
        onSelect(id);
        setIsLoaded(true);
      }}
      className="w-fit h-fit flex cursor-pointer"
      style={{ willChange: "transform" }}
    >
      <m.div
        layout
        transition={{ layout: SPRING }}
        className={cn(
          "flex items-center gap-1.5 bg-secondary shadow-md",
          "outline outline-2 outline-background overflow-hidden",
          "transition-colors duration-75 ease-out select-none",
          isActive
            ? "px-4 py-2.5 text-foreground"
            : "px-3 py-2.5 text-muted-foreground hover:text-foreground/70",
        )}
        style={{ borderRadius: "25px" }}
      >
        {/* Icon */}
        <m.div
          layoutId={"profile-tab-icon-" + id}
          className="shrink-0"
          style={{ willChange: "transform" }}
        >
          <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
        </m.div>

        {/* Label — only rendered when active */}
        {isActive && (
          <m.span
            layoutId={"profile-tab-label-" + id}
            initial={isLoaded ? { opacity: 0, filter: "blur(4px)" } : false}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: isLoaded ? 0.18 : 0,
              ease: [0.86, 0, 0.07, 1],
            }}
            className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
            style={{ willChange: "transform" }}
          >
            {label}
          </m.span>
        )}
      </m.div>
    </m.div>
  );
}

export default ProfileDiscreteTabBar;
