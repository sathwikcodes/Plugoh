"use client";

import { useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { ConversationItem } from "./conversation-item";
import type { Conversation } from "@/hooks/queries/use-inbox-conversations";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  isLoading: boolean;
  onSelect: (campaignId: string) => void;
}

const listStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const itemFade = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) => {
      const brandName =
        c.businessProfile?.business_name || c.businessProfile?.full_name || "";
      const title = c.campaign.title || "";
      return (
        brandName.toLowerCase().includes(q) || title.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-5 pt-5 pb-1 shrink-0">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold tracking-tight">Messages</h2>
          {conversations.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground/50 bg-white/[0.04] px-2 py-0.5 rounded-full tabular-nums">
              {conversations.length}
            </span>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-xl text-sm",
              "bg-white/[0.03] border border-white/[0.06]",
              "placeholder:text-muted-foreground/30",
              "focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.05]",
              "transition-all duration-200",
            )}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.04] shrink-0" />

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto min-h-0 py-1.5">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
              <Search className="h-5 w-5 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/70">
              {search ? "No results found" : "No conversations yet"}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/40 mt-1.5 max-w-[200px]">
                Conversations appear when brands reach out to you.
              </p>
            )}
          </div>
        ) : (
          <m.div
            className="px-2 space-y-0.5"
            variants={listStagger}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((convo) => (
              <m.div
                key={convo.campaign.id}
                variants={itemFade}
                style={{
                  contentVisibility: "auto",
                  containIntrinsicSize: "0 76px",
                }}
              >
                <ConversationItem
                  conversation={convo}
                  isSelected={selectedId === convo.campaign.id}
                  currentUserId={currentUserId}
                  onClick={() => onSelect(convo.campaign.id)}
                />
              </m.div>
            ))}
          </m.div>
        )}
      </div>
    </div>
  );
}
