"use client";

import { usePathname, useRouter } from "next/navigation";
import MacOSDock from "@/components/ui/mac-os-dock";
import { DockAutoHideWrapper } from "@/components/shared/dock-auto-hide-wrapper";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
// Icon path data from lucide-react v0.577.0
const HOME_ICON = "/heart.png";

const BRIEFCASE_ICON = "/premium_target.png";

const PROFILE_ICON = "/color.png";

const WALLET_ICON = "/premium.png";

const STUDIO_ICON = "/star.png";

const MESSAGE_ICON = "/inbox.png";
const INFLUENCER_DOCK_APPS = [
  { id: "home", name: "Home", icon: HOME_ICON, href: "/dashboard/influencer" },
  {
    id: "campaigns",
    name: "Campaigns",
    icon: BRIEFCASE_ICON,
    href: "/dashboard/influencer/campaigns",
  },
  {
    id: "inbox",
    name: "Inbox",
    icon: MESSAGE_ICON,
    href: "/dashboard/influencer/inbox",
  },
  {
    id: "earnings",
    name: "Earnings",
    icon: WALLET_ICON,
    href: "/dashboard/influencer/earnings",
  },
  {
    id: "studio",
    name: "AI Creator Studio",
    icon: STUDIO_ICON,
    href: "/dashboard/influencer/creator-studio",
  },
  {
    id: "profile",
    name: "Profile",
    icon: PROFILE_ICON,
    href: "/dashboard/influencer/profile",
    separatorBefore: true,
  },
] as const;

export function InfluencerDock() {
  const pathname = usePathname();
  const router = useRouter();
  const { inboxCount, campaignsCount } = useUnreadCounts();

  const activeId = INFLUENCER_DOCK_APPS.find((app) =>
    app.href === "/dashboard/influencer"
      ? pathname === app.href
      : pathname.startsWith(app.href),
  )?.id;

  const apps = INFLUENCER_DOCK_APPS.map((app) => ({
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
          const app = INFLUENCER_DOCK_APPS.find((a) => a.id === id);
          if (app) router.push(app.href);
        }}
        openApps={activeId ? [activeId] : []}
        className="pointer-events-auto w-full md:w-auto"
      />
    </DockAutoHideWrapper>
  );
}
