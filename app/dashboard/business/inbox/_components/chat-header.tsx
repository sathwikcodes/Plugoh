"use client";

import { SharedChatHeader } from "@/components/inbox/shared-chat-header";

interface ChatHeaderProps {
  influencerName: string;
  campaignTitle: string;
  status: string;
  onBack: () => void;
}

export function ChatHeader({
  influencerName,
  campaignTitle,
  status,
  onBack,
}: ChatHeaderProps) {
  return (
    <SharedChatHeader
      participantName={influencerName}
      campaignTitle={campaignTitle}
      status={status}
      onBack={onBack}
    />
  );
}
