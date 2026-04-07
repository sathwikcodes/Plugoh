"use client";

import { useMemo } from "react";
import { Loader2, Search } from "lucide-react";
import { m } from "framer-motion";
import { ConversationItem } from "./conversation-item";
import type { Conversation } from "@/hooks/queries/use-inbox-conversations";
import { getBrandDisplayName } from "./profile-display";

interface ConversationListProps {
  conversations: Conversation[];
  searchQuery: string;
  selectedId: string | null;
  currentUserId: string;
  isLoading: boolean;
  onSelect: (campaignId: string) => void;
}

export function ConversationList({
  conversations,
  searchQuery,
  selectedId,
  currentUserId,
  isLoading,
  onSelect,
}: ConversationListProps) {
  const rows = useMemo(
    () =>
      conversations.map((convo) => {
        const brandName = getBrandDisplayName(convo.businessProfile);
        return {
          id: convo.campaign.id,
          searchText: `${brandName} ${convo.campaign.title || ""}`,
          node: (
            <ConversationItem
              conversation={convo}
              isSelected={selectedId === convo.campaign.id}
              currentUserId={currentUserId}
              onClick={() => onSelect(convo.campaign.id)}
            />
          ),
        };
      }),
    [conversations, currentUserId, onSelect, selectedId],
  );

  const filteredRows = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      row.searchText.toLowerCase().includes(normalized),
    );
  }, [rows, searchQuery]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-white/35" />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/4">
              <Search className="h-5 w-5 text-white/35" />
            </div>
            <p className="text-sm font-medium text-white/78">
              {searchQuery ? "No results found" : "No conversations yet"}
            </p>
            <p className="mt-1.5 max-w-60 text-xs leading-5 text-white/40">
              {searchQuery
                ? "Try a different brand name or campaign title."
                : "Conversations appear when brands reach out to you."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRows.map((row, index) => (
              <m.div
                key={row.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: index * 0.03 }}
              >
                {row.node}
              </m.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
