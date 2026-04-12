"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { INFLUENCER_TABS } from "@/components/shared/influencer-tab-bar";

export function InfluencerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 bottom-0 z-40 hidden w-[200px] flex-col border-r border-border bg-card/60 backdrop-blur-md md:flex">
      <nav className="flex flex-col gap-1 p-3 pt-4">
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
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary -ml-px"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              <Icon
                className="h-4.5 w-4.5 shrink-0"
                strokeWidth={active ? 2.5 : 1.5}
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
