"use client";

import { usePathname, useRouter } from "next/navigation";
import MacOSDock from "@/components/ui/mac-os-dock";
import { DockAutoHideWrapper } from "@/components/shared/dock-auto-hide-wrapper";
import { useUnreadCounts } from "@/hooks/use-unread-counts";

// Icon path data from lucide-react v0.577.0
const HOME_ICON = "/flash.png";

const SEARCH_ICON = "/megaphone.png";

const MESSAGE_ICON = "/inbox.png";

const BRIEFCASE_ICON = "/premium_target.png";

const PROFILE_ICON = "/color.png";

const BUSINESS_DOCK_APPS = [
  { id: "home", name: "Home", icon: HOME_ICON, href: "/dashboard/business" },
  {
    id: "discover",
    name: "Discover",
    icon: SEARCH_ICON,
    href: "/dashboard/business/discover",
  },
  {
    id: "inbox",
    name: "Inbox",
    icon: MESSAGE_ICON,
    href: "/dashboard/business/inbox",
  },
  {
    id: "campaigns",
    name: "Campaigns",
    icon: BRIEFCASE_ICON,
    href: "/dashboard/business/campaigns",
  },
  {
    id: "profile",
    name: "Profile",
    icon: PROFILE_ICON,
    href: "/dashboard/business/profile",
    separatorBefore: true,
  },
] as const;

export function BusinessDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { inboxCount, campaignsCount } = useUnreadCounts();

  const activeId = BUSINESS_DOCK_APPS.find((app) =>
    app.href === "/dashboard/business"
      ? pathname === app.href
      : pathname.startsWith(app.href),
  )?.id;

  const apps = BUSINESS_DOCK_APPS.map((app) => ({
    ...app,
    badgeCount:
      app.id === "inbox"
        ? inboxCount
        : app.id === "campaigns"
          ? campaignsCount
          : undefined,
  }));

  return (
    <DockAutoHideWrapper>
      <MacOSDock
        apps={apps}
        onAppClick={(id) => {
          const app = BUSINESS_DOCK_APPS.find((a) => a.id === id);
          if (app) router.push(app.href);
        }}
        openApps={activeId ? [activeId] : []}
        className="pointer-events-auto w-full md:w-auto"
      />
    </DockAutoHideWrapper>
  );
}
