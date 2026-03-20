"use client";

import { NotificationInboxPopover } from "@/components/ui/notification-inbox-popover";

export function DashboardTopBar() {
  return (
    <div className="fixed top-3 right-4 z-40">
      <NotificationInboxPopover />
    </div>
  );
}
