"use client";

import { usePathname, useRouter } from "next/navigation";
import MacOSDock from "@/components/ui/mac-os-dock";
import { useUnreadCounts } from "@/hooks/use-unread-counts";
// Icon path data from lucide-react v0.577.0
const HOME_ICON = "/flash.png";

const BRIEFCASE_ICON = "/premium_target.png";

const PROFILE_ICON = "/color.png";

const WALLET_ICON = "/premium.png";

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
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 md:px-0"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
    >
      <MacOSDock
        apps={apps}
        onAppClick={(id) => {
          const app = INFLUENCER_DOCK_APPS.find((a) => a.id === id);
          if (app) router.push(app.href);
        }}
        openApps={activeId ? [activeId] : []}
        className="pointer-events-auto w-full md:w-auto"
      />
    </div>
  );
}
