"use client";

import { MessageCircle } from "lucide-react";

export function InboxEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/4 border border-white/6 mb-5">
        <MessageCircle className="h-9 w-9 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg font-semibold text-foreground/80">
        Your Messages
      </h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-[260px]">
        Select a conversation to start messaging with brands.
      </p>
    </div>
  );
}
