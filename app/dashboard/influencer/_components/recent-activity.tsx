"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export interface RecentActivityItem {
  id: string;
  title: string;
  status: string;
  time: string;
  price: number | null;
}

interface RecentActivityProps {
  items: RecentActivityItem[];
}

export function RecentActivity({ items }: RecentActivityProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recent Activity</h2>
        <Link
          href="/dashboard/influencer/campaigns"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md divide-y divide-white/5 overflow-hidden">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/dashboard/influencer/campaigns/${item.id}`}
            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
          >
            <div
              className={cn(
                "h-2 w-2 rounded-full shrink-0",
                item.status === "pending" && "bg-yellow-500",
                item.status === "accepted" && "bg-green-500",
                item.status === "completed" && "bg-violet-500",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate">
                <span className="text-muted-foreground">
                  {item.status === "pending" && "New offer: "}
                  {item.status === "accepted" && "Active: "}
                  {item.status === "completed" && "Completed: "}
                </span>
                {item.title}
              </p>
            </div>
            {item.status === "completed" && item.price != null && (
              <span className="text-xs font-semibold text-green-400 shrink-0">
                +₹{item.price.toLocaleString()}
              </span>
            )}
            <span className="text-[11px] text-muted-foreground shrink-0">
              {item.time}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
