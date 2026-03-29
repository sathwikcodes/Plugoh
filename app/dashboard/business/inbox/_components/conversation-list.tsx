"use client";

import { useMemo } from "react";
import { ConversationItem } from "./conversation-item";
import type { BusinessConversation } from "@/hooks/queries/use-business-inbox-conversations";
import { SharedConversationList } from "@/components/inbox/shared-conversation-list";

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
  const rows = useMemo(
    () =>
      conversations.map((convo) => {
        const influencerName =
          convo.influencerProfile?.full_name || "Influencer";
        return {
          id: convo.campaign.id,
          searchText: `${influencerName} ${convo.campaign.title || ""}`,
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

  return (
    <SharedConversationList
      rows={rows}
      totalCount={conversations.length}
      isLoading={isLoading}
      emptySearchLabel="No results found"
      emptyIdleLabel="No conversations yet"
      emptyIdleHint="Conversations appear when brands reach out to you."
    />
  );
}
