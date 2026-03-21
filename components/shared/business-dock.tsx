"use client";

import { usePathname, useRouter } from "next/navigation";
import MacOSDock from "@/components/ui/mac-os-dock";
import { DockAutoHideWrapper } from "@/components/shared/dock-auto-hide-wrapper";
import { makeDockIcon } from "@/lib/dock-icon-utils";
import { useUnreadCounts } from "@/hooks/use-unread-counts";

// Icon path data from lucide-react v0.577.0
const HOME_ICON = makeDockIcon([
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
    },
  ],
]);

const SEARCH_ICON = makeDockIcon([
  ["path", { d: "m21 21-4.34-4.34" }],
  ["circle", { cx: "11", cy: "11", r: "8" }],
]);

const MESSAGE_ICON = makeDockIcon([
  [
    "path",
    {
      d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
    },
  ],
]);

const BRIEFCASE_ICON = makeDockIcon([
  ["path", { d: "M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" }],
  ["rect", { width: "20", height: "14", x: "2", y: "6", rx: "2" }],
]);

const PROFILE_ICON = makeDockIcon([
  ["path", { d: "M18 20a6 6 0 0 0-12 0" }],
  ["circle", { cx: "12", cy: "10", r: "4" }],
  ["circle", { cx: "12", cy: "12", r: "10" }],
]);

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
