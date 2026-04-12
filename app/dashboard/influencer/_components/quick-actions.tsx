"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface QuickActionItem {
  label: string;
  href: string;
  highlight?: boolean;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => (
        <Button
          key={i}
          variant={action.highlight ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-xl",
            action.highlight
              ? "bg-linear-to-r from-primary to-[#169A8D] hover:brightness-110 border-0"
              : "border-white/10",
          )}
          asChild
        >
          <Link href={action.href}>
            {action.label} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      ))}
    </div>
  );
}
