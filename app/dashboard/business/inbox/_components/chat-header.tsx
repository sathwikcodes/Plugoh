"use client";

import { SharedChatHeader } from "@/components/inbox/shared-chat-header";

interface ChatHeaderProps {
  influencerName: string;
  avatarUrl?: string | null;
  campaignTitle: string;
  status: string;
  onBack: () => void;
}

export function ChatHeader({
  influencerName,
  avatarUrl,
  campaignTitle,
  status,
  onBack,
}: ChatHeaderProps) {
  return (
    <SharedChatHeader
      participantName={influencerName}
      avatarUrl={avatarUrl}
      campaignTitle={campaignTitle}
      status={status}
      onBack={onBack}
    />
  );
}
