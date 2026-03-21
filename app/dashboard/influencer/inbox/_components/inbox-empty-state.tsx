"use client";

import { MessageCircle } from "lucide-react";

export function InboxEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-5">
        <MessageCircle className="h-7 w-7 text-muted-foreground/25" />
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/[0.04] to-purple-500/[0.04]" />
      </div>
      <h3 className="text-base font-semibold text-foreground/70 tracking-tight">
        Your Messages
      </h3>
      <p className="text-sm text-muted-foreground/40 mt-2 max-w-[240px] leading-relaxed">
        Select a conversation to start messaging with brands.
      </p>
    </div>
  );
}
