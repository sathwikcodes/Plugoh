"use client";

import { MessageCircle } from "lucide-react";

interface SharedEmptyStateProps {
  hint: string;
}

export function SharedEmptyState({ hint }: SharedEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5">
        <MessageCircle className="h-7 w-7 text-muted-foreground/25" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/[0.04] to-primary/[0.02]" />
      </div>
      <h3 className="text-base font-semibold text-foreground/70 tracking-tight">
        Your Messages
      </h3>
      <p className="text-sm text-muted-foreground/40 mt-2 max-w-[240px] leading-relaxed">
        {hint}
      </p>
    </div>
  );
}
