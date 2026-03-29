"use client";

import { useMemo } from "react";
import { getBusinessDisplayName } from "@/lib/business-profile";
import { ConversationItem } from "./conversation-item";
import type { Conversation } from "@/hooks/queries/use-inbox-conversations";
import { SharedConversationList } from "@/components/inbox/shared-conversation-list";

interface ConversationListProps {
  conversations: Conversation[];
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
        const brandName = getBusinessDisplayName(convo.businessProfile);
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
