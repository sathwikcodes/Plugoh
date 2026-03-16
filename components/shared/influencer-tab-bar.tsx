"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  MessageCircle,
  Wallet,
  CircleUserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const INFLUENCER_TABS = [
  { href: "/dashboard/influencer", icon: Home, label: "Home" },
  {
    href: "/dashboard/influencer/campaigns",
    icon: Briefcase,
    label: "Campaigns",
  },
  { href: "/dashboard/influencer/inbox", icon: MessageCircle, label: "Inbox" },
  { href: "/dashboard/influencer/earnings", icon: Wallet, label: "Earnings" },
  {
    href: "/dashboard/influencer/profile",
    icon: CircleUserRound,
    label: "Profile",
  },
] as const;

export function InfluencerTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-[50px]">
        {INFLUENCER_TABS.map((tab) => {
          const active =
            tab.href === "/dashboard/influencer"
              ? pathname === tab.href
              : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors active:scale-95",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon
                className={cn("h-[22px] w-[22px]", active && "text-pink-500")}
                strokeWidth={active ? 2.5 : 1.5}
              />
              <span
                className={cn(
                  "text-[9px] leading-none",
                  active
                    ? "font-semibold text-pink-500"
                    : "font-medium text-muted-foreground",
                )}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
