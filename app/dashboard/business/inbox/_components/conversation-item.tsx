"use client";

import type { BusinessConversation } from "@/hooks/queries/use-business-inbox-conversations";
import {
  SharedConversationItem,
  buildConversationPreview,
  formatConversationTime,
} from "@/components/inbox/shared-conversation-item";
import {
  getInfluencerAvatarUrl,
  getInfluencerDisplayName,
} from "./profile-display";

interface ConversationItemProps {
  conversation: BusinessConversation;
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
  const { campaign, influencerProfile, lastMessage } = conversation;

  const influencerName = getInfluencerDisplayName(influencerProfile);
  const influencerAvatarUrl = getInfluencerAvatarUrl(influencerProfile);
  const msgPreview = lastMessage
    ? buildConversationPreview(lastMessage.content, lastMessage.message_type)
    : "No messages yet";
  const msgTime = lastMessage?.created_at || campaign.created_at;
  const isOwn = lastMessage?.sender_id === currentUserId;

  return (
    <SharedConversationItem
      name={influencerName}
      avatarUrl={influencerAvatarUrl}
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
