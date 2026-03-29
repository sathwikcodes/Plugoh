"use client";

import type { Conversation } from "@/hooks/queries/use-inbox-conversations";
import { getBusinessDisplayName } from "@/lib/business-profile";
import {
  SharedConversationItem,
  buildConversationPreview,
  formatConversationTime,
} from "@/components/inbox/shared-conversation-item";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isSelected,
  currentUserId,
  onClick,
}: ConversationItemProps) {
  const { campaign, businessProfile, lastMessage } = conversation;

  const brandName = getBusinessDisplayName(businessProfile);
  const msgPreview = lastMessage
    ? buildConversationPreview(lastMessage.content, lastMessage.message_type)
    : "No messages yet";
  const msgTime = lastMessage?.created_at || campaign.created_at;
  const isOwn = lastMessage?.sender_id === currentUserId;

  return (
    <SharedConversationItem
      name={brandName}
      campaignTitle={campaign.title || "Untitled Campaign"}
      preview={msgPreview}
      timeLabel={formatConversationTime(msgTime)}
      status={campaign.status}
      isSelected={isSelected}
      isOwn={isOwn}
      onClick={onClick}
    />
  );
}
