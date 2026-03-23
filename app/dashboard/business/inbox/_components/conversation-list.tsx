"use client";

import { useMemo, useState } from "react";
import { Search, MessageCircle, Loader2 } from "lucide-react";
import { m } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./conversation-item";
import { stagger, fadeUp } from "@/lib/animations";
import type { BusinessConversation } from "@/hooks/queries/use-business-inbox-conversations";

interface ConversationListProps {
  conversations: BusinessConversation[];
  selectedId: string | null;
  currentUserId: string;
  isLoading: boolean;
  onSelect: (campaignId: string) => void;
}

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
      const influencerName = c.influencerProfile?.full_name || "";
      const title = c.campaign.title || "";
      return (
        influencerName.toLowerCase().includes(q) ||
        title.toLowerCase().includes(q)
      );
    });
  }, [conversations, search]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className={cn(
              "w-full h-9 pl-9 pr-3 rounded-full text-sm",
              "bg-white/5 border border-white/8",
              "placeholder:text-muted-foreground/40",
              "focus:outline-none focus:border-white/15 focus:bg-white/7",
              "transition-colors",
            )}
          />
        </div>
      </div>

      {/* Header */}
      <div className="px-4 pb-2 shrink-0">
        <h2 className="text-base font-bold tracking-tight">Messages</h2>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/4 mb-3">
              <MessageCircle className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? "No results found" : "No conversations yet"}
            </p>
            {!search && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Conversations appear when you book influencers.
              </p>
            )}
          </div>
        ) : (
          <m.div variants={stagger} initial="hidden" animate="visible">
            {filtered.map((convo) => (
              <m.div key={convo.campaign.id} variants={fadeUp}>
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
      </ScrollArea>
    </div>
  );
}
